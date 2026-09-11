using JQZHomeCareProject.Application.DTOs;

namespace JQZHomeCareProject.Application.Services
{
    public interface IPaymentService
    {
        Task<WeeklySettlementSummaryDto> GetWeeklySummaryAsync(Guid practitionerId, DateTime weekStart);
        Task MarkWeekSettledAsync(Guid practitionerId, DateTime weekStart, Guid adminUserId);
        Task<IEnumerable<WeeklySettlementSummaryDto>> GetPendingSettlementsAsync();
        Task UpdatePaymentShareAsync(Guid paymentId, UpdatePaymentShareDto dto);
    }
}