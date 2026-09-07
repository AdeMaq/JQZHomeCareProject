using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JQZHomeCareProject.Persistence.Repositories
{
    public class InstallmentPaymentRepository : IInstallmentPaymentRepository
    {
        private readonly AppDbContext _context;
        public InstallmentPaymentRepository(AppDbContext context) => _context = context;

        public async Task<IEnumerable<InstallmentPayment>> GetByPatientPackageIdAsync(Guid patientPackageId) =>
            await _context.InstallmentPayments
                .Where(ip => ip.PatientPackageId == patientPackageId)
                .OrderBy(ip => ip.Date)
                .ToListAsync();

        public async Task<IEnumerable<InstallmentPayment>> GetByVisitIdsAsync(IEnumerable<Guid> visitIds) =>
            await _context.InstallmentPayments
                .Where(ip => ip.VisitId != null && visitIds.Contains(ip.VisitId.Value))
                .ToListAsync();

        public async Task<decimal> GetTotalInRangeAsync(DateTime from, DateTime to) =>
            await _context.InstallmentPayments
                .Where(ip => ip.Date >= from && ip.Date <= to)
                .SumAsync(ip => (decimal?)ip.Amount) ?? 0m;

        public async Task AddAsync(InstallmentPayment payment)
        {
            await _context.InstallmentPayments.AddAsync(payment);
            await _context.SaveChangesAsync();
        }
    }
}