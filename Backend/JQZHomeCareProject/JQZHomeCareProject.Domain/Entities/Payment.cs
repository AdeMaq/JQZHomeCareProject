// Domain/Entities/Payment.cs
using JQZHomeCareProject.Domain.Common;
using JQZHomeCareProject.Domain.Enums;

namespace JQZHomeCareProject.Domain.Entities
{
    public class Payment : BaseEntity
    {
        public Guid PatientPackageId { get; set; }
        public PatientPackage? PatientPackage { get; set; }

        public Guid PatientId { get; set; }
        public Patient? Patient { get; set; }

        public Guid? PractitionerId { get; set; }
        public Practitioner? Practitioner { get; set; }

        public Guid VisitId { get; set; } // one Payment per Visit
        public Visit? Visit { get; set; }

        public decimal DefaultAmount { get; set; }      // this visit's equal share of PatientPackage.DefaultAmount
        public decimal Amount { get; set; }              // this visit's equal share of PatientPackage.Amount (final, owed)
        public decimal AmountPaid { get; set; }           // running total collected against Amount

        public decimal DefaultPShareAmount { get; set; } // DefaultAmount x practitioner's normal SharePercentage
        public decimal PShareAmount { get; set; }         // admin-editable, final practitioner share

        public PaymentStatus Status { get; set; } = PaymentStatus.NotPaid;
        public DateTime DateTime { get; set; }

        // Weekly settlement lock — replaces PractitionerSettlement as a table.
        public bool IsSettled { get; set; }
        public DateTime? SettledDate { get; set; }
        public Guid? SettledByUserId { get; set; }
        public User? SettledByUser { get; set; }
    }
}