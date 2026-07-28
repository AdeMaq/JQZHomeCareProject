using JQZHomeCareProject.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.Services
{
    public interface IPatientPackageService
    {
        Task<PatientPackageDto> PurchaseAsync(PurchasePackageDto dto, Guid createdByUserId);
        Task<PatientPackageDto> GetByIdAsync(Guid id);
        Task<IEnumerable<PatientPackageDto>> GetByPatientAsync(Guid patientId);
        Task RecordInstallmentAsync(Guid patientPackageId, RecordInstallmentDto dto);
        Task<IEnumerable<VisitDto>> GetVisitsAsync(Guid patientPackageId);
    }
}
