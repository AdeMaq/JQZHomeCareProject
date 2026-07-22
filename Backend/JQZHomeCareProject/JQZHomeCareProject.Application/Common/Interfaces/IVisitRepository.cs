using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Entities;

namespace JQZHomeCareProject.Application.Common.Interfaces
{
    public interface IVisitRepository
    {
        Task<Visit?> GetByIdAsync(Guid id);
        Task<IEnumerable<Visit>> GetByDateAsync(DateTime date);
        Task<IEnumerable<Visit>> GetTodayAsync(Guid? practitionerId = null);
        Task<IEnumerable<Visit>> GetByPractitionerAsync(Guid practitionerId);
        Task<IEnumerable<Visit>> GetInRangeAsync(DateTime from, DateTime to);
        Task AddAsync(Visit visit);
        Task UpdateAsync(Visit visit);
        Task<IEnumerable<Visit>> GetAllAsync();
        Task DeleteAsync(Guid id);
    }
}
