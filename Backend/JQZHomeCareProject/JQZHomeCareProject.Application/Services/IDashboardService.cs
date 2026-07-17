using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Application.DTOs;

namespace JQZHomeCareProject.Application.Services
{
    public interface IDashboardService
    {
        Task<IEnumerable<RefusalDto>> GetRefusalsAsync(DateTime from, DateTime to);
    }
}
