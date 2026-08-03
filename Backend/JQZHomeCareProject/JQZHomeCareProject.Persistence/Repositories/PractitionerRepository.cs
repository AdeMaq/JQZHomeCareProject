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
                .Include(p => p.Service)
                .Include(p => p.CreatedByUser)
                .Include(p => p.PractitionerAreas).ThenInclude(pa => pa.Area).ThenInclude(a => a!.City)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<Practitioner>> GetAllAsync()
        {
            return await _context.Practitioners
                .Include(p => p.Service)
                .Include(p => p.CreatedByUser)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Practitioner>> GetByServiceIdAsync(Guid serviceId)
        {
            return await _context.Practitioners
                .Include(p => p.Service)
                .Where(p => p.ServiceId == serviceId)
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
                .Include(pa => pa.Area).ThenInclude(a => a!.City)
                .Select(pa => pa.Area!)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task AssignAreaAsync(Guid practitionerId, Guid areaId)
        {
            var exists = await _context.PractitionerAreas
                .AnyAsync(pa => pa.PractitionerId == practitionerId && pa.AreaId == areaId);
            if (exists) return;

            await _context.PractitionerAreas.AddAsync(new PractitionerArea
            {
                PractitionerId = practitionerId,
                AreaId = areaId
            });
            await _context.SaveChangesAsync();
        }

        public async Task RemoveAreaAsync(Guid practitionerId, Guid areaId)
        {
            var link = await _context.PractitionerAreas.FirstOrDefaultAsync(pa => pa.PractitionerId == practitionerId && pa.AreaId == areaId);
            if (link is null) return;

            _context.PractitionerAreas.Remove(link);
            await _context.SaveChangesAsync();
        }
        public Task<Practitioner?> GetByPhoneAsync(string phone) =>
            _context.Practitioners.FirstOrDefaultAsync(p => p.Phone == phone);
        public async Task<IEnumerable<Practitioner>> FindAvailableAsync(Guid serviceId, Guid areaId, Guid cityId)
        {
            var exactMatches = await _context.Practitioners
                .Include(p => p.Service)
                .Include(p => p.CreatedByUser)
                .Include(p => p.PractitionerAreas).ThenInclude(pa => pa.Area).ThenInclude(a => a!.City)
                .Where(p => p.ServiceId == serviceId && p.PractitionerAreas.Any(pa => pa.AreaId == areaId))
                .OrderByDescending(p => p.Priority)
                .AsNoTracking()
                .ToListAsync();

            if (exactMatches.Count > 0)
                return exactMatches;

            return await _context.Practitioners
                .Include(p => p.Service)
                .Include(p => p.CreatedByUser)
                .Include(p => p.PractitionerAreas).ThenInclude(pa => pa.Area).ThenInclude(a => a!.City)
                .Where(p => p.ServiceId == serviceId &&  p.PractitionerAreas.Any(pa => pa.Area!.CityId == cityId))
                .OrderByDescending(p => p.Priority)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}