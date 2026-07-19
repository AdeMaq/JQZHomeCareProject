using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Domain.Entities;
using JQZHomeCareProject.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace JQZHomeCareProject.Persistence.Repositories
{
    public class VisitRepository : IVisitRepository
    {
        private readonly AppDbContext _context;

        public VisitRepository(AppDbContext context)
        {
            _context = context;
        }

        private IQueryable<Visit> IncludeGraph()
        {
            return _context.Visits
                .Include(v => v.Patient)
                .Include(v => v.Practitioner)
                .Include(v => v.Area)
                .Include(v => v.Service)
                .Include(v => v.Package)
                .Include(v => v.Refusals);
        }

        public async Task<Visit?> GetByIdAsync(Guid id)
        {
            return await IncludeGraph().FirstOrDefaultAsync(v => v.Id == id);
        }

        public async Task<IEnumerable<Visit>> GetByDateAsync(DateTime date)
        {
            return await IncludeGraph()
                .Where(v => v.ScheduledDate.Date == date.Date)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Visit>> GetTodayAsync(Guid? practitionerId = null)
        {
            var today = DateTime.UtcNow.Date;

            var query = IncludeGraph().Where(v => v.ScheduledDate.Date == today);

            if (practitionerId.HasValue)
            {
                query = query.Where(v => v.PractitionerId == practitionerId.Value);
            }

            return await query.AsNoTracking().ToListAsync();
        }

        public async Task<IEnumerable<Visit>> GetByPractitionerAsync(Guid practitionerId)
        {
            return await IncludeGraph()
                .Where(v => v.PractitionerId == practitionerId)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Visit>> GetInRangeAsync(DateTime from, DateTime to)
        {
            return await IncludeGraph()
                .Where(v => v.ScheduledDate.Date >= from.Date && v.ScheduledDate.Date <= to.Date)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task AddAsync(Visit visit)
        {
            await _context.Visits.AddAsync(visit);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Visit visit)
        {
            _context.Visits.Update(visit);
            await _context.SaveChangesAsync();
        }
    }
}
