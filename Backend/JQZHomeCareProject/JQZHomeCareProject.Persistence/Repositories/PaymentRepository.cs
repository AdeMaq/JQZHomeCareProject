using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JQZHomeCareProject.Persistence.Repositories
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly AppDbContext _context;
        public PaymentRepository(AppDbContext context) => _context = context;

        private IQueryable<Payment> WithIncludes() =>
            _context.Payments
                .Include(p => p.Visit)
                .Include(p => p.Practitioner).ThenInclude(pr => pr!.User);

        public Task<Payment?> GetByIdAsync(Guid id) => WithIncludes().FirstOrDefaultAsync(p => p.Id == id);

        public Task<Payment?> GetByVisitIdAsync(Guid visitId) => WithIncludes().FirstOrDefaultAsync(p => p.VisitId == visitId);

        public async Task<IEnumerable<Payment>> GetByPatientPackageIdAsync(Guid patientPackageId) =>
            await WithIncludes().Where(p => p.PatientPackageId == patientPackageId).ToListAsync();

        public async Task<IEnumerable<Payment>> GetByPractitionerAndWeekAsync(Guid practitionerId, DateTime weekStart, DateTime weekEnd) =>
            await WithIncludes()
                .Where(p => p.PractitionerId == practitionerId
                    && p.Visit!.ScheduledDate.HasValue
                    && p.Visit.ScheduledDate.Value.Date >= weekStart.Date
                    && p.Visit.ScheduledDate.Value.Date <= weekEnd.Date)
                .ToListAsync();

        public async Task<IEnumerable<Payment>> GetUnsettledByPractitionerAndWeekAsync(Guid practitionerId, DateTime weekStart, DateTime weekEnd) =>
            await WithIncludes()
                .Where(p => p.PractitionerId == practitionerId && !p.IsSettled
                    && p.Visit!.ScheduledDate.HasValue
                    && p.Visit.ScheduledDate.Value.Date >= weekStart.Date
                    && p.Visit.ScheduledDate.Value.Date <= weekEnd.Date)
                .ToListAsync();

        public async Task<IEnumerable<Payment>> GetAllUnsettledFullyPaidAsync() =>
            await WithIncludes()
                .Where(p => !p.IsSettled && p.AmountPaid >= p.Amount && p.PractitionerId != null)
                .ToListAsync();

        public async Task AddAsync(Payment payment) { await _context.Payments.AddAsync(payment); await _context.SaveChangesAsync(); }
        public async Task AddRangeAsync(IEnumerable<Payment> payments) { await _context.Payments.AddRangeAsync(payments); await _context.SaveChangesAsync(); }
        public async Task UpdateAsync(Payment payment) { _context.Payments.Update(payment); await _context.SaveChangesAsync(); }
        public async Task UpdateRangeAsync(IEnumerable<Payment> payments) { _context.Payments.UpdateRange(payments); await _context.SaveChangesAsync(); }
        public async Task<IEnumerable<Payment>> GetInRangeAsync(DateTime from, DateTime to) =>
            await WithIncludes()
                .Where(p => p.DateTime >= from && p.DateTime <= to)
                .ToListAsync();

        public async Task<decimal> GetTotalPendingAsync() =>
            await _context.Payments
                .Where(p => p.PatientPackage!.Status == Domain.Enums.PatientPackageStatus.Active)
                .SumAsync(p => (decimal?)(p.Amount - p.AmountPaid)) ?? 0m;
    }
}