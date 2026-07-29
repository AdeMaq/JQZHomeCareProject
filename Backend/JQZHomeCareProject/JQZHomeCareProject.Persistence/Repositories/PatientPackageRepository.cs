using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace JQZHomeCareProject.Persistence.Repositories
{
    public class PatientPackageRepository : IPatientPackageRepository
    {
        private readonly AppDbContext _context;

        public PatientPackageRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PatientPackage?> GetByIdAsync(Guid id) =>
            await _context.PatientPackages
                .Include(pp => pp.Patient!).ThenInclude(p => p.Location)
                .Include(pp => pp.Package)
                .Include(pp => pp.Visits)
                .FirstOrDefaultAsync(pp => pp.Id == id);

        public async Task<IEnumerable<PatientPackage>> GetByPatientIdAsync(Guid patientId) =>
            await _context.PatientPackages
                .Include(pp => pp.Package)
                .Where(pp => pp.PatientId == patientId)
                .OrderByDescending(pp => pp.PurchaseDate)
                .ToListAsync();

        public async Task AddAsync(PatientPackage patientPackage)
        {
            patientPackage.CreatedAt = DateTime.UtcNow;

            IExecutionStrategy strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _context.Database.BeginTransactionAsync();

                await _context.PatientPackages.AddAsync(patientPackage);
                await _context.SaveChangesAsync();

                foreach (var visit in patientPackage.Visits)
                {
                    visit.PatientPackageId = patientPackage.Id;
                    visit.CreatedAt = DateTime.UtcNow;
                }
                await _context.Visits.AddRangeAsync(patientPackage.Visits);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            });
        }

        public async Task UpdateAsync(PatientPackage patientPackage)
        {
            _context.PatientPackages.Update(patientPackage);
            await _context.SaveChangesAsync();
        }
    }
}