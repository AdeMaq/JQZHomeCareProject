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
        Task AddAsync(Patient patient);
        Task UpdateAsync(Patient patient);
    }
}
