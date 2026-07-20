using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Domain.Entities;

namespace JQZHomeCareProject.Application.Services
{
    public class AreaService : IAreaService
    {
        private readonly IAreaRepository _areaRepository;

        public AreaService(IAreaRepository areaRepository)
        {
            _areaRepository = areaRepository;
        }

        public async Task<IEnumerable<AreaDto>> GetAllAsync()
        {
            var areas = await _areaRepository.GetAllAsync();
            return areas.Select(MapToDto);
        }

        public async Task<AreaDto> GetByIdAsync(Guid id)
        {
            var area = await _areaRepository.GetByIdAsync(id);
            if (area is null)
            {
                throw new NotFoundException($"Area with id '{id}' was not found.");
            }

            return MapToDto(area);
        }

        public async Task<AreaDto> CreateAsync(CreateAreaDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new ValidationException("Area name is required.");
            }

            var area = new Area
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                CreatedAt = DateTime.UtcNow
            };

            await _areaRepository.AddAsync(area);

            return MapToDto(area);
        }

        public async Task UpdateAsync(Guid id, UpdateAreaDto dto)
        {
            var area = await _areaRepository.GetByIdAsync(id);
            if (area is null)
            {
                throw new NotFoundException($"Area with id '{id}' was not found.");
            }

            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new ValidationException("Area name is required.");
            }

            area.Name = dto.Name;
            area.UpdatedAt = DateTime.UtcNow;

            await _areaRepository.UpdateAsync(area);
        }

        public async Task DeleteAsync(Guid id)
        {
            var area = await _areaRepository.GetByIdAsync(id);
            if (area is null)
            {
                throw new NotFoundException($"Area with id '{id}' was not found.");
            }

            await _areaRepository.DeleteAsync(id);
        }

        private static AreaDto MapToDto(Area area)
        {
            return new AreaDto
            {
                Id = area.Id,
                Name = area.Name
            };
        }
    }
}