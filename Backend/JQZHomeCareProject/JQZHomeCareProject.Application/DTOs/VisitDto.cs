using JQZHomeCareProject.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace JQZHomeCareProject.Application.DTOs
{
    public class VisitDto
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public Guid PractitionerId { get; set; }
        public string? PractitionerName { get; set; }
        public Guid AreaId { get; set; }
        public string? AreaName { get; set; }
        public Guid ServiceId { get; set; }
        public string? ServiceName { get; set; }
        public Guid? PatientPackageId { get; set; }
        public string? PackageName { get; set; }
        public DateTime? ScheduledDate { get; set; }
        public string? TimeSlot { get; set; }
        public VisitStatus Status { get; set; }
        public decimal AmountDue { get; set; }
        public decimal AmountReceived { get; set; }
        public ReceivedByType? ReceivedBy { get; set; }
        public CollectionStatus CollectionStatus { get; set; }
        public Guid? SettlementId { get; set; }

    }

    public class CreateVisitDto
    {
        public string PatientName { get; set; } = string.Empty;
        public string PatientPhone { get; set; } = string.Empty;
        public string LocationAddress { get; set; } = string.Empty;
        public Guid PractitionerId { get; set; }
        public Guid AreaId { get; set; }
        public Guid ServiceId { get; set; }
        public decimal AmountDue { get; set; }
    }

    public class ScheduleVisitDto
    {
        public DateTime ScheduledDate { get; set; }
        public string TimeSlot { get; set; } = string.Empty;
    }

    public class CancelVisitDto
    {
        public RefusedBy RefusedBy { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    public class ReassignPractitionerDto
    {
        public Guid NewPractitionerId { get; set; }

        public Guid? AreaId { get; set; }

        public RefusedBy RefusedBy { get; set; }

        public string Reason { get; set; } = string.Empty;
    }
}