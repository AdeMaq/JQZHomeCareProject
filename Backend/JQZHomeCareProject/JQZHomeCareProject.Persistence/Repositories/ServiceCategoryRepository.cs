using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JQZHomeCareProject.Persistence.Repositories
{
    public class ServiceCategoryRepository : IServiceCategoryRepository
    {
        private readonly AppDbContext _context;
        public ServiceCategoryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceCategory?> GetByIdAsync(Guid id)
        {
            return await _context.ServiceCategories.FirstOrDefaultAsync(sc => sc.Id == id);
        }

        public async Task<IEnumerable<ServiceCategory>> GetAllAsync()
        {
            return await _context.ServiceCategories.AsNoTracking().ToListAsync();
        }

        public async Task AddAsync(ServiceCategory serviceCategory)
        {
            await _context.ServiceCategories.AddAsync(serviceCategory);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(ServiceCategory serviceCategory)
        {
            _context.ServiceCategories.Update(serviceCategory);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var category = await _context.ServiceCategories.FindAsync(id);
            if (category is null) return;
            _context.ServiceCategories.Remove(category);
            await _context.SaveChangesAsync();
        }
    }
}