using JQZHomeCareProject.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.Services
{
    public interface IPackageService
    {
        Task<IEnumerable<PackageDto>> GetAllAsync();
        Task<IEnumerable<PackageDto>> GetByServiceAsync(Guid serviceId);
        Task<PackageDto> GetByIdAsync(Guid id);
        Task<PackageDto> CreateAsync(CreatePackageDto dto);
        Task UpdateAsync(Guid id, UpdatePackageDto dto);
        Task DeleteAsync(Guid id);
    }
}
