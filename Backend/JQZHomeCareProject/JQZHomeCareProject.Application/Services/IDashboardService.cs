using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.Services
{
    public interface IDashboardService
    {
        Task<DashboardSummaryDto> GetSummaryAsync(DateTime from, DateTime to);
        Task<IEnumerable<Refusal>> GetRefusalsAsync(DateTime from, DateTime to);
    }
}
