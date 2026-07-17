using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Application.DTOs;

namespace JQZHomeCareProject.Application.Services
{
    public interface IPaymentService
    {
        Task<WeeklySettlementDto> GetWeeklySummaryAsync(Guid practitionerId, DateTime weekStart);
    }
}
