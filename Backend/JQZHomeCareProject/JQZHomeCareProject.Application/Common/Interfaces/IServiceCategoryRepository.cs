using System;
using System.Collections.Generic;
using JQZHomeCareProject.Domain.Entities;
using System.Text;

namespace JQZHomeCareProject.Application.Common.Interfaces
{
    public interface IServiceCategoryRepository
    {
        Task<ServiceCategory?> GetByIdAsync(Guid id);
        Task<IEnumerable<ServiceCategory>> GetAllAsync();
        Task AddAsync(ServiceCategory serviceCategory);
        Task UpdateAsync(ServiceCategory serviceCategory);
        Task DeleteAsync(Guid id);
    }
}
