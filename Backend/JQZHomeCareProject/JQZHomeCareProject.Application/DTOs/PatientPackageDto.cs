using JQZHomeCareProject.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.DTOs
{
    public class PurchasePackageDto
    {
        public string PatientName { get; set; } = string.Empty;
        public string PatientPhone { get; set; } = string.Empty;
        public string LocationAddress { get; set; } = string.Empty;
        public Guid PackageId { get; set; }
        public PackagePaymentType PaymentType { get; set; }
        public decimal? InitialAmountPaid { get; set; }
    }

    public class PatientPackageDto
    {
        public Guid Id { get; set; }
        public PatientDto Patient { get; set; } = new();
        public PackageDto Package { get; set; } = new();
        public PackagePaymentType PaymentType { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal AmountPaid { get; set; }
        public decimal AmountPending { get; set; }
        public PatientPackageStatus Status { get; set; }
        public DateTime PurchaseDate { get; set; }
        public List<VisitDto> Visits { get; set; } = new();
    }

    public class RecordInstallmentDto
    {
        public decimal Amount { get; set; }
    }

}
