using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Application.DTOs;

namespace JQZHomeCareProject.Application.Services
{
    public interface IAreaService
    {
        Task<IEnumerable<AreaDto>> GetAllAsync();
        Task<AreaDto> GetByIdAsync(Guid id);
        Task<AreaDto> CreateAsync(CreateAreaDto dto);
        Task UpdateAsync(Guid id, UpdateAreaDto dto);
        Task DeleteAsync(Guid id);
    }
}
