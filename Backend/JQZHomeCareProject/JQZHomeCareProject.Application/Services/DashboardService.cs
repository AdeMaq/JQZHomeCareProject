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
        private readonly IInstallmentPaymentRepository _installmentPaymentRepository;
        private readonly IPatientPackageRepository _patientPackageRepository;

        public DashboardService(
            IVisitRepository visitRepository,
            IRefusalRepository refusalRepository,
            IInstallmentPaymentRepository installmentPaymentRepository,
            IPatientPackageRepository patientPackageRepository)
        {
            _visitRepository = visitRepository;
            _refusalRepository = refusalRepository;
            _installmentPaymentRepository = installmentPaymentRepository;
            _patientPackageRepository = patientPackageRepository;
        }

        public async Task<DashboardSummaryDto> GetSummaryAsync(DateTime from, DateTime to)
        {
            var visits = (await _visitRepository.GetInRangeAsync(from, to)).ToList();

            var expectedVisits = visits.Count(v => v.Status != VisitStatus.Cancelled);
            var completedVisits = visits.Count(v => v.Status == VisitStatus.Completed);

            // Money actually collected in the window — office payments and visit-collected payments alike.
            var paymentReceived = await _installmentPaymentRepository.GetTotalInRangeAsync(from, to);

            // "Pending" is now a package-level concept, not a per-visit one — this is the
            // total still owed across every currently Active package (a live snapshot,
            // not filtered by the from/to range, since a package's balance isn't tied to
            // any single visit anymore).
            var activePackages = (await _patientPackageRepository.GetAllAsync())
                .Where(pp => pp.Status == PatientPackageStatus.Active);
            var pendingCollectionAmount = activePackages.Sum(pp => pp.AmountPending);

            return new DashboardSummaryDto
            {
                ExpectedVisits = expectedVisits,
                ActualVisitsDone = completedVisits,
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