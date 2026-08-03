using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Domain.Entities;
using JQZHomeCareProject.Domain.Enums;

namespace JQZHomeCareProject.Application.Services
{

    public class VisitService : IVisitService
    {
        private readonly IVisitRepository _visitRepository;
        private readonly IPatientPackageRepository _patientPackageRepository;
        private readonly IPackageRepository _packageRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IPatientService _patientService;
        private readonly IUnitOfWork _unitOfWork;

        public VisitService(
            IVisitRepository visitRepository,
            IPatientPackageRepository patientPackageRepository,
            IPackageRepository packageRepository,
            IPatientRepository patientRepository,
            IPatientService patientService,
            IUnitOfWork unitOfWork)
        {
            _visitRepository = visitRepository;
            _patientPackageRepository = patientPackageRepository;
            _packageRepository = packageRepository;
            _patientRepository = patientRepository;
            _patientService = patientService;
            _unitOfWork = unitOfWork;
        }

        public async Task<PatientPackageDto> CreateVisitAsync(CreateVisitDto dto, Guid createdByUserId)
        {
            var package = await _packageRepository.GetByIdAsync(dto.PackageId)
                ?? throw new NotFoundException($"Package {dto.PackageId} not found.");

            if (dto.VisitAssignments.Count > package.NumberOfVisits)
                throw new ValidationException(
                    $"'{package.Name}' has {package.NumberOfVisits} visit(s); {dto.VisitAssignments.Count} assignment(s) were supplied.");

            if (dto.PaymentType == PackagePaymentType.Installment && dto.InitialAmountPaid is null)
                throw new ValidationException("InitialAmountPaid is required when PaymentType is Installment.");

            var patient = await _patientService.GetOrCreateAsync(dto.PatientName, dto.PatientPhone, dto.LocationAddress);

            CheckAssignmentsAgainstEachOther(dto.VisitAssignments);

            foreach (var assignment in dto.VisitAssignments)
                await EnsureNoConflictAsync(assignment.PractitionerId, patient.Id, assignment.ScheduledDate, assignment.SlotStart, assignment.SlotEnd);

            PatientPackage patientPackage = null!;
            List<Visit> visits = null!;

            await _unitOfWork.ExecuteInTransactionAsync(async () =>
            {
                var amountPaid = dto.PaymentType == PackagePaymentType.FullAdvance
                    ? package.Amount
                    : dto.InitialAmountPaid!.Value;

                patientPackage = new PatientPackage
                {
                    Id = Guid.NewGuid(),
                    PatientId = patient.Id,
                    PackageId = package.Id,
                    PaymentType = dto.PaymentType,
                    TotalAmount = package.Amount,
                    AmountPaid = amountPaid,
                    AmountPending = package.Amount - amountPaid,
                    Status = PatientPackageStatus.Active,
                    PurchaseDate = DateTime.UtcNow
                };
                await _patientPackageRepository.AddAsync(patientPackage);

                var amountDuePerVisit = Math.Round(package.Amount / package.NumberOfVisits, 2, MidpointRounding.AwayFromZero);
                visits = new List<Visit>(package.NumberOfVisits);

                for (var i = 0; i < package.NumberOfVisits; i++)
                {
                    var assignment = i < dto.VisitAssignments.Count ? dto.VisitAssignments[i] : null;

                    visits.Add(new Visit
                    {
                        Id = Guid.NewGuid(),
                        PatientId = patient.Id,
                        PractitionerId = assignment?.PractitionerId,   
                        AreaId = assignment?.AreaId,                   
                        ServiceId = package.ServiceId,
                        PatientPackageId = patientPackage.Id,
                        ScheduledDate = assignment?.ScheduledDate,
                        SlotStart = assignment?.SlotStart,
                        SlotEnd = assignment?.SlotEnd,
                        Status = VisitStatus.Scheduled,
                        AmountDue = amountDuePerVisit,
                        CollectionStatus = CollectionStatus.Pending,
                        CreatedByUserId = createdByUserId
                    });
                }
                await _visitRepository.AddRangeAsync(visits);
                await _patientRepository.IncrementVisitCountAsync(patient.Id, package.NumberOfVisits);
            });

            return new PatientPackageDto
            {
                Id = patientPackage.Id,
                PatientId = patient.Id,
                PatientName = patient.Name,
                PackageId = package.Id,
                PackageName = package.Name,
                PaymentType = patientPackage.PaymentType,
                TotalAmount = patientPackage.TotalAmount,
                AmountPaid = patientPackage.AmountPaid,
                AmountPending = patientPackage.AmountPending,
                Status = patientPackage.Status,
                PurchaseDate = patientPackage.PurchaseDate,
                Visits = visits.Select(VisitMapper.ToDto).ToList()
            };
        }

