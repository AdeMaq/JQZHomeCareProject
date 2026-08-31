using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.Common.Validation;
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
        private readonly IPractitionerRepository _practitionerRepository;
        private readonly IAreaRepository _areaRepository;
        private readonly IUnitOfWork _unitOfWork;

        public VisitService(
            IVisitRepository visitRepository,
            IPatientPackageRepository patientPackageRepository,
            IPackageRepository packageRepository,
            IPatientRepository patientRepository,
            IPatientService patientService,
            IPractitionerRepository practitionerRepository,
            IAreaRepository areaRepository,
            IUnitOfWork unitOfWork)
        {
            _visitRepository = visitRepository;
            _patientPackageRepository = patientPackageRepository;
            _packageRepository = packageRepository;
            _patientRepository = patientRepository;
            _patientService = patientService;
            _practitionerRepository = practitionerRepository;
            _areaRepository = areaRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<PatientPackageDto> CreateVisitAsync(CreateVisitDto dto, Guid createdByUserId)
        {
            Guard.EnsureNotEmpty(dto.PackageId, "PackageId");

            var package = await _packageRepository.GetByIdAsync(dto.PackageId)
                ?? throw new NotFoundException($"Package {dto.PackageId} not found.");

            if (package.NumberOfVisits <= 0)
                throw new ValidationException($"'{package.Name}' has an invalid NumberOfVisits configuration.");

            if (dto.VisitAssignments.Count > package.NumberOfVisits)
                throw new ValidationException( $"'{package.Name}' has {package.NumberOfVisits} visit(s); {dto.VisitAssignments.Count} assignment(s) were supplied.");

            if (dto.PaymentType == PackagePaymentType.Installment)
            {
                if (dto.InitialAmountPaid is null)
                    throw new ValidationException("InitialAmountPaid is required when PaymentType is Installment.");
                if (dto.InitialAmountPaid.Value < 0)
                    throw new ValidationException("InitialAmountPaid cannot be negative.");
                if (dto.InitialAmountPaid.Value > package.Amount)
                    throw new ValidationException(
                        $"InitialAmountPaid ({dto.InitialAmountPaid.Value}) cannot exceed the package amount ({package.Amount}).");
            }

            foreach (var assignment in dto.VisitAssignments)
                await ValidateAssignmentAsync(assignment, package.ServiceId, package.Name);

            var patient = await _patientService.GetOrCreateAsync(dto.PatientName, dto.PatientPhone, dto.LocationAddress, dto.PatientDescription);

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

                var amountPending = package.Amount - amountPaid;

                patientPackage = new PatientPackage
                {
                    Id = Guid.NewGuid(),
                    PatientId = patient.Id,
                    PackageId = package.Id,
                    PaymentType = dto.PaymentType,
                    TotalAmount = package.Amount,
                    AmountPaid = amountPaid,
                    AmountPending = amountPending,
                    CollectionStatus = dto.PaymentType == PackagePaymentType.Installment && amountPending > 0
                            ? CollectionStatus.InstallmentPending
                            : CollectionStatus.Received,
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
                CollectionStatus = patientPackage.CollectionStatus,
                Status = patientPackage.Status,
                PurchaseDate = patientPackage.PurchaseDate,
                Visits = visits.Select(VisitMapper.ToDto).ToList()
            };
        }

        public async Task RecordInstallmentAsync(Guid patientPackageId, RecordInstallmentDto dto)
        {
            Guard.EnsureNotEmpty(patientPackageId, "PatientPackageId");

            var patientPackage = await _patientPackageRepository.GetByIdAsync(patientPackageId)
                ?? throw new NotFoundException($"PatientPackage {patientPackageId} not found.");

            if (patientPackage.PaymentType != PackagePaymentType.Installment)
                throw new ValidationException("Installments can only be recorded on packages with PaymentType 'Installment'.");

            if (patientPackage.Status != PatientPackageStatus.Active)
                throw new ValidationException($"Cannot record an installment on a package with status '{patientPackage.Status}'.");

            if (dto.Amount <= 0)
                throw new ValidationException("Installment amount must be greater than zero.");
            if (dto.Amount > patientPackage.AmountPending)
                throw new ValidationException("Installment amount exceeds the amount pending.");

            patientPackage.AmountPaid += dto.Amount;
            patientPackage.AmountPending -= dto.Amount;

            if (patientPackage.AmountPending == 0)
            {
                patientPackage.CollectionStatus = CollectionStatus.Received;
                if (patientPackage.Status == PatientPackageStatus.Active)
                    patientPackage.Status = PatientPackageStatus.Completed;
            }

            await _patientPackageRepository.UpdateAsync(patientPackage);
        }

        private static bool Overlaps(TimeSpan aStart, TimeSpan aEnd, TimeSpan bStart, TimeSpan bEnd)
        {
            return aStart < bEnd && bStart < aEnd;
        }

        private async Task ValidateAssignmentAsync(VisitAssignmentDto assignment, Guid packageServiceId, string packageName)
        {
            var hasAny = assignment.ScheduledDate.HasValue || assignment.SlotStart.HasValue || assignment.SlotEnd.HasValue;
            var hasAll = assignment.ScheduledDate.HasValue && assignment.SlotStart.HasValue && assignment.SlotEnd.HasValue;

            if (hasAny && !hasAll)
                throw new ValidationException("A visit assignment's ScheduledDate, SlotStart and SlotEnd must all be supplied together, or all omitted.");

            if (hasAll)
                Guard.EnsureSlotOrder(assignment.SlotStart!.Value, assignment.SlotEnd!.Value);

            if (assignment.PractitionerId.HasValue)
            {
                var practitioner = await _practitionerRepository.GetByIdAsync(assignment.PractitionerId.Value)
                    ?? throw new NotFoundException($"Practitioner {assignment.PractitionerId.Value} not found.");

                if (practitioner.ServiceId != packageServiceId)
                    throw new ValidationException(
                        $"Practitioner {practitioner.Id} does not provide the service required by package '{packageName}'.");
            }

            if (assignment.AreaId.HasValue)
            {
                _ = await _areaRepository.GetByIdAsync(assignment.AreaId.Value)
                    ?? throw new NotFoundException($"Area {assignment.AreaId.Value} not found.");
            }
        }

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

        private async Task EnsureNoConflictAsync(Guid? practitionerId, Guid patientId,DateTime? scheduledDate, TimeSpan? slotStart, TimeSpan? slotEnd,
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

            if (visit.Status is VisitStatus.Completed or VisitStatus.Cancelled)
                throw new ValidationException($"Cannot schedule a visit with status '{visit.Status}'.");

            Guard.EnsureSlotOrder(dto.SlotStart, dto.SlotEnd);

            await EnsureNoConflictAsync(visit.PractitionerId, visit.PatientId, dto.ScheduledDate, dto.SlotStart, dto.SlotEnd, excludeVisitId: visitId);

            visit.ScheduledDate = dto.ScheduledDate;
            visit.SlotStart = dto.SlotStart;
            visit.SlotEnd = dto.SlotEnd;
            await _visitRepository.UpdateAsync(visit);
        }

        public async Task AssignAsync(Guid visitId, AssignVisitDto dto)
        {
            Guard.EnsureNotEmpty(dto.PractitionerId, "PractitionerId");

            var visit = await _visitRepository.GetByIdAsync(visitId)
                ?? throw new NotFoundException($"Visit {visitId} not found.");

            if (visit.Status is VisitStatus.Completed or VisitStatus.Cancelled)
                throw new ValidationException($"Cannot assign a practitioner to a visit with status '{visit.Status}'.");

            var practitioner = await _practitionerRepository.GetByIdAsync(dto.PractitionerId)
                ?? throw new NotFoundException($"Practitioner {dto.PractitionerId} not found.");

            if (practitioner.ServiceId != visit.ServiceId)
                throw new ValidationException("Selected practitioner does not provide the service required for this visit.");

            if (dto.AreaId.HasValue)
            {
                _ = await _areaRepository.GetByIdAsync(dto.AreaId.Value)
                    ?? throw new NotFoundException($"Area {dto.AreaId.Value} not found.");
            }

            await EnsureNoConflictAsync(dto.PractitionerId, visit.PatientId, visit.ScheduledDate, visit.SlotStart, visit.SlotEnd, excludeVisitId: visitId);

            visit.PractitionerId = dto.PractitionerId;
            if (dto.AreaId.HasValue) visit.AreaId = dto.AreaId;
            await _visitRepository.UpdateAsync(visit);
        }

        public async Task ReassignPractitionerAsync(Guid visitId, ReassignPractitionerDto dto)
        {
            Guard.EnsureNotEmpty(dto.PractitionerId, "PractitionerId");

            var visit = await _visitRepository.GetByIdAsync(visitId)
                ?? throw new NotFoundException($"Visit {visitId} not found.");

            if (visit.Status is VisitStatus.Completed or VisitStatus.Cancelled)
                throw new ValidationException($"Cannot reassign a practitioner on a visit with status '{visit.Status}'.");

            var practitioner = await _practitionerRepository.GetByIdAsync(dto.PractitionerId)
                ?? throw new NotFoundException($"Practitioner {dto.PractitionerId} not found.");

            if (practitioner.ServiceId != visit.ServiceId)
                throw new ValidationException("Selected practitioner does not provide the service required for this visit.");

            if (dto.AreaId.HasValue)
            {
                _ = await _areaRepository.GetByIdAsync(dto.AreaId.Value)
                    ?? throw new NotFoundException($"Area {dto.AreaId.Value} not found.");
            }

            await EnsureNoConflictAsync(dto.PractitionerId, visit.PatientId, visit.ScheduledDate, visit.SlotStart, visit.SlotEnd, excludeVisitId: visitId);

            visit.Refusals.Add(new Refusal
            {
                Id = Guid.NewGuid(),
                VisitId = visit.Id,
                RefusedBy = dto.RefusedBy,
                Reason = dto.Reason.Trim(),
                Date = DateTime.UtcNow
            });

            visit.PractitionerId = dto.PractitionerId;
            if (dto.AreaId.HasValue) visit.AreaId = dto.AreaId;
            visit.Status = VisitStatus.Scheduled;
            await _visitRepository.UpdateAsync(visit);
        }

        public async Task CheckInAsync(Guid visitId, CheckInDto dto)
        {
            var visit = await _visitRepository.GetByIdAsync(visitId)
                ?? throw new NotFoundException($"Visit {visitId} not found.");

            if (visit.Status != VisitStatus.Scheduled)
                throw new ValidationException($"Cannot check in a visit with status '{visit.Status}'. It must be Scheduled first.");

            if (visit.PractitionerId is null)
                throw new ValidationException("This visit has no assigned practitioner yet.");

            if (visit.CheckInTime is not null)
                throw new ValidationException("This visit has already been checked in.");

            Guard.EnsureValidCoordinates(dto.Latitude, dto.Longitude);

            visit.CheckInTime = dto.Timestamp;
            visit.CheckInLocation = $"{dto.Latitude},{dto.Longitude}";
            visit.Status = VisitStatus.InProgress;
            await _visitRepository.UpdateAsync(visit);
        }

        public async Task CheckOutAsync(Guid visitId, CheckOutDto dto)
        {
            var visit = await _visitRepository.GetByIdAsync(visitId)
                ?? throw new NotFoundException($"Visit {visitId} not found.");

            if (visit.Status != VisitStatus.InProgress)
                throw new ValidationException($"Cannot check out a visit with status '{visit.Status}'. It must be InProgress first.");

            if (visit.CheckInTime is null)
                throw new ValidationException("This visit must be checked in before it can be checked out.");

            if (visit.CheckOutTime is not null)
                throw new ValidationException("This visit has already been checked out.");

            Guard.EnsureValidCoordinates(dto.Latitude, dto.Longitude);

            if (dto.ReceivedBy == ReceivedByType.Practitioner)
            {
                if (dto.AmountReceived is null)
                    throw new ValidationException("AmountReceived is required when ReceivedBy is Practitioner.");
                if (dto.AmountReceived.Value < 0)
                    throw new ValidationException("AmountReceived cannot be negative.");
            }

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

            if (visit.Status is VisitStatus.Completed or VisitStatus.Cancelled)
                throw new ValidationException($"Cannot cancel a visit with status '{visit.Status}'.");

            visit.Refusals.Add(new Refusal
            {
                Id = Guid.NewGuid(),
                VisitId = visit.Id,
                RefusedBy = dto.RefusedBy,
                Reason = dto.Reason.Trim(),
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

        public async Task CollectPaymentAsync(Guid visitId, CollectPaymentDto dto)
        {
            var visit = await _visitRepository.GetByIdAsync(visitId)
                ?? throw new NotFoundException($"Visit {visitId} not found.");

            if (visit.Status == VisitStatus.Cancelled)
                throw new ValidationException("Cannot collect payment for a cancelled visit.");

            if (visit.CollectionStatus == CollectionStatus.Received)
                throw new ValidationException("Payment has already been collected for this visit.");

            if (dto.Amount <= 0)
                throw new ValidationException("Amount must be greater than zero.");

            visit.ReceivedBy = ReceivedByType.Company;
            visit.AmountReceived = dto.Amount;
            visit.CollectionStatus = CollectionStatus.Received;

            await _visitRepository.UpdateAsync(visit);
        }

        public async Task MarkPaymentReceivedAsync(Guid visitId, MarkPaymentReceivedDto dto)
        {
            var visit = await _visitRepository.GetByIdAsync(visitId)
                ?? throw new NotFoundException($"Visit {visitId} not found.");

            if (visit.Status == VisitStatus.Cancelled)
                throw new ValidationException("Cannot mark payment received for a cancelled visit.");

            if (visit.ReceivedBy == ReceivedByType.Company)
                throw new ValidationException("Payment was already collected by the company for this visit; it cannot be marked received by the practitioner.");

            if (visit.CollectionStatus == CollectionStatus.Received)
                throw new ValidationException("Payment has already been marked as received for this visit.");

            if (dto.Amount <= 0)
                throw new ValidationException("Amount must be greater than zero.");

            visit.ReceivedBy = ReceivedByType.Practitioner;
            visit.AmountReceived = dto.Amount;
            visit.CollectionStatus = CollectionStatus.Received;

            await _visitRepository.UpdateAsync(visit);
        }
    }
}