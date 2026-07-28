using JQZHomeCareProject.Domain.Common;
using JQZHomeCareProject.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Domain.Entities
{
    public class PatientPackage : BaseEntity
    {
        public Guid PatientId { get; set; }
        public Patient? Patient { get; set; }

        public Guid PackageId { get; set; }
        public Package? Package { get; set; }

        public PackagePaymentType PaymentType { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal AmountPaid { get; set; }
        public decimal AmountPending { get; set; }
        public PatientPackageStatus Status { get; set; }
        public DateTime PurchaseDate { get; set; }

        public ICollection<Visit> Visits { get; set; } = new List<Visit>();
    }
}
