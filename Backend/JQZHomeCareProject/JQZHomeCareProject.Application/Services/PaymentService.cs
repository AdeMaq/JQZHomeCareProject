using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.Common.Validation;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Domain.Entities;

namespace JQZHomeCareProject.Application.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository _paymentRepository;
        private readonly IPractitionerRepository _practitionerRepository;

        public PaymentService(
            IPaymentRepository paymentRepository,
            IPractitionerRepository practitionerRepository)
        {
            _paymentRepository = paymentRepository;
            _practitionerRepository = practitionerRepository;
        }

        public async Task<WeeklySettlementSummaryDto> GetWeeklySummaryAsync(Guid practitionerId, DateTime weekStart)
        {
            var practitioner = await _practitionerRepository.GetByIdAsync(practitionerId)
                ?? throw new NotFoundException("Practitioner not found.");

            var weekStartDate = weekStart.Date;
            var weekEnd = weekStartDate.AddDays(6);

            var payments = (await _paymentRepository.GetByPractitionerAndWeekAsync(practitionerId, weekStartDate, weekEnd)).ToList();

            // Practitioner/company share split is only meaningful once a visit is fully paid —
            // a partially-paid visit hasn't actually generated a settleable share yet.
            var fullyPaid = payments.Where(p => p.AmountPaid >= p.Amount).ToList();

            return new WeeklySettlementSummaryDto
            {
                PractitionerId = practitionerId,
                PractitionerName = practitioner.User?.Name ?? string.Empty,
                WeekStart = weekStartDate,
                WeekEnd = weekEnd,
                VisitCount = payments.Count,
                Receivable = payments.Sum(p => p.Amount),
                Received = payments.Sum(p => p.AmountPaid),
                PractitionerShare = fullyPaid.Sum(p => p.PShareAmount),
                CompanyShare = fullyPaid.Sum(p => p.Amount - p.PShareAmount),
                IsFullySettled = payments.Count > 0 && payments.All(p => p.IsSettled),
                Payments = payments
                    .OrderBy(p => p.Visit?.ScheduledDate ?? DateTime.MaxValue)
                    .Select(PaymentMapper.ToDto)
                    .ToList()
            };
        }

        // Admin confirms the week's money has actually reached the company. Locks every
        // Payment row for that practitioner/week so its numbers can't drift afterward.
        // Requires every visit in the week to already be fully collected — you can't settle
        // a week that still has money outstanding.
        public async Task MarkWeekSettledAsync(Guid practitionerId, DateTime weekStart, Guid adminUserId)
        {
            var practitioner = await _practitionerRepository.GetByIdAsync(practitionerId)
                ?? throw new NotFoundException("Practitioner not found.");

            var weekStartDate = weekStart.Date;
            var weekEnd = weekStartDate.AddDays(6);

            var payments = (await _paymentRepository.GetUnsettledByPractitionerAndWeekAsync(practitionerId, weekStartDate, weekEnd)).ToList();

            if (payments.Count == 0)
                throw new ValidationException("No unsettled payments found for this practitioner in the given week.");

            if (payments.Any(p => p.AmountPaid < p.Amount))
                throw new ValidationException("Cannot settle a week that still has unpaid or partially paid visits.");

            var now = DateTime.UtcNow;
            foreach (var payment in payments)
            {
                payment.IsSettled = true;
                payment.SettledDate = now;
                payment.SettledByUserId = adminUserId;
            }

            await _paymentRepository.UpdateRangeAsync(payments);
        }

        // Groups every fully-paid-but-not-yet-settled payment by practitioner + week, so admin
        // can see, at a glance, every settlement that's ready to be confirmed.
        public async Task<IEnumerable<WeeklySettlementSummaryDto>> GetPendingSettlementsAsync()
        {
            var payments = (await _paymentRepository.GetAllUnsettledFullyPaidAsync()).ToList();

            return payments
                .Where(p => p.PractitionerId.HasValue)
                .GroupBy(p => new
                {
                    PractitionerId = p.PractitionerId!.Value,
                    Week = StartOfWeek(p.Visit?.ScheduledDate ?? p.DateTime)
                })
                .Select(g => new WeeklySettlementSummaryDto
                {
                    PractitionerId = g.Key.PractitionerId,
                    PractitionerName = g.First().Practitioner?.User?.Name ?? string.Empty,
                    WeekStart = g.Key.Week,
                    WeekEnd = g.Key.Week.AddDays(6),
                    VisitCount = g.Count(),
                    Receivable = g.Sum(p => p.Amount),
                    Received = g.Sum(p => p.AmountPaid),
                    PractitionerShare = g.Sum(p => p.PShareAmount),
                    CompanyShare = g.Sum(p => p.Amount - p.PShareAmount),
                    IsFullySettled = false,
                    Payments = g
                        .OrderBy(p => p.Visit?.ScheduledDate ?? DateTime.MaxValue)
                        .Select(PaymentMapper.ToDto)
                        .ToList()
                })
                .OrderBy(s => s.WeekStart)
                .ThenBy(s => s.PractitionerName);
        }

        // Admin overrides one visit's practitioner share directly (e.g. bumping 600 -> 700).
        // Company's share is never stored — it's always derived as Amount - PShareAmount.
        public async Task UpdatePaymentShareAsync(Guid paymentId, UpdatePaymentShareDto dto)
        {
            if (dto.PShareAmount < 0)
                throw new ValidationException("PShareAmount cannot be negative.");

            var payment = await _paymentRepository.GetByIdAsync(paymentId)
                ?? throw new NotFoundException($"Payment {paymentId} not found.");

            if (payment.IsSettled)
                throw new ValidationException("Cannot change the share on a payment that has already been settled.");

            if (dto.PShareAmount > payment.Amount)
                throw new ValidationException(
                    $"PShareAmount ({dto.PShareAmount}) cannot exceed the visit's amount ({payment.Amount}).");

            payment.PShareAmount = dto.PShareAmount;
            await _paymentRepository.UpdateAsync(payment);
        }

        private static DateTime StartOfWeek(DateTime date)
        {
            var diff = (7 + (date.DayOfWeek - DayOfWeek.Monday)) % 7;
            return date.Date.AddDays(-diff);
        }
    }
}