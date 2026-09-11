using JQZHomeCareProject.Domain.Enums;

namespace JQZHomeCareProject.Application.DTOs
{
    public class PaymentDto
    {
        public Guid Id { get; set; }
        public Guid PatientPackageId { get; set; }
        public Guid PatientId { get; set; }
        public Guid? PractitionerId { get; set; }
        public string? PractitionerName { get; set; }
        public Guid VisitId { get; set; }
        public decimal DefaultAmount { get; set; }
        public decimal Amount { get; set; }
        public decimal AmountPaid { get; set; }
        public decimal DefaultPShareAmount { get; set; }
        public decimal PShareAmount { get; set; }
        public PaymentStatus Status { get; set; }
        public DateTime DateTime { get; set; }
        public bool IsSettled { get; set; }
    }

    public class RecordOfficePaymentDto   
    {
        public decimal Amount { get; set; }
    }

    public class UpdatePaymentShareDto  
    {
        public decimal PShareAmount { get; set; }
    }

    public class UpdatePatientPackageAmountDto 
    {
        public decimal Amount { get; set; }
    }

    public class WeeklySettlementSummaryDto
    {
        public Guid PractitionerId { get; set; }
        public string PractitionerName { get; set; } = string.Empty;
        public DateTime WeekStart { get; set; }
        public DateTime WeekEnd { get; set; }
        public int VisitCount { get; set; }
        public decimal Receivable { get; set; }        // sum(Amount)
        public decimal Received { get; set; }          // sum(AmountPaid)
        public decimal PractitionerShare { get; set; } // sum(PShareAmount), fully-paid visits only
        public decimal CompanyShare { get; set; }
        public bool IsFullySettled { get; set; }
        public List<PaymentDto> Payments { get; set; } = new();
    }
}