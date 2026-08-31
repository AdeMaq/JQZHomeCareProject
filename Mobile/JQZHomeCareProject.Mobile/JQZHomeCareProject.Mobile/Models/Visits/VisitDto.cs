using JQZHomeCareProject.Mobile.Models.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Mobile.Models.Visits
{
    public class VisitDto
    {
        public Guid Id { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string PatientAddress {  get; set; }= string.Empty;

        public string PatientPhone { get; set; } = string.Empty;

        public string PatientDescription { get; set; } = string.Empty;

        public Guid? PractitionerId { get; set; }
        public string? PractitionerName { get; set; }

        public Guid? AreaId { get; set; }
        public string? AreaName { get; set; }

        public string ServiceName { get; set; } = string.Empty;
        public string? PackageName { get; set; }

        public DateTime? ScheduledDate { get; set; }

        public string? SlotStart { get; set; }
        public string? SlotEnd { get; set; }

        // Bind directly to this in VisitCard.
        // Bind directly to this in VisitCard.
        public string TimeSlot
        {
            get
            {
                if (string.IsNullOrWhiteSpace(SlotStart))
                    return "—";

                return TimeSpan.TryParse(SlotStart, out var time)
                    ? time.ToString(@"hh\:mm")
                    : SlotStart;
            }
        }

        public VisitStatus Status { get; set; }

        // Fixed by the backend at checkout time — never editable client-side.
        public decimal AmountDue { get; set; }
        public decimal AmountReceived { get; set; }

        public ReceivedByType? ReceivedBy { get; set; }
        public CollectionStatus CollectionStatus { get; set; }
        public Guid? SettlementId { get; set; }

        // Populated only for Status == Cancelled. Confirm this field name
        // matches whatever your backend actually serializes for the reason.
        public string? CancellationReason { get; set; }

        // ---- Display-only computed properties, used across Visits pages ----
        public string ExpectedAmountDisplay => $"PKR {AmountDue:N0} (Expected)";

        public string PaymentSummary
        {
            get
            {
                var receivedByLabel = ReceivedBy switch
                {
                    ReceivedByType.Practitioner => "HomeCare Provider",
                    ReceivedByType.Company => "Company",
                    _ => "—"
                };
                return $"PKR {AmountReceived:N0} \u2022 Received by {receivedByLabel}";
            }

        }

        public string ScheduledDateLabel
        {
            get
            {
                if (!ScheduledDate.HasValue) return string.Empty;

                var date = ScheduledDate.Value.Date;
                var today = DateTime.Today;

                if (date == today) return "Today";
                if (date == today.AddDays(-1)) return "Yesterday";
                return date.ToString("d MMM yyyy");
            }
        }

        public string ScheduledDateTimeLabel => $"{ScheduledDateLabel} | {TimeSlot}";
    }
}
