using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Domain.Entities;
using JQZHomeCareProject.Domain.Enums;

namespace JQZHomeCareProject.Application.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IPractitionerSettlementRepository _settlementRepository;
        private readonly IVisitRepository _visitRepository;
        private readonly IPractitionerRepository _practitionerRepository;

        public PaymentService(
            IPractitionerSettlementRepository settlementRepository,
            IVisitRepository visitRepository,
            IPractitionerRepository practitionerRepository)
        {
            _settlementRepository = settlementRepository;
            _visitRepository = visitRepository;
            _practitionerRepository = practitionerRepository;
        }

        public async Task<PractitionerSettlementDto> GenerateWeeklySettlementAsync(Guid practitionerId, DateTime weekStart)
        {
            var practitioner = await _practitionerRepository.GetByIdAsync(practitionerId)
                ?? throw new NotFoundException("Practitioner not found.");

            var existing = await _settlementRepository.GetByPractitionerAndWeekAsync(practitionerId, weekStart);
            if (existing != null)
                throw new ValidationException("A settlement for this practitioner and week already exists.");

            var weekEnd = weekStart.Date.AddDays(6);

            var visits = (await _visitRepository.GetUnsettledCompletedAsync(practitionerId, weekStart.Date, weekEnd)).ToList();
            if (visits.Count == 0)
                throw new ValidationException("No unsettled completed visits found for this practitioner in the given week.");

            var totalVisitAmount = visits.Sum(v => v.AmountDue);
            var practitionerShareAmount = Math.Round(totalVisitAmount * practitioner.SharePercentage / 100m, 2);
            var companyShareAmount = totalVisitAmount - practitionerShareAmount;

            var settlement = new PractitionerSettlement
            {
                Id = Guid.NewGuid(),
                PractitionerId = practitionerId,
                WeekStartDate = weekStart.Date,
                WeekEndDate = weekEnd,
                TotalVisitAmount = totalVisitAmount,
                PractitionerShareAmount = practitionerShareAmount,
                CompanyShareAmount = companyShareAmount,
                Status = CollectionStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            await _settlementRepository.AddAsync(settlement);

            foreach (var visit in visits)
            {
                visit.SettlementId = settlement.Id;
                await _visitRepository.UpdateAsync(visit);
            }

            return MapToDto(settlement, practitioner.User?.Name ?? string.Empty);
        }

        public async Task MarkSettlementReceivedAsync(Guid settlementId, Guid adminUserId)
        {
            var settlement = await _settlementRepository.GetByIdAsync(settlementId)
                ?? throw new NotFoundException("Settlement not found.");

            if (settlement.Status == CollectionStatus.Received)
                throw new ValidationException("This settlement has already been marked as received.");

            settlement.Status = CollectionStatus.Received;
            settlement.ReceivedDate = DateTime.UtcNow;
            settlement.ReceivedByUserId = adminUserId;

            await _settlementRepository.UpdateAsync(settlement);

            foreach (var visit in settlement.Visits)
            {
                visit.CollectionStatus = CollectionStatus.Received;
                await _visitRepository.UpdateAsync(visit);
            }
        }

        public async Task<IEnumerable<PractitionerSettlementDto>> GetPendingSettlementsAsync()
        {
            var settlements = await _settlementRepository.GetPendingAsync();
            return settlements.Select(s => MapToDto(s, s.Practitioner?.User?.Name ?? string.Empty));
        }

        public async Task<PractitionerSettlementDto> GetByIdAsync(Guid id)
        {
            var settlement = await _settlementRepository.GetByIdAsync(id)
                ?? throw new NotFoundException("Settlement not found.");

            return MapToDto(settlement, settlement.Practitioner?.User?.Name ?? string.Empty);
        }

        public async Task<WeeklySettlementDto> GetWeeklySummaryAsync(Guid practitionerId, DateTime weekStart)
        {
            var practitioner = await _practitionerRepository.GetByIdAsync(practitionerId)
                ?? throw new NotFoundException("Practitioner not found.");

            var weekStartDate = weekStart.Date;
            var weekEnd = weekStartDate.AddDays(6);

            var existing = await _settlementRepository.GetByPractitionerAndWeekAsync(practitionerId, weekStartDate);
            if (existing != null)
            {
                return new WeeklySettlementDto
                {
                    SettlementId = existing.Id,
                    PractitionerId = existing.PractitionerId,
                    PractitionerName = practitioner.User?.Name ?? string.Empty,
                    WeekStart = existing.WeekStartDate,
                    WeekEnd = existing.WeekEndDate,
                    VisitCount = existing.Visits.Count,
                    TotalVisitAmount = existing.TotalVisitAmount,
                    PractitionerShareAmount = existing.PractitionerShareAmount,
                    CompanyShareAmount = existing.CompanyShareAmount,
                    Status = existing.Status,
                    ReceivedDate = existing.ReceivedDate,
                    Visits = existing.Visits.Select(ToVisitDto).ToList()
                };
            }

            var visits = (await _visitRepository.GetUnsettledCompletedAsync(practitionerId, weekStartDate, weekEnd)).ToList();
            var totalVisitAmount = visits.Sum(v => v.AmountDue);
            var practitionerShareAmount = Math.Round(totalVisitAmount * practitioner.SharePercentage / 100m, 2);
            var companyShareAmount = totalVisitAmount - practitionerShareAmount;

            return new WeeklySettlementDto
            {
                SettlementId = null,
                PractitionerId = practitionerId,
                PractitionerName = practitioner.User?.Name ?? string.Empty,
                WeekStart = weekStartDate,
                WeekEnd = weekEnd,
                VisitCount = visits.Count,
                TotalVisitAmount = totalVisitAmount,
                PractitionerShareAmount = practitionerShareAmount,
                CompanyShareAmount = companyShareAmount,
                Status = CollectionStatus.Pending,
                ReceivedDate = null,
                Visits = visits.Select(ToVisitDto).ToList()
            };
        }
        private static VisitDto ToVisitDto(Visit v)
        {
            return new VisitDto
            {
                Id = v.Id,
                PatientId = v.PatientId,
                PatientName = v.Patient?.Name ?? string.Empty,
                PractitionerId = v.PractitionerId,
                PractitionerName = v.Practitioner?.User?.Name ?? string.Empty,
                AreaId = v.AreaId,
                AreaName = v.Area?.Name ?? string.Empty,
                ServiceId = v.ServiceId,
                ServiceName = v.Service?.Name ?? string.Empty,
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

        private static PractitionerSettlementDto MapToDto(PractitionerSettlement settlement, string practitionerName)
        {
            return new PractitionerSettlementDto
            {
                Id = settlement.Id,
                PractitionerId = settlement.PractitionerId,
                PractitionerName = practitionerName,
                WeekStart = settlement.WeekStartDate,
                WeekEnd = settlement.WeekEndDate,
                TotalVisitAmount = settlement.TotalVisitAmount,
                PractitionerShareAmount = settlement.PractitionerShareAmount,
                CompanyShareAmount = settlement.CompanyShareAmount,
                Status = settlement.Status,
                ReceivedDate = settlement.ReceivedDate
            };
        }
    }
}