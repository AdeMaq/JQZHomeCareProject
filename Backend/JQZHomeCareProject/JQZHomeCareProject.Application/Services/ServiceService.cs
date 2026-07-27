using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Domain.Entities;

namespace JQZHomeCareProject.Application.Services
{
    public class ServiceService : IServiceService
    {
        private readonly IServiceRepository _serviceRepository;
        private readonly IServiceCategoryRepository _categoryRepository;

        public ServiceService(IServiceRepository serviceRepository, IServiceCategoryRepository categoryRepository)
        {
            _serviceRepository = serviceRepository;
            _categoryRepository = categoryRepository;
        }

        public async Task<IEnumerable<ServiceDto>> GetAllAsync()
        {
            var services = await _serviceRepository.GetAllAsync();
            return services.Select(MapToDto);
        }

        public async Task<IEnumerable<ServiceDto>> GetByCategoryIdAsync(Guid serviceCategoryId)
        {
            var services = await _serviceRepository.GetByCategoryIdAsync(serviceCategoryId);
            return services.Select(MapToDto);
        }

        public async Task<ServiceDto> GetByIdAsync(Guid id)
        {
            var service = await _serviceRepository.GetByIdAsync(id)
                ?? throw new NotFoundException($"Service {id} not found.");
            return MapToDto(service);
        }

        public async Task<ServiceDto> CreateAsync(CreateServiceDto dto)
        {
            var category = await _categoryRepository.GetByIdAsync(dto.ServiceCategoryId)
                ?? throw new ValidationException("ServiceCategoryId does not reference an existing category.");

            var service = new Service
            {
                Name = dto.Name,
                ServiceCategoryId = dto.ServiceCategoryId,
                Description = dto.Description
            };

            await _serviceRepository.AddAsync(service);
            service.ServiceCategory = category;
            return MapToDto(service);
        }

        public async Task UpdateAsync(Guid id, UpdateServiceDto dto)
        {
            var service = await _serviceRepository.GetByIdAsync(id)
                ?? throw new NotFoundException($"Service {id} not found.");

            service.Name = dto.Name;
            service.Description = dto.Description;
            await _serviceRepository.UpdateAsync(service);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _serviceRepository.DeleteAsync(id);
        }

        private static ServiceDto MapToDto(Service service) => new()
        {
            Id = service.Id,
            Name = service.Name,
            ServiceCategoryId = service.ServiceCategoryId,
            ServiceCategoryName = service.ServiceCategory?.Name ?? string.Empty,
            Description = service.Description
        };
    }
}