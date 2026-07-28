using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Common;
using JQZHomeCareProject.Domain.Enums;

namespace JQZHomeCareProject.Domain.Entities
{
    public class Visit : BaseEntity
    {
        public Guid PatientId { get; set; }
        public Patient? Patient { get; set; }

        public Guid PractitionerId { get; set; }
        public Practitioner? Practitioner { get; set; }

        public Guid AreaId { get; set; }
        public Area? Area { get; set; }

        public Guid ServiceId { get; set; }
        public Service? Service { get; set; }

        public Guid? PatientPackageId { get; set; } 
        public PatientPackage? PatientPackage { get; set; }

        public DateTime? ScheduledDate { get; set; }
        public string? TimeSlot { get; set; }
        public VisitStatus Status { get; set; }

        public DateTime? CheckInTime { get; set; }
        public string? CheckInLocation { get; set; }
        public DateTime? CheckOutTime { get; set; }
        public string? CheckOutLocation { get; set; }

        public decimal AmountDue { get; set; }
        public decimal AmountReceived { get; set; }
        public ReceivedByType? ReceivedBy { get; set; }
        public CollectionStatus CollectionStatus { get; set; } = CollectionStatus.Pending;

        public Guid? SettlementId { get; set; } 
        public PractitionerSettlement? Settlement { get; set; }

        public Guid CreatedByUserId { get; set; }
        public User? CreatedByUser { get; set; }

        public ICollection<Refusal> Refusals { get; set; } = new List<Refusal>();
    }
}
