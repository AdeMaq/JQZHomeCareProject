using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Domain.Entities;
using JQZHomeCareProject.Domain.Enums;

namespace JQZHomeCareProject.Application.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IVisitRepository _visitRepository;
        private readonly IRefusalRepository _refusalRepository;

        public DashboardService(IVisitRepository visitRepository, IRefusalRepository refusalRepository)
        {
            _visitRepository = visitRepository;
            _refusalRepository = refusalRepository;
        }

        public async Task<DashboardSummaryDto> GetSummaryAsync(DateTime from, DateTime to)
        {
            var visits = (await _visitRepository.GetInRangeAsync(from, to)).ToList();

            var expectedVisits = visits.Count(v => v.Status != VisitStatus.Cancelled);
            var completedVisits = visits.Where(v => v.Status == VisitStatus.Completed).ToList();

            var paymentReceived = completedVisits.Sum(v => v.AmountReceived);
            var pendingCollectionAmount = completedVisits
                .Where(v => v.CollectionStatus == CollectionStatus.Pending)
                .Sum(v => v.AmountDue);

            return new DashboardSummaryDto
            {
                ExpectedVisits = expectedVisits,
                ActualVisitsDone = completedVisits.Count,
                PaymentReceived = paymentReceived,
                PendingCollectionAmount = pendingCollectionAmount
            };
        }

        public Task<IEnumerable<Refusal>> GetRefusalsAsync(DateTime from, DateTime to)
        {
            return _refusalRepository.GetByDateRangeAsync(from, to);
        }
    }
}