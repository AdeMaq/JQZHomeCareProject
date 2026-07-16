using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.DTOs;
using DomainService = JQZHomeCareProject.Domain.Entities.Service;

namespace JQZHomeCareProject.Application.Services
{
    public class ServiceService : IServiceService
    {
        private readonly IServiceRepository _serviceRepository;

        public ServiceService(IServiceRepository serviceRepository)
        {
            _serviceRepository = serviceRepository;
        }

        public async Task<IEnumerable<ServiceDto>> GetAllAsync()
        {
            var services = await _serviceRepository.GetAllAsync();
            return services.Select(MapToDto);
        }

        public async Task<ServiceDto> GetByIdAsync(Guid id)
        {
            var service = await _serviceRepository.GetByIdAsync(id);
            if (service is null)
            {
                throw new NotFoundException($"Service with id '{id}' was not found.");
            }

            return MapToDto(service);
        }

        public async Task<ServiceDto> CreateAsync(CreateServiceDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new ValidationException("Service name is required.");
            }

            var service = new DomainService
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Category = dto.Category,
                Description = dto.Description,
                CreatedAt = DateTime.UtcNow
            };

            await _serviceRepository.AddAsync(service);

            return MapToDto(service);
        }

        public async Task UpdateAsync(Guid id, UpdateServiceDto dto)
        {
            var service = await _serviceRepository.GetByIdAsync(id);
            if (service is null)
            {
                throw new NotFoundException($"Service with id '{id}' was not found.");
            }

            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new ValidationException("Service name is required.");
            }

            service.Name = dto.Name;
            service.Category = dto.Category;
            service.Description = dto.Description;
            service.UpdatedAt = DateTime.UtcNow;

            await _serviceRepository.UpdateAsync(service);
        }

        public async Task DeleteAsync(Guid id)
        {
            var service = await _serviceRepository.GetByIdAsync(id);
            if (service is null)
            {
                throw new NotFoundException($"Service with id '{id}' was not found.");
            }

            await _serviceRepository.DeleteAsync(id);
        }

        private static ServiceDto MapToDto(DomainService service)
        {
            return new ServiceDto
            {
                Id = service.Id,
                Name = service.Name,
                Category = service.Category,
                Description = service.Description
            };
        }
    }
}