using JQZHomeCareProject.Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace JQZHomeCareProject.Application.DTOs
{
    public class PractitionerSettlementDto
    {
        public Guid Id { get; set; }
        public Guid PractitionerId { get; set; }
        public string PractitionerName { get; set; } = string.Empty;
        public DateTime WeekStart { get; set; }
        public DateTime WeekEnd { get; set; }
        public decimal TotalVisitAmount { get; set; }
        public decimal PractitionerShareAmount { get; set; }
        public decimal CompanyShareAmount { get; set; }
        public CollectionStatus Status { get; set; }
        public DateTime? ReceivedDate { get; set; }
    }

    public class WeeklySettlementDto
    {
        public Guid? SettlementId { get; set; }
        public Guid PractitionerId { get; set; }
        public string PractitionerName { get; set; } = string.Empty;
        public DateTime WeekStart { get; set; }
        public DateTime WeekEnd { get; set; }
        public int VisitCount { get; set; }
        public decimal TotalVisitAmount { get; set; }
        public decimal PractitionerShareAmount { get; set; }
        public decimal CompanyShareAmount { get; set; }
        public CollectionStatus Status { get; set; }
        public DateTime? ReceivedDate { get; set; }
        public List<VisitDto> Visits { get; set; } = new();
    }

    public class CollectPaymentDto
    {
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0.")]
        public decimal Amount { get; set; }
    }

    public class MarkPaymentReceivedDto
    {
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0.")]
        public decimal Amount { get; set; }
    }
}
