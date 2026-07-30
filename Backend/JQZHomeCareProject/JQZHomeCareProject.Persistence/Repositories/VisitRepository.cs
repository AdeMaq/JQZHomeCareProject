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

        private IQueryable<Visit> BaseQuery() =>
            _context.Visits
                .Include(v => v.Patient)
                .Include(v => v.Practitioner!).ThenInclude(p => p!.User)      
                .Include(v => v.Area)
                .Include(v => v.Service)
                .Include(v => v.PatientPackage!).ThenInclude(pp => pp!.Package); 

        public async Task<Visit?> GetByIdAsync(Guid id) =>
            await BaseQuery().FirstOrDefaultAsync(v => v.Id == id);

        public async Task<IEnumerable<Visit>> GetByDateAsync(DateTime date) =>
            await BaseQuery().Where(v => v.ScheduledDate.HasValue && v.ScheduledDate.Value.Date == date.Date).ToListAsync();

        public async Task<IEnumerable<Visit>> GetTodayAsync(Guid? practitionerId = null)
        {
            var query = BaseQuery().Where(v => v.ScheduledDate.HasValue && v.ScheduledDate.Value.Date == DateTime.UtcNow.Date);
            if (practitionerId.HasValue)
                query = query.Where(v => v.PractitionerId == practitionerId.Value);
            return await query.ToListAsync();
        }

        public async Task<IEnumerable<Visit>> GetByPractitionerAsync(Guid practitionerId) =>
            await BaseQuery().Where(v => v.PractitionerId == practitionerId).ToListAsync();

        public async Task<IEnumerable<Visit>> GetByPatientPackageIdAsync(Guid patientPackageId) =>
            await BaseQuery().Where(v => v.PatientPackageId == patientPackageId).ToListAsync();

        public async Task<IEnumerable<Visit>> GetInRangeAsync(DateTime from, DateTime to) =>
            await BaseQuery()
                .Where(v => v.ScheduledDate.HasValue && v.ScheduledDate.Value >= from && v.ScheduledDate.Value <= to)
                .ToListAsync();

        public async Task<IEnumerable<Visit>> GetUnsettledCompletedAsync(Guid practitionerId, DateTime from, DateTime to) =>
            await BaseQuery()
                .Where(v => v.PractitionerId == practitionerId
                    && v.Status == VisitStatus.Completed
                    && v.CollectionStatus == CollectionStatus.Pending
                    && v.SettlementId == null
                    && v.CheckOutTime.HasValue
                    && v.CheckOutTime.Value >= from && v.CheckOutTime.Value <= to)
                .ToListAsync();

        public async Task<IEnumerable<Visit>> GetAllAsync() =>
            await BaseQuery().OrderByDescending(v => v.CreatedAt).ToListAsync();

        public async Task AddAsync(Visit visit)
        {
            visit.CreatedAt = DateTime.UtcNow;
            await _context.Visits.AddAsync(visit);
            await _context.SaveChangesAsync();
        }

        public async Task AddRangeAsync(IEnumerable<Visit> visits)
        {
            foreach (var visit in visits)
                visit.CreatedAt = DateTime.UtcNow;

            await _context.Visits.AddRangeAsync(visits);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Visit visit)
        {
            visit.UpdatedAt = DateTime.UtcNow;
            _context.Visits.Update(visit);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Visit>> GetByPractitionerAndDateAsync(Guid practitionerId, DateTime date) =>
            await BaseQuery()
                .Where(v => v.PractitionerId == practitionerId
                    && v.ScheduledDate.HasValue
                    && v.ScheduledDate.Value.Date == date.Date
                    && v.Status != VisitStatus.Cancelled)
                .ToListAsync();

        public async Task<IEnumerable<Visit>> GetByPatientAndDateAsync(Guid patientId, DateTime date) =>
            await BaseQuery()
                .Where(v => v.PatientId == patientId
                    && v.ScheduledDate.HasValue
                    && v.ScheduledDate.Value.Date == date.Date
                    && v.Status != VisitStatus.Cancelled)
                .ToListAsync();
    }
}