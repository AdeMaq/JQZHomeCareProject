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
        Task<IEnumerable<Visit>> GetByPatientPackageIdAsync(Guid patientPackageId);
        Task<IEnumerable<Visit>> GetInRangeAsync(DateTime from, DateTime to);
        Task<IEnumerable<Visit>> GetUnsettledCompletedAsync(Guid practitionerId, DateTime from, DateTime to);
        Task<IEnumerable<Visit>> GetAllAsync();
        Task AddAsync(Visit visit);
        Task AddRangeAsync(IEnumerable<Visit> visits);
        Task UpdateAsync(Visit visit);
        Task<IEnumerable<Visit>> GetByPractitionerAndDateAsync(Guid practitionerId, DateTime date);
        Task<IEnumerable<Visit>> GetByPatientAndDateAsync(Guid patientId, DateTime date);
    }
}
