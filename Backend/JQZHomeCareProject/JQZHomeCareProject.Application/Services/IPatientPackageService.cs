using JQZHomeCareProject.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.Services
{
    public interface IPatientPackageService
    {
        Task<PatientPackageDto> GetByIdAsync(Guid id);
        Task<IEnumerable<PatientPackageDto>> GetAllAsync();
        Task<IEnumerable<PatientPackageDto>> GetByPatientAsync(Guid patientId);
        Task<IEnumerable<VisitDto>> GetVisitsAsync(Guid patientPackageId);
        Task<IEnumerable<PaymentDto>> GetPaymentsAsync(Guid patientPackageId);
        Task RecordOfficePaymentAsync(Guid patientPackageId, RecordOfficePaymentDto dto);
        Task UpdatePatientPackageAmountAsync(Guid patientPackageId, UpdatePatientPackageAmountDto dto);
    }
}
