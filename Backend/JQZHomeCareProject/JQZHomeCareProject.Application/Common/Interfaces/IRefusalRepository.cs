using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Entities;

namespace JQZHomeCareProject.Application.Common.Interfaces
{
    public interface IRefusalRepository
    {
        Task AddAsync(Refusal refusal);
        Task<IEnumerable<Refusal>> GetByDateRangeAsync(DateTime from, DateTime to);
    }
}
