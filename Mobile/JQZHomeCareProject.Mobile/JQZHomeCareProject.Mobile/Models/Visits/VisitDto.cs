using JQZHomeCareProject.Mobile.Models.Common;

namespace JQZHomeCareProject.Mobile.Models.Visits
{
    public class VisitDto
    {
        public Guid Id { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string PatientAddress { get; set; } = string.Empty;
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

        // ---------------- Display-only computed properties ----------------

        private static string FormatTime(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return "—";
            return TimeSpan.TryParse(raw, out var time)
                ? DateTime.Today.Add(time).ToString("h:mm tt")
                : raw;
        }

        // 12-hour clock, e.g. "9:00 AM" — used on visit cards.
        public string TimeSlot => FormatTime(SlotStart);

        // e.g. "9:00 AM – 10:00 AM" — used on Visit Detail.
        public string SlotRangeLabel => $"{FormatTime(SlotStart)} \u2013 {FormatTime(SlotEnd)}";

        public DateTime? ScheduledDateTime
        {
            get
            {
                if (!ScheduledDate.HasValue) return null;
                return TimeSpan.TryParse(SlotStart, out var time)
                    ? ScheduledDate.Value.Date.Add(time)
                    : ScheduledDate.Value.Date;
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

        // e.g. "Today, 22 May 2025" — used on Visit Detail.
        public string FullDateLabel
        {
            get
            {
                if (!ScheduledDate.HasValue) return string.Empty;
                var date = ScheduledDate.Value.Date;
                var today = DateTime.Today;
                var prefix = date == today ? "Today, " : date == today.AddDays(-1) ? "Yesterday, " : "";
                return $"{prefix}{date:d MMMM yyyy}";
            }
        }

        public string ScheduledDateTimeLabel => $"{ScheduledDateLabel} | {TimeSlot}";

        public string ExpectedAmountDisplay => $"PKR {AmountDue:N0} (Expected)";

        public string AmountDueDisplay => $"PKR {AmountDue:N0}";

        public decimal RemainingAmount => Math.Max(0, AmountDue - AmountReceived);

        public bool IsFullyPaid => RemainingAmount <= 0 && AmountReceived > 0;

        public string RemainingAmountDisplay => RemainingAmount > 0
            ? $"PKR {RemainingAmount:N0} remaining"
            : "Fully paid";

        public string ReceivedByLabel => ReceivedBy switch
        {
            ReceivedByType.Practitioner => "Received by Practitioner",
            ReceivedByType.Company => "Received by Company",
            _ => "—"
        };

        public string PaymentSummary => $"PKR {AmountReceived:N0} \u2022 {ReceivedByLabel}";
    }
}