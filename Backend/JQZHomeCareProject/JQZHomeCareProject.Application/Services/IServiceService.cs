using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Application.DTOs;

namespace JQZHomeCareProject.Application.Services
{
    public interface IServiceService
    {
        Task<IEnumerable<ServiceDto>> GetAllAsync();
        Task<IEnumerable<ServiceDto>> GetByCategoryIdAsync(Guid serviceCategoryId);
        Task<ServiceDto> GetByIdAsync(Guid id);
        Task<ServiceDto> CreateAsync(CreateServiceDto dto);
        Task UpdateAsync(Guid id, UpdateServiceDto dto);
        Task DeleteAsync(Guid id);
    }
}
