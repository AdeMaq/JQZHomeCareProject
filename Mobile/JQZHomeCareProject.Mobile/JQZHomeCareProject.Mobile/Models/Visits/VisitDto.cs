using JQZHomeCareProject.Mobile.Models.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Mobile.Models.Visits
{
    public class VisitDto
    {
        public string Id { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public string PractitionerId { get; set; } = string.Empty;
        public string PractitionerName { get; set; } = string.Empty;
        public string AreaId { get; set; } = string.Empty;
        public string AreaName { get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
        public string? PackageName { get; set; }
        /// <summary>
        /// Null means Admin hasn't scheduled this visit yet — per the business
        /// rule in Section 11, an unscheduled visit should never surface on
        /// the practitioner's Today/Visits list in the first place, but keep
        /// this nullable to match the API contract.
        /// </summary>
        public DateTime? ScheduledDate { get; set; }
        public string TimeSlot { get; set; } = string.Empty;
        public VisitStatus Status { get; set; }
        public decimal AmountDue { get; set; }
        public decimal? AmountReceived { get; set; }
        public ReceivedBy? ReceivedBy { get; set; }
        public CollectionStatus? CollectionStatus { get; set; }
        public string? SettlementId { get; set; }
    }
}
