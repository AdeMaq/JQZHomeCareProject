using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Domain.Entities;
using JQZHomeCareProject.Application.Common.Validation;
namespace JQZHomeCareProject.Application.Services
{
    public class CityService : ICityService
    {
        private readonly ICityRepository _cityRepository;
        private readonly IAreaRepository _areaRepository;

        public CityService(ICityRepository cityRepository, IAreaRepository areaRepository)
        {
            _cityRepository = cityRepository;
            _areaRepository = areaRepository;
        }

        public async Task<IEnumerable<CityDto>> GetAllAsync()
        {
            var cities = await _cityRepository.GetAllAsync();
            return cities.Select(MapToDto);
        }

        public async Task<CityDto> GetByIdAsync(Guid id)
        {
            var city = await _cityRepository.GetByIdAsync(id)
                ?? throw new NotFoundException($"City with id {id} was not found.");
            return MapToDto(city);
        }

        public async Task<CityDto> CreateAsync(CreateCityDto dto)
        {
            var city = new City { Name = dto.Name };
            await _cityRepository.AddAsync(city);
            return MapToDto(city);
        }

        public async Task UpdateAsync(Guid id, UpdateCityDto dto)
        {
            var city = await _cityRepository.GetByIdAsync(id)
                ?? throw new NotFoundException($"City with id {id} was not found.");

            city.Name = dto.Name;
            await _cityRepository.UpdateAsync(city);
        }

        public async Task DeleteAsync(Guid id)
        {
            var city = await _cityRepository.GetByIdAsync(id)
                ?? throw new NotFoundException($"City with id {id} was not found.");
            await _cityRepository.DeleteAsync(id);
        }

        public async Task<IEnumerable<AreaDto>> GetAreasByCityAsync(Guid cityId)
        {
            await GetByIdAsync(cityId); // ensures the city exists, throws NotFoundException otherwise

            var areas = await _areaRepository.GetByCityIdAsync(cityId);
            return areas.Select(a => new AreaDto
            {
                Id = a.Id,
                Name = a.Name,
                CityId = a.CityId,
                CityName = a.City?.Name ?? string.Empty
            });
        }

        private static CityDto MapToDto(City city) => new()
        {
            Id = city.Id,
            Name = city.Name
        };
    }
}