        public async Task RecordInstallmentAsync(Guid patientPackageId, RecordInstallmentDto dto)
        {
            var patientPackage = await _patientPackageRepository.GetByIdAsync(patientPackageId)
                ?? throw new NotFoundException($"PatientPackage {patientPackageId} not found.");

            if (dto.Amount <= 0)
                throw new ValidationException("Installment amount must be greater than zero.");
            if (dto.Amount > patientPackage.AmountPending)
                throw new ValidationException("Installment amount exceeds the amount pending.");

            patientPackage.AmountPaid += dto.Amount;
            patientPackage.AmountPending -= dto.Amount;
            if (patientPackage.AmountPending == 0 && patientPackage.Status == PatientPackageStatus.Active)
                patientPackage.Status = PatientPackageStatus.Completed;

            await _patientPackageRepository.UpdateAsync(patientPackage);
        }

        private static bool Overlaps(TimeSpan aStart, TimeSpan aEnd, TimeSpan bStart, TimeSpan bEnd)
            => aStart < bEnd && bStart < aEnd;

        private static void CheckAssignmentsAgainstEachOther(List<VisitAssignmentDto> assignments)
        {
            for (var i = 0; i < assignments.Count; i++)
            {
                var a = assignments[i];
                if (a.ScheduledDate is null || a.SlotStart is null || a.SlotEnd is null) continue;

                for (var j = i + 1; j < assignments.Count; j++)
                {
                    var b = assignments[j];
                    if (b.ScheduledDate is null || b.SlotStart is null || b.SlotEnd is null) continue;
                    if (a.ScheduledDate.Value.Date != b.ScheduledDate.Value.Date) continue;
                    if (!Overlaps(a.SlotStart.Value, a.SlotEnd.Value, b.SlotStart.Value, b.SlotEnd.Value)) continue;
                    if (a.PractitionerId.HasValue && a.PractitionerId == b.PractitionerId)
                        throw new ValidationException($"Visit assignments #{i + 1} and #{j + 1} assign the same practitioner to overlapping time slots.");

                    throw new ValidationException($"Visit assignments #{i + 1} and #{j + 1} overlap for the same patient.");
                }
            }
        }

        private async Task EnsureNoConflictAsync(
            Guid? practitionerId, Guid patientId,
            DateTime? scheduledDate, TimeSpan? slotStart, TimeSpan? slotEnd,
            Guid? excludeVisitId = null)
        {
            if (scheduledDate is null || slotStart is null || slotEnd is null)
                return;

            if (practitionerId.HasValue)
            {
                var practitionerVisits = await _visitRepository.GetByPractitionerAndDateAsync(practitionerId.Value, scheduledDate.Value.Date);
                foreach (var v in practitionerVisits)
                {
                    if (v.Id == excludeVisitId) continue;
                    if (v.Status == VisitStatus.Cancelled) continue;
                    if (v.SlotStart is null || v.SlotEnd is null) continue;
                    if (Overlaps(slotStart.Value, slotEnd.Value, v.SlotStart.Value, v.SlotEnd.Value))
                        throw new ValidationException(
                            $"Practitioner already has a visit from {v.SlotStart} to {v.SlotEnd} on {scheduledDate:d} — overlaps with {slotStart}-{slotEnd}.");
                }
            }

            var patientVisits = await _visitRepository.GetByPatientAndDateAsync(patientId, scheduledDate.Value.Date);
            foreach (var v in patientVisits)
            {
                if (v.Id == excludeVisitId) continue;
                if (v.Status == VisitStatus.Cancelled) continue;
                if (v.SlotStart is null || v.SlotEnd is null) continue;
                if (Overlaps(slotStart.Value, slotEnd.Value, v.SlotStart.Value, v.SlotEnd.Value))
                    throw new ValidationException(
                        $"Patient already has a visit from {v.SlotStart} to {v.SlotEnd} on {scheduledDate:d} — overlaps with {slotStart}-{slotEnd}.");
            }
        }


        public async Task ScheduleVisitAsync(Guid visitId, ScheduleVisitDto dto)
        {
            var visit = await _visitRepository.GetByIdAsync(visitId)
                ?? throw new NotFoundException($"Visit {visitId} not found.");

            await EnsureNoConflictAsync(visit.PractitionerId, visit.PatientId, dto.ScheduledDate, dto.SlotStart, dto.SlotEnd, excludeVisitId: visitId);

            visit.ScheduledDate = dto.ScheduledDate;
            visit.SlotStart = dto.SlotStart;
            visit.SlotEnd = dto.SlotEnd;
            await _visitRepository.UpdateAsync(visit);
        }

