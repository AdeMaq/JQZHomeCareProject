using JQZHomeCareProject.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.Services
{
    public interface IServiceCategoryService
    {
        Task<IEnumerable<ServiceCategoryDto>> GetAllAsync();
        Task<ServiceCategoryDto> GetByIdAsync(Guid id);
        Task<ServiceCategoryDto> CreateAsync(CreateServiceCategoryDto dto);
        Task UpdateAsync(Guid id, UpdateServiceCategoryDto dto);
        Task DeleteAsync(Guid id);
    }
}
