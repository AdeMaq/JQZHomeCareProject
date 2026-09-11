// Domain/Entities/Visit.cs — only the diff from what you had
using JQZHomeCareProject.Domain.Common;
using JQZHomeCareProject.Domain.Entities;
using JQZHomeCareProject.Domain.Enums;

public class Visit : BaseEntity
{
    public Guid PatientId { get; set; }
    public Patient? Patient { get; set; }
    public Guid? PractitionerId { get; set; }
    public Practitioner? Practitioner { get; set; }
    public Guid? AreaId { get; set; }
    public Area? Area { get; set; }
    public Guid ServiceId { get; set; }
    public Service? Service { get; set; }
    public Guid? PatientPackageId { get; set; }
    public PatientPackage? PatientPackage { get; set; }

    public string? PatientNameSnapshot { get; set; }
    public string? PatientAddressSnapshot { get; set; }
    public string? PatientDescriptionSnapshot { get; set; }

    public DateTime? ScheduledDate { get; set; }
    public TimeSpan? SlotStart { get; set; }
    public TimeSpan? SlotEnd { get; set; }
    public VisitStatus Status { get; set; }
    public DateTime? CheckInTime { get; set; }
    public string? CheckInLocation { get; set; }
    public DateTime? CheckOutTime { get; set; }
    public string? CheckOutLocation { get; set; }

    public Payment? Payment { get; set; }

    public Guid CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }
    public ICollection<Refusal> Refusals { get; set; } = new List<Refusal>();
}