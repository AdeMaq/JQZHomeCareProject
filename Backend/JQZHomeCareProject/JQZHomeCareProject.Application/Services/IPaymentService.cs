using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Application.DTOs;

namespace JQZHomeCareProject.Application.Services
{
    public interface IPaymentService
    {
        Task<PractitionerSettlementDto> GenerateWeeklySettlementAsync(Guid practitionerId, DateTime weekStart);
        Task MarkSettlementReceivedAsync(Guid settlementId, Guid adminUserId);
        Task<IEnumerable<PractitionerSettlementDto>> GetPendingSettlementsAsync();
        Task<PractitionerSettlementDto> GetByIdAsync(Guid id);
        Task<WeeklySettlementDto> GetWeeklySummaryAsync(Guid practitionerId, DateTime weekStart);
    }
}
