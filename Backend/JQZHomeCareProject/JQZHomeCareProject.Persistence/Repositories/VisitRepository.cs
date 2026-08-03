using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Domain.Entities;
using JQZHomeCareProject.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace JQZHomeCareProject.Persistence.Repositories
{
    public class VisitRepository : IVisitRepository
    {
        private readonly AppDbContext _context;
        public VisitRepository(AppDbContext context) => _context = context;

        private IQueryable<Visit> WithIncludes() =>
            _context.Visits
                .Include(v => v.Patient)
                .Include(v => v.Practitioner)
                .Include(v => v.Area)
                .Include(v => v.Service)
                .Include(v => v.PatientPackage).ThenInclude(pp => pp!.Package);

        public Task<Visit?> GetByIdAsync(Guid id) => WithIncludes().FirstOrDefaultAsync(v => v.Id == id);

        public async Task<IEnumerable<Visit>> GetByDateAsync(DateTime date) =>
            await WithIncludes().Where(v => v.ScheduledDate.HasValue && v.ScheduledDate.Value.Date == date.Date).ToListAsync();

        public async Task<IEnumerable<Visit>> GetTodayAsync(Guid? practitionerId = null)
        {
            var query = WithIncludes().Where(v => v.ScheduledDate.HasValue && v.ScheduledDate.Value.Date == DateTime.UtcNow.Date);
            if (practitionerId.HasValue) query = query.Where(v => v.PractitionerId == practitionerId);
            return await query.ToListAsync();
        }

        public async Task<IEnumerable<Visit>> GetByPractitionerAsync(Guid practitionerId) =>
            await WithIncludes().Where(v => v.PractitionerId == practitionerId).ToListAsync();

        public async Task<IEnumerable<Visit>> GetByPatientPackageIdAsync(Guid patientPackageId) =>
            await WithIncludes().Where(v => v.PatientPackageId == patientPackageId).ToListAsync();

        public async Task<IEnumerable<Visit>> GetInRangeAsync(DateTime from, DateTime to) =>
            await WithIncludes().Where(v => v.ScheduledDate.HasValue && v.ScheduledDate >= from && v.ScheduledDate <= to).ToListAsync();

        public async Task<IEnumerable<Visit>> GetUnsettledCompletedAsync(Guid practitionerId, DateTime from, DateTime to) =>
            await WithIncludes().Where(v =>
                v.PractitionerId == practitionerId &&
                v.Status == VisitStatus.Completed &&
                v.SettlementId == null &&
                v.ScheduledDate >= from && v.ScheduledDate <= to)
                .ToListAsync();

        public async Task<IEnumerable<Visit>> GetAllAsync() => await WithIncludes().ToListAsync();

        public async Task AddAsync(Visit visit)
        {
            await _context.Visits.AddAsync(visit);
            await _context.SaveChangesAsync();
        }

        public async Task AddRangeAsync(IEnumerable<Visit> visits)
        {
            await _context.Visits.AddRangeAsync(visits);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Visit visit)
        {
            _context.Visits.Update(visit);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Visit>> GetByPractitionerAndDateAsync(Guid practitionerId, DateTime date) =>
            await _context.Visits
                .Where(v => v.PractitionerId == practitionerId
                    && v.ScheduledDate.HasValue && v.ScheduledDate.Value.Date == date.Date)
                .ToListAsync();

        public async Task<IEnumerable<Visit>> GetByPatientAndDateAsync(Guid patientId, DateTime date) =>
            await _context.Visits
                .Where(v => v.PatientId == patientId
                    && v.ScheduledDate.HasValue && v.ScheduledDate.Value.Date == date.Date)
                .ToListAsync();
    }

}