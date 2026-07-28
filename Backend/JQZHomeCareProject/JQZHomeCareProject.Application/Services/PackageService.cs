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

        public async Task<IEnumerable<PackageDto>> GetByServiceAsync(Guid serviceId)
        {
            var packages = await _packageRepository.GetByServiceIdAsync(serviceId);
            return packages.Select(MapToDto);
        }

        public async Task<PackageDto> GetByIdAsync(Guid id)
        {
            var package = await _packageRepository.GetByIdAsync(id)
                ?? throw new NotFoundException($"Package {id} was not found.");
            return MapToDto(package);
        }

        public async Task<PackageDto> CreateAsync(CreatePackageDto dto)
        {
            var package = new Package
            {
                ServiceId = dto.ServiceId,
                Name = dto.Name,
                NumberOfVisits = dto.NumberOfVisits,
                Amount = dto.Amount
            };
            await _packageRepository.AddAsync(package);
            return MapToDto(package);
        }

        public async Task UpdateAsync(Guid id, UpdatePackageDto dto)
        {
            var package = await _packageRepository.GetByIdAsync(id)
                ?? throw new NotFoundException($"Package {id} was not found.");

            package.Name = dto.Name;
            package.NumberOfVisits = dto.NumberOfVisits;
            package.Amount = dto.Amount;

            await _packageRepository.UpdateAsync(package);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _packageRepository.DeleteAsync(id);
        }

        private static PackageDto MapToDto(Package package)
        {
            var pricePerVisit = package.NumberOfVisits > 0
                ? package.Amount / package.NumberOfVisits
                : 0m;
            // NOTE (doc gap): Savings is defined as "Amount vs. Service's
            // standalone per-visit rate x NumberOfVisits", but the Service
            // entity carries no stored per-visit rate — standalone visit
            // pricing is set ad hoc per-visit by admin (CreateVisitDto.AmountDue),
            // not fixed on Service. There's no baseline to diff against yet,
            // so Savings is left at 0 until that's resolved (e.g. add a
            // StandaloneRate to Service, or pass a reference rate in explicitly).
            var savings = 0m;

            return new PackageDto
            {
                Id = package.Id,
                ServiceId = package.ServiceId,
                ServiceName = package.Service?.Name ?? string.Empty,
                Name = package.Name,
                NumberOfVisits = package.NumberOfVisits,
                Amount = package.Amount,
                PricePerVisit = pricePerVisit,
                Savings = savings
            };
        }
    }
}