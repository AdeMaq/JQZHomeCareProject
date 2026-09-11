using JQZHomeCareProject.Domain.Entities;

namespace JQZHomeCareProject.Application.Common.Interfaces
{
    public interface IPaymentRepository
    {
        Task<Payment?> GetByIdAsync(Guid id);
        Task<Payment?> GetByVisitIdAsync(Guid visitId);
        Task<IEnumerable<Payment>> GetByPatientPackageIdAsync(Guid patientPackageId);
        Task<IEnumerable<Payment>> GetByPractitionerAndWeekAsync(Guid practitionerId, DateTime weekStart, DateTime weekEnd);
        Task<IEnumerable<Payment>> GetUnsettledByPractitionerAndWeekAsync(Guid practitionerId, DateTime weekStart, DateTime weekEnd);
        Task<IEnumerable<Payment>> GetAllUnsettledFullyPaidAsync();
        Task AddAsync(Payment payment);
        Task AddRangeAsync(IEnumerable<Payment> payments);
        Task UpdateAsync(Payment payment);
        Task UpdateRangeAsync(IEnumerable<Payment> payments);
        Task<IEnumerable<Payment>> GetInRangeAsync(DateTime from, DateTime to); 
        Task<decimal> GetTotalPendingAsync(); 
    }
}