using JQZHomeCareProject.Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
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
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public Guid PackageId { get; set; }
        public string PackageName { get; set; } = string.Empty;
        public PackagePaymentType PaymentType { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal AmountPaid { get; set; }
        public decimal AmountPending { get; set; }
        public CollectionStatus CollectionStatus { get; set; }
        public ReceivedByType? ReceivedBy { get; set; }
        public PatientPackageStatus Status { get; set; }
        public DateTime PurchaseDate { get; set; }
        public List<VisitDto> Visits { get; set; } = new();
    }



    public class RecordInstallmentDto
    {
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0.")]
        public decimal Amount { get; set; }
    }

}
