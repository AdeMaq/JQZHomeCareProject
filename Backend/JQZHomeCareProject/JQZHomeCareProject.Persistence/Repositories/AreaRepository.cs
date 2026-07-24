using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JQZHomeCareProject.Persistence.Repositories
{
    public class AreaRepository : IAreaRepository
    {
        private readonly AppDbContext _context;

        public AreaRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Area?> GetByIdAsync(Guid id)
        {
            return await _context.Areas
                .Include(a => a.City)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<IEnumerable<Area>> GetAllAsync()
        {
            return await _context.Areas
                .Include(a => a.City)
                .ToListAsync();
        }

        public async Task<IEnumerable<Area>> GetByCityIdAsync(Guid cityId)
        {
            return await _context.Areas
                .Include(a => a.City)
                .Where(a => a.CityId == cityId)
                .ToListAsync();
        }

        public async Task AddAsync(Area area)
        {
            await _context.Areas.AddAsync(area);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Area area)
        {
            _context.Areas.Update(area);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var area = await _context.Areas.FindAsync(id);
            if (area is null) return;

            _context.Areas.Remove(area);
            await _context.SaveChangesAsync();
        }
    }
}