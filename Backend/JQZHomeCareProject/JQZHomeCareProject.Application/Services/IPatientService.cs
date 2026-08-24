using JQZHomeCareProject.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.Services
{
    public interface IPatientService
    {
        Task<PatientDto> GetOrCreateAsync(string name, string phone, string locationAddress, string? patientDescription = null);
        Task<PatientDto?> GetByPhoneAsync(string phone);
        Task<IEnumerable<PatientDto>> GetAllAsync();
        Task<PatientDto?> GetByIdAsync(Guid id);
        Task<PatientDto> UpdateAsync(Guid id, UpdatePatientDto dto);
    }
}
