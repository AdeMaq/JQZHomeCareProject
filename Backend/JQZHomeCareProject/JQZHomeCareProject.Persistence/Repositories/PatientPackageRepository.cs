using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JQZHomeCareProject.Persistence.Repositories
{
    public class PatientPackageRepository : IPatientPackageRepository
    {
        private readonly AppDbContext _context;

        public PatientPackageRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PatientPackage?> GetByIdAsync(Guid id)
        {
            return await _context.PatientPackages
                .Include(pp => pp.Patient)
                .Include(pp => pp.Package)
                .Include(pp => pp.Visits)
                .FirstOrDefaultAsync(pp => pp.Id == id);
        }

        public async Task<IEnumerable<PatientPackage>> GetByPatientIdAsync(Guid patientId)
        {
            return await _context.PatientPackages
                .Include(pp => pp.Patient)
                .Include(pp => pp.Package)
                .Include(pp => pp.Visits)
                .Where(pp => pp.PatientId == patientId)
                .ToListAsync();
        }

        public async Task AddAsync(PatientPackage patientPackage)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _context.PatientPackages.AddAsync(patientPackage);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task UpdateAsync(PatientPackage patientPackage)
        {
            _context.PatientPackages.Update(patientPackage);
            await _context.SaveChangesAsync();
        }
    }
}