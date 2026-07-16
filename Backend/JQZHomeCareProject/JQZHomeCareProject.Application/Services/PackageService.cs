using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Domain.Entities;

namespace JQZHomeCareProject.Application.Services
{
    public class PackageService : IPackageService
    {
        private readonly IPackageRepository _packageRepository;

        public PackageService(IPackageRepository packageRepository)
        {
            _packageRepository = packageRepository;
        }

        public async Task<IEnumerable<PackageDto>> GetAllAsync()
        {
            var packages = await _packageRepository.GetAllAsync();
            return packages.Select(MapToDto);
        }

        public async Task<PackageDto> GetByIdAsync(Guid id)
        {
            var package = await _packageRepository.GetByIdAsync(id);
            if (package is null)
            {
                throw new NotFoundException($"Package with id '{id}' was not found.");
            }

            return MapToDto(package);
        }

        public async Task<PackageDto> CreateAsync(CreatePackageDto dto)
        {
            Validate(dto.Name, dto.NumberOfVisits, dto.Amount);

            var package = new Package
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                NumberOfVisits = dto.NumberOfVisits,
                Amount = dto.Amount,
                CreatedAt = DateTime.UtcNow
            };

            await _packageRepository.AddAsync(package);

            return MapToDto(package);
        }

        public async Task UpdateAsync(Guid id, UpdatePackageDto dto)
        {
            var package = await _packageRepository.GetByIdAsync(id);
            if (package is null)
            {
                throw new NotFoundException($"Package with id '{id}' was not found.");
            }

            Validate(dto.Name, dto.NumberOfVisits, dto.Amount);

            package.Name = dto.Name;
            package.NumberOfVisits = dto.NumberOfVisits;
            package.Amount = dto.Amount;
            package.UpdatedAt = DateTime.UtcNow;

            await _packageRepository.UpdateAsync(package);
        }

        public async Task DeleteAsync(Guid id)
        {
            var package = await _packageRepository.GetByIdAsync(id);
            if (package is null)
            {
                throw new NotFoundException($"Package with id '{id}' was not found.");
            }

            await _packageRepository.DeleteAsync(id);
        }

        private static void Validate(string name, int numberOfVisits, decimal amount)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ValidationException("Package name is required.");
            }

            if (numberOfVisits <= 0)
            {
                throw new ValidationException("Number of visits must be greater than zero.");
            }

            if (amount < 0)
            {
                throw new ValidationException("Amount cannot be negative.");
            }
        }

        private static PackageDto MapToDto(Package package)
        {
            return new PackageDto
            {
                Id = package.Id,
                Name = package.Name,
                NumberOfVisits = package.NumberOfVisits,
                Amount = package.Amount
            };
        }
    }
}
