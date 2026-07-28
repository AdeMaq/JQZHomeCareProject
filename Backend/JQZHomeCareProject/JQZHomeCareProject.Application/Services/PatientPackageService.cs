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
        private readonly IPackageRepository _packageRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IPatientService _patientService;

        public PatientPackageService(IPatientPackageRepository patientPackageRepository,IPackageRepository packageRepository,IPatientRepository patientRepository,IPatientService patientService)
        {
            _patientPackageRepository = patientPackageRepository;
            _packageRepository = packageRepository;
            _patientRepository = patientRepository;
            _patientService = patientService;
        }

        public async Task<PatientPackageDto> PurchaseAsync(PurchasePackageDto dto, Guid createdByUserId)
        {
            if (dto.PaymentType == PackagePaymentType.Installment && dto.InitialAmountPaid is null)
            {
                throw new ValidationException("InitialAmountPaid is required when PaymentType is Installment.");
            }

            var package = await _packageRepository.GetByIdAsync(dto.PackageId)
                ?? throw new NotFoundException($"Package {dto.PackageId} was not found.");

            var patientDto = await _patientService.GetOrCreateAsync(dto.PatientName, dto.PatientPhone, dto.LocationAddress);

            var totalAmount = package.Amount;
            decimal amountPaid;
            decimal amountPending;

            if (dto.PaymentType == PackagePaymentType.FullAdvance)
            {
                amountPaid = totalAmount;
                amountPending = 0m;
            }
            else
            {
                amountPaid = dto.InitialAmountPaid!.Value;
                amountPending = totalAmount - amountPaid;
            }

            var patientPackage = new PatientPackage
            {
                PatientId = patientDto.Id,
                PackageId = package.Id,
                PaymentType = dto.PaymentType,
                TotalAmount = totalAmount,
                AmountPaid = amountPaid,
                AmountPending = amountPending,
                Status = PatientPackageStatus.Active,
                PurchaseDate = DateTime.UtcNow
            };

            var amountDuePerVisit = package.NumberOfVisits > 0
                ? Math.Round(totalAmount / package.NumberOfVisits, 2)
                : 0m;

            for (var i = 0; i < package.NumberOfVisits; i++)
            {
                patientPackage.Visits.Add(new Visit
                {
                    PatientId = patientDto.Id,
                    PractitionerId = Guid.Empty,
                    AreaId = Guid.Empty,
                    ServiceId = package.ServiceId,
                    ScheduledDate = null,
                    TimeSlot = null,
                    Status = VisitStatus.Scheduled,
                    AmountDue = amountDuePerVisit,
                    CollectionStatus = CollectionStatus.Pending,
                    CreatedByUserId = createdByUserId
                });
            }

            await _patientPackageRepository.AddAsync(patientPackage);
            await _patientRepository.IncrementVisitCountAsync(patientDto.Id, package.NumberOfVisits);

            return MapToDto(patientPackage, patientDto.Name, package.Name);
        }

        public async Task<PatientPackageDto> GetByIdAsync(Guid id)
        {
            var patientPackage = await _patientPackageRepository.GetByIdAsync(id)
                ?? throw new NotFoundException($"PatientPackage {id} was not found.");
            return MapToDto(patientPackage);
        }

        public async Task<IEnumerable<PatientPackageDto>> GetByPatientAsync(Guid patientId)
        {
            var patientPackages = await _patientPackageRepository.GetByPatientIdAsync(patientId);
            return patientPackages.Select(pp => MapToDto(pp));
        }

        public async Task RecordInstallmentAsync(Guid patientPackageId, RecordInstallmentDto dto)
        {
            var patientPackage = await _patientPackageRepository.GetByIdAsync(patientPackageId)
                ?? throw new NotFoundException($"PatientPackage {patientPackageId} was not found.");

            if (dto.Amount <= 0)
            {
                throw new ValidationException("Installment amount must be greater than zero.");
            }
            if (dto.Amount > patientPackage.AmountPending)
            {
                throw new ValidationException("Installment amount exceeds the amount pending.");
            }

            patientPackage.AmountPaid += dto.Amount;
            patientPackage.AmountPending -= dto.Amount;

            if (patientPackage.AmountPending == 0m)
            {
                patientPackage.Status = PatientPackageStatus.Completed;
            }

            await _patientPackageRepository.UpdateAsync(patientPackage);
        }

        public async Task<IEnumerable<VisitDto>> GetVisitsAsync(Guid patientPackageId)
        {
            var patientPackage = await _patientPackageRepository.GetByIdAsync(patientPackageId)
                ?? throw new NotFoundException($"PatientPackage {patientPackageId} was not found.");

            return patientPackage.Visits.Select(MapVisitToDto);
        }

        private static PatientPackageDto MapToDto(PatientPackage pp, string? patientNameFallback = null, string? packageNameFallback = null)
        {
            return new PatientPackageDto
            {
                Id = pp.Id,
                PatientId = pp.PatientId,
                PatientName = pp.Patient?.Name ?? patientNameFallback ?? string.Empty,
                PackageId = pp.PackageId,
                PackageName = pp.Package?.Name ?? packageNameFallback ?? string.Empty,
                PaymentType = pp.PaymentType,
                TotalAmount = pp.TotalAmount,
                AmountPaid = pp.AmountPaid,
                AmountPending = pp.AmountPending,
                Status = pp.Status,
                PurchaseDate = pp.PurchaseDate,
                Visits = pp.Visits.Select(MapVisitToDto).ToList()
            };
        }

        private static VisitDto MapVisitToDto(Visit v)
        {
            return new VisitDto
            {
                Id = v.Id,
                PatientId = v.PatientId,
                PatientName = v.Patient?.Name ?? string.Empty,
                PractitionerId = v.PractitionerId,
                PractitionerName = null,
                AreaId = v.AreaId,
                AreaName = v.Area?.Name,
                ServiceId = v.ServiceId,
                ServiceName = v.Service?.Name,
                PatientPackageId = v.PatientPackageId,
                ScheduledDate = v.ScheduledDate,
                TimeSlot = v.TimeSlot,
                Status = v.Status,
                AmountDue = v.AmountDue,
                AmountReceived = v.AmountReceived,
                ReceivedBy = v.ReceivedBy,
                CollectionStatus = v.CollectionStatus,
                SettlementId = v.SettlementId
            };
        }
    }
}