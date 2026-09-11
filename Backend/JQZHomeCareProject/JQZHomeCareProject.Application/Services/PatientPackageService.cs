using JQZHomeCareProject.Application.Common;
using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Application.Services;
using JQZHomeCareProject.Domain.Entities;
using JQZHomeCareProject.Domain.Enums;

namespace JQZHomeCareProject.Application.Services
{
    public class PatientPackageService : IPatientPackageService
    {
        private readonly IPatientPackageRepository _patientPackageRepository;
        private readonly IPaymentRepository _paymentRepository;

        public PatientPackageService(IPatientPackageRepository patientPackageRepository, IPaymentRepository paymentRepository)
        {
            _patientPackageRepository = patientPackageRepository;
            _paymentRepository = paymentRepository;
        }

        public async Task<PatientPackageDto> GetByIdAsync(Guid id)
        {
            var entity = await _patientPackageRepository.GetByIdAsync(id)
                ?? throw new NotFoundException($"PatientPackage {id} not found.");
            return MapToDto(entity);
        }

        public async Task<IEnumerable<PatientPackageDto>> GetAllAsync() =>
            (await _patientPackageRepository.GetAllAsync()).Select(MapToDto);

        public async Task<IEnumerable<PatientPackageDto>> GetByPatientAsync(Guid patientId) =>
            (await _patientPackageRepository.GetByPatientIdAsync(patientId)).Select(MapToDto);

        public async Task<IEnumerable<VisitDto>> GetVisitsAsync(Guid patientPackageId)
        {
            var entity = await _patientPackageRepository.GetByIdAsync(patientPackageId)
                ?? throw new NotFoundException($"PatientPackage {patientPackageId} not found.");
            return entity.Visits.Select(VisitMapper.ToDto);
        }

        public async Task<IEnumerable<PaymentDto>> GetPaymentsAsync(Guid patientPackageId)
        {
            var entity = await _patientPackageRepository.GetByIdAsync(patientPackageId)
                ?? throw new NotFoundException($"PatientPackage {patientPackageId} not found.");
            return entity.Payments.OrderBy(p => p.Visit?.ScheduledDate ?? DateTime.MaxValue).Select(PaymentMapper.ToDto);
        }

        // Replaces RecordInstallmentAsync. Money not tied to a visit; office-collected; waterfalls
        // across the earliest unpaid visits first.
        public async Task RecordOfficePaymentAsync(Guid patientPackageId, RecordOfficePaymentDto dto)
        {
            var patientPackage = await _patientPackageRepository.GetByIdAsync(patientPackageId)
                ?? throw new NotFoundException($"PatientPackage {patientPackageId} not found.");

            if (patientPackage.Status != PatientPackageStatus.Active)
                throw new ValidationException($"Cannot record a payment on a package with status '{patientPackage.Status}'.");
            if (dto.Amount <= 0)
                throw new ValidationException("Payment amount must be greater than zero.");
            if (dto.Amount > patientPackage.AmountPending)
                throw new ValidationException("Payment amount exceeds the amount pending.");

            var payments = patientPackage.Payments
                .OrderBy(p => p.Visit?.ScheduledDate ?? DateTime.MaxValue)
                .ToList();

            PaymentAllocation.ApplyOfficePayment(payments, dto.Amount, DateTime.UtcNow);

            patientPackage.CollectionStatus = PaymentAllocation.ComputeCollectionStatus(payments);
            if (patientPackage.CollectionStatus == CollectionStatus.AllReceived && patientPackage.Status == PatientPackageStatus.Active)
                patientPackage.Status = PatientPackageStatus.Completed;

            await _paymentRepository.UpdateRangeAsync(payments);
            await _patientPackageRepository.UpdateAsync(patientPackage);
        }

        // Admin sets the "real" final total; re-divides equally across all visits.
        // Blocked once any money has moved, to avoid retroactively shifting what's already paid.
        public async Task UpdatePatientPackageAmountAsync(Guid patientPackageId, UpdatePatientPackageAmountDto dto)
        {
            if (dto.Amount <= 0)
                throw new ValidationException("Amount must be greater than zero.");

            var patientPackage = await _patientPackageRepository.GetByIdAsync(patientPackageId)
                ?? throw new NotFoundException($"PatientPackage {patientPackageId} not found.");

            if (patientPackage.Payments.Any(p => p.AmountPaid > 0))
                throw new ValidationException("Cannot change the package amount after any payment has been collected.");

            var visitCount = patientPackage.Payments.Count;
            if (visitCount == 0)
                throw new ValidationException("This package has no visits.");

            var perVisitAmount = Math.Round(dto.Amount / visitCount, 2);
            foreach (var payment in patientPackage.Payments)
                payment.Amount = perVisitAmount;

            patientPackage.Amount = dto.Amount;

            await _paymentRepository.UpdateRangeAsync(patientPackage.Payments);
            await _patientPackageRepository.UpdateAsync(patientPackage);
        }

        // Admin overrides one visit's practitioner share directly (your "700 instead of 600" example).
        public async Task UpdatePaymentShareAsync(Guid paymentId, UpdatePaymentShareDto dto)
        {
            if (dto.PShareAmount < 0)
                throw new ValidationException("PShareAmount cannot be negative.");

            var payment = await _paymentRepository.GetByIdAsync(paymentId)
                ?? throw new NotFoundException($"Payment {paymentId} not found.");

            if (dto.PShareAmount > payment.Amount)
                throw new ValidationException($"PShareAmount ({dto.PShareAmount}) cannot exceed the visit's amount ({payment.Amount}).");

            payment.PShareAmount = dto.PShareAmount;
            await _paymentRepository.UpdateAsync(payment);
        }

        private static PatientPackageDto MapToDto(PatientPackage p) => new()
        {
            Id = p.Id,
            PatientId = p.PatientId,
            PatientName = p.Patient?.Name ?? string.Empty,
            PackageId = p.PackageId,
            PackageName = p.Package?.Name ?? string.Empty,
            PaymentType = p.PaymentType,
            DefaultAmount = p.DefaultAmount,
            Amount = p.Amount,
            AmountPaid = p.AmountPaid,
            AmountPending = p.AmountPending,
            CollectionStatus = p.CollectionStatus,
            Status = p.Status,
            PurchaseDate = p.PurchaseDate,
            Visits = p.Visits.Select(VisitMapper.ToDto).ToList(),
            Payments = p.Payments.OrderBy(pay => pay.Visit?.ScheduledDate ?? DateTime.MaxValue).Select(PaymentMapper.ToDto).ToList()
        };
    }

    public static class PaymentMapper
    {
        public static PaymentDto ToDto(Payment p) => new()
        {
            Id = p.Id,
            PatientPackageId = p.PatientPackageId,
            PatientId = p.PatientId,
            PractitionerId = p.PractitionerId,
            PractitionerName = p.Practitioner?.User?.Name,
            VisitId = p.VisitId,
            DefaultAmount = p.DefaultAmount,
            Amount = p.Amount,
            AmountPaid = p.AmountPaid,
            DefaultPShareAmount = p.DefaultPShareAmount,
            PShareAmount = p.PShareAmount,
            Status = p.Status,
            DateTime = p.DateTime,
            IsSettled = p.IsSettled
        };
    }
    public static class VisitMapper
    {
        public static VisitDto ToDto(Visit v) => new()
        {
            Id = v.Id,
            PatientId = v.PatientId,
            PatientName = v.PatientNameSnapshot ?? v.Patient?.Name ?? string.Empty,
            PatientPhone = v.Patient?.Phone ?? string.Empty,
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
        };
    }
}