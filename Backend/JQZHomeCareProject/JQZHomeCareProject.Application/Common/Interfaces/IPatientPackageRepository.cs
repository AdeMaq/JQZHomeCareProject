using JQZHomeCareProject.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.Common.Interfaces
{
    public interface IPatientPackageRepository
    {

        Task<PatientPackage?> GetByIdAsync(Guid id);
        Task<IEnumerable<PatientPackage>> GetByPatientIdAsync(Guid patientId);

        Task AddAsync(PatientPackage patientPackage);

        Task UpdateAsync(PatientPackage patientPackage);
    }
}
