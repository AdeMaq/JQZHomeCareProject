using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Domain.Entities;
using JQZHomeCareProject.Domain.Enums;

namespace JQZHomeCareProject.Application.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IVisitRepository _visitRepository;
        private readonly IPaymentRepository _paymentRepository;
        private readonly IRefusalRepository _refusalRepository;

        public DashboardService(
            IVisitRepository visitRepository,
            IPaymentRepository paymentRepository,
            IRefusalRepository refusalRepository)
        {
            _visitRepository = visitRepository;
            _paymentRepository = paymentRepository;
            _refusalRepository = refusalRepository;
        }

        public async Task<DashboardSummaryDto> GetSummaryAsync(DateTime from, DateTime to)
        {
            var visitsInRange = (await _visitRepository.GetInRangeAsync(from, to)).ToList();

            var expectedVisits = visitsInRange.Count(v => v.Status != VisitStatus.Cancelled);
            var actualVisitsDone = visitsInRange.Count(v => v.Status == VisitStatus.Completed);

            var paymentsInRange = (await _paymentRepository.GetInRangeAsync(from, to)).ToList();
            var paymentReceived = paymentsInRange.Sum(p => p.AmountPaid);

            // Pending collection is a point-in-time balance across active packages, not date-scoped —
            // money owed doesn't become irrelevant just because it fell outside the requested window.
            var pendingCollectionAmount = await _paymentRepository.GetTotalPendingAsync();

            return new DashboardSummaryDto
            {
                ExpectedVisits = expectedVisits,
                ActualVisitsDone = actualVisitsDone,
                PaymentReceived = paymentReceived,
                PendingCollectionAmount = pendingCollectionAmount
            };
        }

        public async Task<IEnumerable<Refusal>> GetRefusalsAsync(DateTime from, DateTime to)
            => await _refusalRepository.GetByDateRangeAsync(from, to);
    }
}