using JQZHomeCareProject.Domain.Common;
using JQZHomeCareProject.Domain.Enums;

namespace JQZHomeCareProject.Domain.Entities
{
    public class InstallmentPayment : BaseEntity
    {
        public Guid PatientPackageId { get; set; }
        public PatientPackage? PatientPackage { get; set; }

        // Set when collected by a practitioner during a visit's checkout; null when the office collected it directly.
        public Guid? VisitId { get; set; }
        public Visit? Visit { get; set; }
        public decimal Amount { get; set; }   // can be 0 — a checkout can log "nothing collected"
        public ReceivedByType ReceivedBy { get; set; }
        public DateTime Date { get; set; }
    }
}