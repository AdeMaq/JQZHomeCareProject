using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Entities;

namespace JQZHomeCareProject.Application.Common.Interfaces
{
    public interface IPatientRepository
    {
        Task<Patient?> GetByIdAsync(Guid id);
        Task<Patient?> GetByPhoneAsync(string phone);
        Task<IEnumerable<Patient>> GetAllAsync();
        Task AddAsync(Patient patient);
        Task UpdateAsync(Patient patient);
        Task IncrementVisitCountAsync(Guid patientId, int count);
    }
}
