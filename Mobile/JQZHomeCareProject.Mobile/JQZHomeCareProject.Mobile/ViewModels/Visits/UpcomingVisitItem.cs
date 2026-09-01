using CommunityToolkit.Mvvm.ComponentModel;
using JQZHomeCareProject.Mobile.Models.Common;
using JQZHomeCareProject.Mobile.Models.Visits;

namespace JQZHomeCareProject.Mobile.ViewModels.Visits
{
    // Wraps an upcoming VisitDto with a live "X min/hrs/days late" label,
    // refreshed periodically by VisitsViewModel's timer.
    public partial class UpcomingVisitItem : ObservableObject
    {
        public VisitDto Visit { get; }

        public Guid Id => Visit.Id;
        public string PatientName => Visit.PatientName;
        public string PatientAddress => Visit.PatientAddress;
        public string TimeSlot => Visit.TimeSlot;
        public string ExpectedAmountDisplay => Visit.ExpectedAmountDisplay;

        [ObservableProperty]
        private bool isOverdue;

        [ObservableProperty]
        private string overdueLabel = string.Empty;

        public UpcomingVisitItem(VisitDto visit)
        {
            Visit = visit;
            Refresh();
        }

        public void Refresh()
        {
            var scheduled = Visit.ScheduledDateTime;

            if (scheduled is null || Visit.Status != VisitStatus.Scheduled)
            {
                IsOverdue = false;
                OverdueLabel = string.Empty;
                return;
            }

            var elapsed = DateTime.Now - scheduled.Value;

            if (elapsed.TotalSeconds <= 0)
            {
                IsOverdue = false;
                OverdueLabel = string.Empty;
                return;
            }

            IsOverdue = true;
            OverdueLabel = FormatElapsed(elapsed);
        }

        private static string FormatElapsed(TimeSpan elapsed)
        {
            if (elapsed.TotalDays >= 1)
            {
                var days = (int)elapsed.TotalDays;
                return $"{days} day{(days == 1 ? "" : "s")} late";
            }

            if (elapsed.TotalHours >= 1)
            {
                var hours = (int)elapsed.TotalHours;
                return $"{hours} hr{(hours == 1 ? "" : "s")} late";
            }

            var minutes = Math.Max(1, (int)elapsed.TotalMinutes);
            return $"{minutes} min late";
        }
    }
}