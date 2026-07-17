using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Application.DTOs;

namespace JQZHomeCareProject.Application.Services
{
    public interface IDashboardService
    {
        Task<IEnumerable<RefusalDto>> GetRefusalsAsync(DateTime from, DateTime to);
        Task<DasboardSummaryDto> GetSummaryAsync(DateTime from, DateTime to);
    }
}
