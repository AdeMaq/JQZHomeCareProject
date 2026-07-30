using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Domain.Entities;
using JQZHomeCareProject.Domain.Enums;

namespace JQZHomeCareProject.Application.Services
{
    public class PatientPackageService : IPatientPackageService
    {
        private readonly IPatientPackageRepository _patientPackageRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IPackageRepository _packageRepository;
        private readonly IVisitRepository _visitRepository;
        private readonly IPatientService _patientService;

        public PatientPackageService(IPatientPackageRepository patientPackageRepository,IPatientRepository patientRepository,IPackageRepository packageRepository,IVisitRepository visitRepository,IPatientService patientService)
        {
            _patientPackageRepository = patientPackageRepository;
            _patientRepository = patientRepository;
            _packageRepository = packageRepository;
            _visitRepository = visitRepository;
            _patientService = patientService;
        }

        public async Task<PatientPackageDto> PurchaseAsync(PurchasePackageDto dto, Guid createdByUserId)
        {
            var package = await _packageRepository.GetByIdAsync(dto.PackageId)
                ?? throw new NotFoundException($"Package with id {dto.PackageId} was not found.");

            if (dto.PaymentType == PackagePaymentType.Installment &&
                (dto.InitialAmountPaid is null || dto.InitialAmountPaid <= 0))
            {
                throw new ValidationException("InitialAmountPaid is required and must be greater than zero for Installment payments.");
            }

            var patientDto = await _patientService.GetOrCreateAsync(dto.PatientName, dto.PatientPhone, dto.LocationAddress);
            var patient = await _patientRepository.GetByIdAsync(patientDto.Id)
                ?? throw new NotFoundException("Patient could not be resolved after GetOrCreateAsync.");

            var totalAmount = package.Amount;
            decimal amountPaid;
            decimal amountPending;

            if (dto.PaymentType == PackagePaymentType.FullAdvance)
            {
                amountPaid = totalAmount;
                amountPending = 0;
            }
            else
            {
                amountPaid = dto.InitialAmountPaid!.Value;
                amountPending = totalAmount - amountPaid;
            }

            var patientPackage = new PatientPackage
            {
                Id = Guid.NewGuid(),
                PatientId = patient.Id,
                PackageId = package.Id,
                PaymentType = dto.PaymentType,
                TotalAmount = totalAmount,
                AmountPaid = amountPaid,
                AmountPending = amountPending,
                Status = PatientPackageStatus.Active,
                PurchaseDate = DateTime.UtcNow
            };
            var perVisitAmount = package.NumberOfVisits > 0
                ? Math.Round(totalAmount / package.NumberOfVisits, 2)
                : totalAmount;

            var visits = new List<Visit>();
            for (var i = 0; i < package.NumberOfVisits; i++)
            {
                visits.Add(new Visit
                {
                    Id = Guid.NewGuid(),
                    PatientId = patient.Id,
                    ServiceId = package.ServiceId,
                    PatientPackageId = patientPackage.Id,
                    ScheduledDate = null,
                    Status = VisitStatus.Scheduled,
                    AmountDue = perVisitAmount,
                    CollectionStatus = CollectionStatus.Pending,
                    CreatedByUserId = createdByUserId,
                });
            }
            patientPackage.Visits = visits;
            await _patientPackageRepository.AddAsync(patientPackage);
            await _patientRepository.IncrementVisitCountAsync(patient.Id, package.NumberOfVisits);
            patient.VisitCount += package.NumberOfVisits;

            return await BuildDtoAsync(patientPackage.Id);
        }

        public async Task<PatientPackageDto> GetByIdAsync(Guid id) => await BuildDtoAsync(id);

        public async Task<IEnumerable<PatientPackageDto>> GetByPatientAsync(Guid patientId)
        {
            var patientPackages = await _patientPackageRepository.GetByPatientIdAsync(patientId);
            var results = new List<PatientPackageDto>();
            foreach (var pp in patientPackages)
                results.Add(await BuildDtoAsync(pp.Id));
            return results;
        }

        public async Task RecordInstallmentAsync(Guid patientPackageId, RecordInstallmentDto dto)
        {
            var patientPackage = await _patientPackageRepository.GetByIdAsync(patientPackageId)
                ?? throw new NotFoundException($"PatientPackage with id {patientPackageId} was not found.");

            if (dto.Amount > patientPackage.AmountPending)
                throw new ValidationException("Installment amount exceeds the remaining AmountPending.");

            patientPackage.AmountPaid += dto.Amount;
            patientPackage.AmountPending -= dto.Amount;
            patientPackage.UpdatedAt = DateTime.UtcNow;

            await _patientPackageRepository.UpdateAsync(patientPackage);
        }

        public async Task<IEnumerable<VisitDto>> GetVisitsAsync(Guid patientPackageId)
        {
            var visits = await _visitRepository.GetByPatientPackageIdAsync(patientPackageId);
            return visits.Select(MapVisit);
        }

        private async Task<PatientPackageDto> BuildDtoAsync(Guid id)
        {
            var patientPackage = await _patientPackageRepository.GetByIdAsync(id)
                ?? throw new NotFoundException($"PatientPackage with id {id} was not found.");

            var visits = await _visitRepository.GetByPatientPackageIdAsync(id);

            return new PatientPackageDto
            {
                Id = patientPackage.Id,
                Patient = new PatientDto
                {
                    Id = patientPackage.Patient!.Id,
                    Name = patientPackage.Patient.Name,
                    Phone = patientPackage.Patient.Phone,
                    VisitCount = patientPackage.Patient.VisitCount,
                    LocationAddress = patientPackage.Patient.Location?.Address ?? string.Empty
                },
                Package = new PackageDto
                {
                    Id = patientPackage.Package!.Id,
                    ServiceId = patientPackage.Package.ServiceId,
                    Name = patientPackage.Package.Name,
                    NumberOfVisits = patientPackage.Package.NumberOfVisits,
                    Amount = patientPackage.Package.Amount
                },
                PaymentType = patientPackage.PaymentType,
                TotalAmount = patientPackage.TotalAmount,
                AmountPaid = patientPackage.AmountPaid,
                AmountPending = patientPackage.AmountPending,
                Status = patientPackage.Status,
                PurchaseDate = patientPackage.PurchaseDate,
                Visits = visits.Select(MapVisit).ToList()
            };
        }

        private static VisitDto MapVisit(Visit v) => new()
        {
            Id = v.Id,
            PatientId = v.PatientId,
            PatientName = v.Patient?.Name ?? string.Empty,
            PractitionerId = v.PractitionerId,
            PractitionerName = v.Practitioner?.User?.Name,
            AreaId = v.AreaId,
            AreaName = v.Area?.Name,
            ServiceId = v.ServiceId,
            ServiceName = v.Service?.Name,
            PatientPackageId = v.PatientPackageId,
            PackageName = v.PatientPackage?.Package?.Name,
            ScheduledDate = v.ScheduledDate,
            SlotStart = v.SlotStart,
            SlotEnd = v.SlotEnd,
            Status = v.Status,
            AmountDue = v.AmountDue,
            AmountReceived = v.AmountReceived,
            ReceivedBy = v.ReceivedBy,
            CollectionStatus = v.CollectionStatus,
            SettlementId = v.SettlementId
        };
    }
}