using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Domain.Entities;

namespace JQZHomeCareProject.Application.Services
{
    public class ServiceCategoryService : IServiceCategoryService
    {
        private readonly IServiceCategoryRepository _repository;

        public ServiceCategoryService(IServiceCategoryRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<ServiceCategoryDto>> GetAllAsync()
        {
            var categories = await _repository.GetAllAsync();
            return categories.Select(MapToDto);
        }

        public async Task<ServiceCategoryDto> GetByIdAsync(Guid id)
        {
            var category = await _repository.GetByIdAsync(id)
                ?? throw new NotFoundException($"ServiceCategory {id} not found.");
            return MapToDto(category);
        }

        public async Task<ServiceCategoryDto> CreateAsync(CreateServiceCategoryDto dto)
        {
            var category = new ServiceCategory { Name = dto.Name };
            await _repository.AddAsync(category);
            return MapToDto(category);
        }

        public async Task UpdateAsync(Guid id, UpdateServiceCategoryDto dto)
        {
            var category = await _repository.GetByIdAsync(id)
                ?? throw new NotFoundException($"ServiceCategory {id} not found.");

            category.Name = dto.Name;
            await _repository.UpdateAsync(category);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _repository.DeleteAsync(id);
        }

        private static ServiceCategoryDto MapToDto(ServiceCategory category) => new()
        {
            Id = category.Id,
            Name = category.Name
        };
    }
}