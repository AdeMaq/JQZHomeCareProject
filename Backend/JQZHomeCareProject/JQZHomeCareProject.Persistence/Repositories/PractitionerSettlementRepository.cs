using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Domain.Entities;
using JQZHomeCareProject.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace JQZHomeCareProject.Persistence.Repositories
{
    public class PractitionerSettlementRepository : IPractitionerSettlementRepository
    {
        private readonly AppDbContext _context;

        public PractitionerSettlementRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PractitionerSettlement?> GetByIdAsync(Guid id)
        {
            return await _context.PractitionerSettlements
                .Include(s => s.Practitioner).ThenInclude(p => p!.User)
                .Include(s => s.Visits)
                .Include(s => s.ReceivedByUser)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<IEnumerable<PractitionerSettlement>> GetPendingAsync()
        {
            return await _context.PractitionerSettlements
                .Include(s => s.Practitioner).ThenInclude(p => p!.User)
                .Where(s => s.Status == CollectionStatus.Pending)
                .OrderBy(s => s.WeekStartDate)
                .ToListAsync();
        }

        public async Task<PractitionerSettlement?> GetByPractitionerAndWeekAsync(Guid practitionerId, DateTime weekStart)
        {
            return await _context.PractitionerSettlements
                .Include(s => s.Practitioner).ThenInclude(p => p!.User)
                .Include(s => s.Visits)
                .FirstOrDefaultAsync(s => s.PractitionerId == practitionerId && s.WeekStartDate == weekStart.Date);
        }

        public async Task AddAsync(PractitionerSettlement settlement)
        {
            await _context.PractitionerSettlements.AddAsync(settlement);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(PractitionerSettlement settlement)
        {
            settlement.UpdatedAt = DateTime.UtcNow;
            _context.PractitionerSettlements.Update(settlement);
            await _context.SaveChangesAsync();
        }
    }
}