        public async Task AssignAsync(Guid visitId, AssignVisitDto dto)
        {
            var visit = await _visitRepository.GetByIdAsync(visitId)
                ?? throw new NotFoundException($"Visit {visitId} not found.");
            await EnsureNoConflictAsync(dto.PractitionerId, visit.PatientId, visit.ScheduledDate, visit.SlotStart, visit.SlotEnd, excludeVisitId: visitId);

            visit.PractitionerId = dto.PractitionerId;
            if (dto.AreaId.HasValue) visit.AreaId = dto.AreaId;
            await _visitRepository.UpdateAsync(visit);
        }

        public async Task ReassignPractitionerAsync(Guid visitId, ReassignPractitionerDto dto)
        {
            var visit = await _visitRepository.GetByIdAsync(visitId)
                ?? throw new NotFoundException($"Visit {visitId} not found.");

            await EnsureNoConflictAsync(dto.PractitionerId, visit.PatientId, visit.ScheduledDate, visit.SlotStart, visit.SlotEnd, excludeVisitId: visitId);

            visit.Refusals.Add(new Refusal
            {
                Id = Guid.NewGuid(),
                VisitId = visit.Id,
                RefusedBy = dto.RefusedBy,
                Reason = dto.Reason,
                Date = DateTime.UtcNow
            });

            visit.PractitionerId = dto.PractitionerId;
            if (dto.AreaId.HasValue) visit.AreaId = dto.AreaId;
            visit.Status = VisitStatus.Scheduled;
            await _visitRepository.UpdateAsync(visit);
        }

        public async Task AcceptVisitAsync(Guid visitId, Guid practitionerId)
        {
            var visit = await _visitRepository.GetByIdAsync(visitId)
                ?? throw new NotFoundException($"Visit {visitId} not found.");
            if (visit.PractitionerId != practitionerId)
                throw new ValidationException("This visit is not assigned to you.");

            visit.Status = VisitStatus.Accepted;
            await _visitRepository.UpdateAsync(visit);
        }

        public async Task CheckInAsync(Guid visitId, CheckInDto dto)
        {
            var visit = await _visitRepository.GetByIdAsync(visitId)
                ?? throw new NotFoundException($"Visit {visitId} not found.");

            visit.CheckInTime = dto.Timestamp;
            visit.CheckInLocation = $"{dto.Latitude},{dto.Longitude}";
            await _visitRepository.UpdateAsync(visit);
        }

        public async Task CheckOutAsync(Guid visitId, CheckOutDto dto)
        {
            var visit = await _visitRepository.GetByIdAsync(visitId)
                ?? throw new NotFoundException($"Visit {visitId} not found.");

            if (dto.ReceivedBy == ReceivedByType.Practitioner && dto.AmountReceived is null)
                throw new ValidationException("AmountReceived is required when ReceivedBy is Practitioner.");

            visit.CheckOutTime = dto.Timestamp;
            visit.CheckOutLocation = $"{dto.Latitude},{dto.Longitude}";
            visit.ReceivedBy = dto.ReceivedBy;
            visit.AmountReceived = dto.ReceivedBy == ReceivedByType.Practitioner ? dto.AmountReceived!.Value : 0;
            visit.CollectionStatus = CollectionStatus.Pending;
            visit.Status = VisitStatus.Completed;
            await _visitRepository.UpdateAsync(visit);
        }

        public async Task CancelVisitAsync(Guid visitId, CancelVisitDto dto)
        {
            var visit = await _visitRepository.GetByIdAsync(visitId)
                ?? throw new NotFoundException($"Visit {visitId} not found.");

            visit.Refusals.Add(new Refusal
            {
                Id = Guid.NewGuid(),
                VisitId = visit.Id,
                RefusedBy = dto.RefusedBy,
                Reason = dto.Reason,
                Date = DateTime.UtcNow
            });
            visit.Status = VisitStatus.Cancelled;
            await _visitRepository.UpdateAsync(visit);
        }

        public async Task<IEnumerable<VisitDto>> GetTodayVisitsAsync(Guid? practitionerId)
            => (await _visitRepository.GetTodayAsync(practitionerId)).Select(VisitMapper.ToDto);

        public async Task<IEnumerable<VisitDto>> GetByDateAsync(DateTime date)
            => (await _visitRepository.GetByDateAsync(date)).Select(VisitMapper.ToDto);

        public async Task<IEnumerable<VisitDto>> GetAllAsync()
            => (await _visitRepository.GetAllAsync()).Select(VisitMapper.ToDto);

        public async Task<VisitDto> GetByIdAsync(Guid id)
        {
            var visit = await _visitRepository.GetByIdAsync(id)
                ?? throw new NotFoundException($"Visit {id} not found.");
            return VisitMapper.ToDto(visit);
        }
    }
}