using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.Common.Validation;
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
            if (dto.ServiceCategoryId == Guid.Empty)
                throw new ValidationException("ServiceCategoryId is required.");

            var category = await _categoryRepository.GetByIdAsync(dto.ServiceCategoryId)
                ?? throw new ValidationException("ServiceCategoryId does not reference an existing category.");
            var name = NameValidator.NormalizeRequired(dto.Name, "Service name");
            var description = NameValidator.NormalizeOptional(dto.Description, "Description", 1000);
            var all = await _serviceRepository.GetAllAsync();
            NameValidator.EnsureUnique(all, s => s.Name, s => s.Id, name, excludeId: null, entityLabel: "service");

            var service = new Service 
            { 
                Name = name, 
                ServiceCategoryId = dto.ServiceCategoryId, 
                Description = description 
            };
            await _serviceRepository.AddAsync(service);
            service.ServiceCategory = category;
            return MapToDto(service);
        }

        public async Task UpdateAsync(Guid id, UpdateServiceDto dto)
        {
            var service = await _serviceRepository.GetByIdAsync(id)
                ?? throw new NotFoundException($"Service {id} not found.");

            var name = NameValidator.NormalizeRequired(dto.Name, "Service name");
            var all = await _serviceRepository.GetAllAsync();
            NameValidator.EnsureUnique(all, s => s.Name, s => s.Id, name, excludeId: id, entityLabel: "service");

            service.Name = name;
            service.Description = NameValidator.NormalizeOptional(dto.Description, "Description", 1000);
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