using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JQZHomeCareProject.Persistence.Repositories
{
    public class PatientRepository : IPatientRepository
    {
        private readonly AppDbContext _context;

        public PatientRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Patient?> GetByIdAsync(Guid id) =>
            await _context.Patients
                .Include(p => p.Location)
                .FirstOrDefaultAsync(p => p.Id == id);

        public async Task<Patient?> GetByPhoneAsync(string phone) =>
            await _context.Patients
                .Include(p => p.Location)
                .FirstOrDefaultAsync(p => p.Phone == phone);

        public async Task<IEnumerable<Patient>> GetAllAsync() =>
            await _context.Patients
                .Include(p => p.Location)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

        public async Task AddAsync(Patient patient)
        {
            patient.CreatedAt = DateTime.UtcNow;
            await _context.Patients.AddAsync(patient);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Patient patient)
        {
            _context.Patients.Update(patient);
            await _context.SaveChangesAsync();
        }

        public async Task IncrementVisitCountAsync(Guid patientId, int count)
        {
            var patient = await _context.Patients.FindAsync(patientId);
            if (patient is null) return;

            patient.VisitCount += count;
            patient.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}