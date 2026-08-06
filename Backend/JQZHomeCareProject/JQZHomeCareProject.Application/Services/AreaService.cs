using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.Common.Validation;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Domain.Entities;

namespace JQZHomeCareProject.Application.Services
{
    public class AreaService : IAreaService
    {
        private readonly IAreaRepository _areaRepository;
        private readonly ICityRepository _cityRepository;

        public AreaService(IAreaRepository areaRepository, ICityRepository cityRepository)
        {
            _areaRepository = areaRepository;
            _cityRepository = cityRepository;
        }

        public async Task<IEnumerable<AreaDto>> GetAllAsync()
        {
            var areas = await _areaRepository.GetAllAsync();
            return areas.Select(MapToDto);
        }

        public async Task<AreaDto> GetByIdAsync(Guid id)
        {
            var area = await _areaRepository.GetByIdAsync(id)
                ?? throw new NotFoundException($"Area with id {id} was not found.");
            return MapToDto(area);
        }

        public async Task<AreaDto> CreateAsync(CreateAreaDto dto)
        {
            if (dto.CityId == Guid.Empty)
                throw new ValidationException("CityId is required.");

            var city = await _cityRepository.GetByIdAsync(dto.CityId)
                ?? throw new NotFoundException($"City with id {dto.CityId} was not found.");

            var name = NameValidator.NormalizeRequired(dto.Name, "Area name");
            var areasInCity = await _areaRepository.GetByCityIdAsync(dto.CityId);
            NameValidator.EnsureUnique(areasInCity, a => a.Name, a => a.Id, name, excludeId: null, entityLabel: "area in this city");

            var area = new Area { Name = name, CityId = dto.CityId };
            await _areaRepository.AddAsync(area);
            area.City = city;
            return MapToDto(area);
        }

        public async Task UpdateAsync(Guid id, UpdateAreaDto dto)
        {
            var area = await _areaRepository.GetByIdAsync(id)
                ?? throw new NotFoundException($"Area with id {id} was not found.");

            if (dto.CityId == Guid.Empty)
                throw new ValidationException("CityId is required.");

            var name = NameValidator.NormalizeRequired(dto.Name, "Area name");

            if (dto.CityId != area.CityId)
            {
                var newCity = await _cityRepository.GetByIdAsync(dto.CityId)
                    ?? throw new NotFoundException($"City with id {dto.CityId} was not found.");
                area.City = newCity;
                area.CityId = dto.CityId;
            }

            var areasInCity = await _areaRepository.GetByCityIdAsync(dto.CityId);
            NameValidator.EnsureUnique(areasInCity, a => a.Name, a => a.Id, name, excludeId: id, entityLabel: "area in this city");

            area.Name = name;
            await _areaRepository.UpdateAsync(area);
        }

        public async Task DeleteAsync(Guid id)
        {
            var area = await _areaRepository.GetByIdAsync(id)
                ?? throw new NotFoundException($"Area with id {id} was not found.");
            await _areaRepository.DeleteAsync(id);
        }

        private static AreaDto MapToDto(Area area) => new()
        {
            Id = area.Id,
            Name = area.Name,
            CityId = area.CityId,
            CityName = area.City?.Name ?? string.Empty
        };
    }
}