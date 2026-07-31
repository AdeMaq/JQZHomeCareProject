using JQZHomeCareProject.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.Common.Interfaces
{
    public interface IPractitionerSettlementRepository
    {
        Task<PractitionerSettlement?> GetByIdAsync(Guid id);
        Task<IEnumerable<PractitionerSettlement>> GetPendingAsync();
        Task<PractitionerSettlement?> GetByPractitionerAndWeekAsync(Guid practitionerId, DateTime weekStart);
        Task AddAsync(PractitionerSettlement settlement);
        Task UpdateAsync(PractitionerSettlement settlement);
    }
}
