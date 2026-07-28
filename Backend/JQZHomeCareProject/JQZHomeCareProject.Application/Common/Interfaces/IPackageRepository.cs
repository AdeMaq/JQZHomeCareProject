using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Entities;

namespace JQZHomeCareProject.Application.Common.Interfaces
{
    public interface IPackageRepository
    {
        Task<Package?> GetByIdAsync(Guid id);
        Task<IEnumerable<Package>> GetAllAsync();
        Task<IEnumerable<Package>> GetByServiceIdAsync(Guid serviceId);
        Task AddAsync(Package package);
        Task UpdateAsync(Package package);
        Task DeleteAsync(Guid id);
    }
}
