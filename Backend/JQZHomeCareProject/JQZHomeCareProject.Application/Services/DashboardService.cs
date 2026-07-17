using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.DTOs;

namespace JQZHomeCareProject.Application.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IRefusalRepository _refusalRepository;
        private readonly IUserRepository _userRepository;

        public DashboardService(IRefusalRepository refusalRepository, IUserRepository userRepository)
        {
            _refusalRepository = refusalRepository;
            _userRepository = userRepository;
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
    }
}