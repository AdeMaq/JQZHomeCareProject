using JQZHomeCareProject.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace JQZHomeCareProject.Application.DTOs
{
    public class VisitDto
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public Guid? PractitionerId { get; set; }
        public string? PractitionerName { get; set; }
        public Guid? AreaId { get; set; }
        public string? AreaName { get; set; }
        public Guid ServiceId { get; set; }
        public string? ServiceName { get; set; }
        public Guid? PatientPackageId { get; set; }
        public string? PackageName { get; set; }
        public DateTime? ScheduledDate { get; set; }
        //public string? TimeSlot { get; set; }
        public TimeSpan? SlotStart { get; set; }
        public TimeSpan? SlotEnd { get; set; }
        public VisitStatus Status { get; set; }
        public decimal AmountDue { get; set; }
        public decimal AmountReceived { get; set; }
        public ReceivedByType? ReceivedBy { get; set; }
        public CollectionStatus CollectionStatus { get; set; }
        public Guid? SettlementId { get; set; }

    }

    public class CreateVisitDto
    {
        [Required, StringLength(150, MinimumLength = 1)]
        public string PatientName { get; set; } = string.Empty;

        [Required]
        public string PatientPhone { get; set; } = string.Empty;

        [Required, StringLength(500, MinimumLength = 1)]
        public string LocationAddress { get; set; } = string.Empty;

        public Guid PackageId { get; set; }
        public PackagePaymentType PaymentType { get; set; }
        public decimal? InitialAmountPaid { get; set; } 
        public List<VisitAssignmentDto> VisitAssignments { get; set; } = new();
    }

    public class VisitAssignmentDto
    {
        public Guid? PractitionerId { get; set; }
        public Guid? AreaId { get; set; }        
        public DateTime? ScheduledDate { get; set; }
        public TimeSpan? SlotStart { get; set; }
        public TimeSpan? SlotEnd { get; set; }
    }


    public class ScheduleVisitDto
    {
        public DateTime ScheduledDate { get; set; }
        public TimeSpan SlotStart { get; set; }
        public TimeSpan SlotEnd { get; set; }
    }

    public class CancelVisitDto
    {
        public RefusedBy RefusedBy { get; set; }

        [Required, StringLength(500, MinimumLength = 1)]
        public string Reason { get; set; } = string.Empty;
    }

    public class ReassignPractitionerDto
    {
        public Guid PractitionerId { get; set; }
        public Guid? AreaId { get; set; }
        public RefusedBy RefusedBy { get; set; }

        [Required, StringLength(500, MinimumLength = 1)]
        public string Reason { get; set; } = string.Empty;
    }

    public class AssignVisitDto
    {
        public Guid PractitionerId { get; set; }
        public Guid? AreaId { get; set; } 
    }

}