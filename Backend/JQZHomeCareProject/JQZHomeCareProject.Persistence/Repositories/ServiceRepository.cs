using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JQZHomeCareProject.Persistence.Repositories
{
    public class ServiceRepository : IServiceRepository
    {
        private readonly AppDbContext _context;
        public ServiceRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Service?> GetByIdAsync(Guid id)
        {
            return await _context.Services
                .Include(s => s.ServiceCategory)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<IEnumerable<Service>> GetAllAsync()
        {
            return await _context.Services
                .Include(s => s.ServiceCategory)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Service>> GetByCategoryIdAsync(Guid serviceCategoryId)
        {
            return await _context.Services
                .Include(s => s.ServiceCategory)
                .Where(s => s.ServiceCategoryId == serviceCategoryId)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task AddAsync(Service service)
        {
            await _context.Services.AddAsync(service);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Service service)
        {
            _context.Services.Update(service);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service is null) return;
            _context.Services.Remove(service);
            await _context.SaveChangesAsync();
        }
    }
}