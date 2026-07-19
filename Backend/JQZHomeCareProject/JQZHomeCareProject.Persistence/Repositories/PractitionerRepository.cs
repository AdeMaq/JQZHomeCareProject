using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JQZHomeCareProject.Persistence.Repositories
{
    public class PractitionerRepository : IPractitionerRepository
    {
        private readonly AppDbContext _context;

        public PractitionerRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Practitioner?> GetByIdAsync(Guid id)
        {
            return await _context.Practitioners
                .Include(p => p.PractitionerAreas)
                    .ThenInclude(pa => pa.Area)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<Practitioner>> GetAllAsync()
        {
            return await _context.Practitioners
                .Include(p => p.PractitionerAreas)
                    .ThenInclude(pa => pa.Area)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task AddAsync(Practitioner practitioner)
        {
            await _context.Practitioners.AddAsync(practitioner);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Practitioner practitioner)
        {
            _context.Practitioners.Update(practitioner);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Area>> GetAreasAsync(Guid practitionerId)
        {
            return await _context.PractitionerAreas
                .Where(pa => pa.PractitionerId == practitionerId)
                .Select(pa => pa.Area!)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task AssignAreaAsync(Guid practitionerId, Guid areaId)
        {
            var exists = await _context.PractitionerAreas
                .AnyAsync(pa => pa.PractitionerId == practitionerId && pa.AreaId == areaId);

            if (exists)
            {
                return;
            }

            var practitionerArea = new PractitionerArea
            {
                Id = Guid.NewGuid(),
                PractitionerId = practitionerId,
                AreaId = areaId,
                CreatedAt = DateTime.UtcNow
            };

            await _context.PractitionerAreas.AddAsync(practitionerArea);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveAreaAsync(Guid practitionerId, Guid areaId)
        {
            var practitionerArea = await _context.PractitionerAreas
                .FirstOrDefaultAsync(pa => pa.PractitionerId == practitionerId && pa.AreaId == areaId);

            if (practitionerArea is null)
            {
                return;
            }

            _context.PractitionerAreas.Remove(practitionerArea);
            await _context.SaveChangesAsync();
        }
    }
}
