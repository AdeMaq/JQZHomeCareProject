using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Domain.Entities;

namespace JQZHomeCareProject.Application.Services
{
    public class PatientPackageService : IPatientPackageService
    {
        private readonly IPatientPackageRepository _patientPackageRepository;

        public PatientPackageService(IPatientPackageRepository patientPackageRepository)
        {
            _patientPackageRepository = patientPackageRepository;
        }

        public async Task<PatientPackageDto> GetByIdAsync(Guid id)
        {
            var entity = await _patientPackageRepository.GetByIdAsync(id)
                ?? throw new NotFoundException($"PatientPackage {id} not found.");
            return MapToDto(entity);
        }

        public async Task<IEnumerable<PatientPackageDto>> GetAllAsync()
        {
            var entities = await _patientPackageRepository.GetAllAsync();
            return entities.Select(MapToDto);
        }

        public async Task<IEnumerable<PatientPackageDto>> GetByPatientAsync(Guid patientId)
        {
            var entities = await _patientPackageRepository.GetByPatientIdAsync(patientId);
            return entities.Select(MapToDto);
        }

        public async Task<IEnumerable<VisitDto>> GetVisitsAsync(Guid patientPackageId)
        {
            var entity = await _patientPackageRepository.GetByIdAsync(patientPackageId)
                ?? throw new NotFoundException($"PatientPackage {patientPackageId} not found.");
            return entity.Visits.Select(VisitMapper.ToDto);
        }

        public async Task<IEnumerable<InstallmentPaymentDto>> GetInstallmentHistoryAsync(Guid patientPackageId)
        {
            var entity = await _patientPackageRepository.GetByIdAsync(patientPackageId)
                ?? throw new NotFoundException($"PatientPackage {patientPackageId} not found.");

            return entity.InstallmentPayments
                .OrderBy(ip => ip.Date)
                .Select(VisitMapper.ToInstallmentDto);
        }

        private static PatientPackageDto MapToDto(PatientPackage p) => new()
        {
            Id = p.Id,
            PatientId = p.PatientId,
            PatientName = p.Patient?.Name ?? string.Empty,
            PackageId = p.PackageId,
            PackageName = p.Package?.Name ?? string.Empty,
            PaymentType = p.PaymentType,
            TotalAmount = p.TotalAmount,
            AmountPaid = p.AmountPaid,
            AmountPending = p.AmountPending,
            CollectionStatus = p.CollectionStatus,
            ReceivedBy = p.ReceivedBy,
            Status = p.Status,
            PurchaseDate = p.PurchaseDate,
            Visits = p.Visits.Select(VisitMapper.ToDto).ToList(),
            InstallmentPayments = p.InstallmentPayments
        .OrderBy(ip => ip.Date)
        .Select(VisitMapper.ToInstallmentDto)
        .ToList()
        };

    }
    public static class VisitMapper
    {
        public static VisitDto ToDto(Visit v) => new()
        {
            Id = v.Id,
            PatientId = v.PatientId,
            PatientName = v.PatientNameSnapshot ?? v.Patient?.Name ?? string.Empty,
PatientPhone = v.PatientPhoneSnapshot ?? v.Patient?.Phone ?? string.Empty,
PatientAddress = v.PatientAddressSnapshot ?? v.Patient?.Location?.Address ?? string.Empty,
PatientDescription = v.PatientDescriptionSnapshot ?? v.Patient?.PatientDescription,
            PractitionerId = v.PractitionerId,
            PractitionerName = v.Practitioner?.User?.Name,
            AreaId = v.AreaId,
            AreaName = v.Area?.Name,
            ServiceId = v.ServiceId,
            ServiceName = v.Service?.Name ?? string.Empty,
            PatientPackageId = v.PatientPackageId,
            PackageName = v.PatientPackage?.Package?.Name,
            ScheduledDate = v.ScheduledDate,
            SlotStart = v.SlotStart,
            SlotEnd = v.SlotEnd,
            Status = v.Status,
            PaymentType = v.PatientPackage?.PaymentType,
            SettlementId = v.SettlementId
        };

        public static InstallmentPaymentDto ToInstallmentDto(InstallmentPayment ip) => new()
        {
            Id = ip.Id,
            PatientPackageId = ip.PatientPackageId,
            VisitId = ip.VisitId,
            Amount = ip.Amount,
            ReceivedBy = ip.ReceivedBy,
            Date = ip.Date
        };
    }
}