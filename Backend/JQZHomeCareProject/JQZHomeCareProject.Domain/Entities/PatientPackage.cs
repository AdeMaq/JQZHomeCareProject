using System.ComponentModel.DataAnnotations.Schema;
using JQZHomeCareProject.Domain.Common;
using JQZHomeCareProject.Domain.Enums;

namespace JQZHomeCareProject.Domain.Entities
{
    public class PatientPackage : BaseEntity
    {
        public Guid PatientId { get; set; }
        public Patient? Patient { get; set; }
        public Guid PackageId { get; set; }
        public Package? Package { get; set; }
        public PackagePaymentType PaymentType { get; set; }

        public decimal DefaultAmount { get; set; } 
        public decimal Amount { get; set; }        

        public CollectionStatus CollectionStatus { get; set; } = CollectionStatus.Pending;
        public PatientPackageStatus Status { get; set; }
        public DateTime PurchaseDate { get; set; }

        public ICollection<Visit> Visits { get; set; } = new List<Visit>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();

        [NotMapped] public decimal AmountPaid => Payments.Sum(p => p.AmountPaid);
        [NotMapped] public decimal AmountPending => Amount - AmountPaid;
    }
}