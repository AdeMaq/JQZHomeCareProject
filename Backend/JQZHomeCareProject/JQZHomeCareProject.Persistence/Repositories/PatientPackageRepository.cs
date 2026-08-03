using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace JQZHomeCareProject.Persistence.Repositories
{
    public class PatientPackageRepository : IPatientPackageRepository
    {
        private readonly AppDbContext _context;
        public PatientPackageRepository(AppDbContext context) => _context = context;

        public Task<PatientPackage?> GetByIdAsync(Guid id) =>
            _context.PatientPackages
                .Include(pp => pp.Patient)
                .Include(pp => pp.Package)
                .Include(pp => pp.Visits).ThenInclude(v => v.Practitioner)
                .Include(pp => pp.Visits).ThenInclude(v => v.Area)
                .Include(pp => pp.Visits).ThenInclude(v => v.Service)
                .FirstOrDefaultAsync(pp => pp.Id == id);

        public async Task<IEnumerable<PatientPackage>> GetAllAsync() =>
            await _context.PatientPackages
                .Include(pp => pp.Patient).Include(pp => pp.Package).Include(pp => pp.Visits)
                .ToListAsync();

        public async Task<IEnumerable<PatientPackage>> GetByPatientIdAsync(Guid patientId) =>
            await _context.PatientPackages
                .Include(pp => pp.Package).Include(pp => pp.Visits)
                .Where(pp => pp.PatientId == patientId)
                .ToListAsync();

        public async Task AddAsync(PatientPackage patientPackage)
        {
            await _context.PatientPackages.AddAsync(patientPackage);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(PatientPackage patientPackage)
        {
            _context.PatientPackages.Update(patientPackage);
            await _context.SaveChangesAsync();
        }
    }
}