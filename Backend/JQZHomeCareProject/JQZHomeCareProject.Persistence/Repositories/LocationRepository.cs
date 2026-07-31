using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Persistence.Repositories
{
    public class LocationRepository:ILocationRepository
    {
        private readonly AppDbContext _context;
        public LocationRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Location location)
        {
            await _context.Locations.AddAsync(location);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Location location)
        {
            _context.Locations.Update(location);
            await _context.SaveChangesAsync();
        }

        public async Task<Location?> GetByIdAsync(Guid id)
        {
            return await _context.Locations.FindAsync(id);
        }
    }
}
