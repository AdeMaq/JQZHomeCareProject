using JQZHomeCareProject.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.Common.Interfaces
{
    public interface IInstallmentPaymentRepository
    {
        Task<IEnumerable<InstallmentPayment>> GetByPatientPackageIdAsync(Guid patientPackageId);
        Task<IEnumerable<InstallmentPayment>> GetByVisitIdsAsync(IEnumerable<Guid> visitIds);
        Task<decimal> GetTotalInRangeAsync(DateTime from, DateTime to);
        Task AddAsync(InstallmentPayment payment);
    }
}
