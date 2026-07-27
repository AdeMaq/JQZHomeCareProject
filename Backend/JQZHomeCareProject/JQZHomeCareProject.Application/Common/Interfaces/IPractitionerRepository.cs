using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Entities;

namespace JQZHomeCareProject.Application.Common.Interfaces
{
    public interface IPractitionerRepository
    {
        Task<Practitioner?> GetByIdAsync(Guid id);
        Task<IEnumerable<Practitioner>> GetAllAsync();
        Task<IEnumerable<Practitioner>> GetByServiceIdAsync(Guid serviceId);
        Task AddAsync(Practitioner practitioner);
        Task UpdateAsync(Practitioner practitioner);

        Task<IEnumerable<Area>> GetAreasAsync(Guid practitionerId);
        Task AssignAreaAsync(Guid practitionerId, Guid areaId);
        Task RemoveAreaAsync(Guid practitionerId, Guid areaId);

        Task<IEnumerable<Practitioner>> FindAvailableAsync(Guid serviceId, Guid areaId, Guid cityId);
    }
}
