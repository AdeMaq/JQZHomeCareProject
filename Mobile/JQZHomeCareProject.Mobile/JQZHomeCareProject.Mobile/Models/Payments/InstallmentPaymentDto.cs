using JQZHomeCareProject.Mobile.Models.Common;

namespace JQZHomeCareProject.Mobile.Models.Payments
{
    public class InstallmentPaymentDto
    {
        public Guid Id { get; set; }
        public Guid PatientPackageId { get; set; }
        public Guid? VisitId { get; set; }
        public decimal Amount { get; set; }
        public ReceivedByType ReceivedBy { get; set; }
        public DateTime Date { get; set; }
    }
}