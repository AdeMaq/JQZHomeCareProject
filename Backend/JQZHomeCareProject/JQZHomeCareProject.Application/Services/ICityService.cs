using JQZHomeCareProject.Application.DTOs;

namespace JQZHomeCareProject.Application.Services
{
    public interface ICityService
    {
        Task<IEnumerable<CityDto>> GetAllAsync();
        Task<CityDto> GetByIdAsync(Guid id);
        Task<CityDto> CreateAsync(CreateCityDto dto);
        Task UpdateAsync(Guid id, UpdateCityDto dto);
        Task DeleteAsync(Guid id);
        Task<IEnumerable<AreaDto>> GetAreasByCityAsync(Guid cityId);
    }
}