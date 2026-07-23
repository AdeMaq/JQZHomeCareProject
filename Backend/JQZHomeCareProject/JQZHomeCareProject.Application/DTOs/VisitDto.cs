using JQZHomeCareProject.Domain.Enums;

namespace JQZHomeCareProject.Application.DTOs
{
    public class VisitDto
    {
        public Guid Id { get; set; }

        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;

        public Guid PractitionerId { get; set; }
        public string PractitionerName { get; set; } = string.Empty;

        public Guid AreaId { get; set; }
        public string AreaName { get; set; } = string.Empty;

        public Guid ServiceId { get; set; }
        public string ServiceName { get; set; } = string.Empty;

        public Guid? PackageId { get; set; }
        public string? PackageName { get; set; }

        public DateTime ScheduledDate { get; set; }
        public string TimeSlot { get; set; } = string.Empty;
        public VisitStatus Status { get; set; }
        public decimal AmountDue { get; set; }
        public decimal AmountReceived { get; set; }
        public ReceivedByType? ReceivedBy { get; set; }
    }
}