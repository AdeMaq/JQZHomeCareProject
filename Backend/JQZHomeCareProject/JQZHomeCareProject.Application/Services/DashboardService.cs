using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Domain.Enums;

namespace JQZHomeCareProject.Application.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IRefusalRepository _refusalRepository;
        private readonly IUserRepository _userRepository;
        private readonly IVisitRepository _visitRepository;

        public DashboardService(IRefusalRepository refusalRepository, IUserRepository userRepository, IVisitRepository visitRepository)
        {
            _refusalRepository = refusalRepository;
            _userRepository = userRepository;
            _visitRepository = visitRepository;
        }

        public async Task<IEnumerable<RefusalDto>> GetRefusalsAsync(DateTime from, DateTime to)
        {
            if (to < from)
            {
                throw new ValidationException("'to' date cannot be earlier than 'from' date.");
            }

            var refusals = await _refusalRepository.GetByDateRangeAsync(from, to);
            var result = new List<RefusalDto>();

            foreach (var refusal in refusals)
            {
                var practitionerUser = refusal.Visit is not null
                    ? await _userRepository.GetByPractitionerIdAsync(refusal.Visit.PractitionerId)
                    : null;

                result.Add(new RefusalDto
                {
                    Id = refusal.Id,
                    VisitId = refusal.VisitId,
                    PatientName = refusal.Visit?.Patient?.Name ?? string.Empty,
                    PractitionerName = practitionerUser?.Name ?? string.Empty,
                    RefusedBy = refusal.RefusedBy,
                    Reason = refusal.Reason,
                    Date = refusal.Date
                });
            }

            return result;
        }

        public async Task<DasboardSummaryDto> GetSummaryAsync(DateTime from, DateTime to)
        {
            if (to < from)
            {
                throw new ValidationException("'to' date cannot be earlier than 'from' date.");
            }
            var visits = await _visitRepository.GetInRangeAsync(from, to);
            var VisitList = visits.ToList();

            var expectedVisits = VisitList.Count(v => v.Status != VisitStatus.Cancelled);
            var actualVisitsDone = VisitList.Count(v => v.Status == VisitStatus.Completed);
            var paymentReceived = VisitList.Where(v => v.Status == VisitStatus.Completed).Sum(v => v.AmountReceived);

            return new DasboardSummaryDto
            {
                ExpectedVisits = expectedVisits,
                ActualVisitsDone = actualVisitsDone,
                PaymentReceived = paymentReceived
            };
        }
    }
}