using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JQZHomeCareProject.Persistence.Repositories
{
    public class PackageRepository : IPackageRepository
    {
        private readonly AppDbContext _context;

        public PackageRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Package?> GetByIdAsync(Guid id)
        {
            return await _context.Packages
                .Include(p => p.Service)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<Package>> GetAllAsync()
        {
            return await _context.Packages
                .Include(p => p.Service)
                .ToListAsync();
        }

        public async Task<IEnumerable<Package>> GetByServiceIdAsync(Guid serviceId)
        {
            return await _context.Packages
                .Include(p => p.Service)
                .Where(p => p.ServiceId == serviceId)
                .ToListAsync();
        }

        public async Task AddAsync(Package package)
        {
            await _context.Packages.AddAsync(package);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Package package)
        {
            _context.Packages.Update(package);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var package = await _context.Packages.FindAsync(id);
            if (package is null) return;

            _context.Packages.Remove(package);
            await _context.SaveChangesAsync();
        }
    }
}