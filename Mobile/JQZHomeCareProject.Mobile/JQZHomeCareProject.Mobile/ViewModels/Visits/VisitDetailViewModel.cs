using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using JQZHomeCareProject.Mobile.Helpers;
using JQZHomeCareProject.Mobile.Models.Common;
using JQZHomeCareProject.Mobile.Models.Visits;
using JQZHomeCareProject.Mobile.Services.Api;
using JQZHomeCareProject.Mobile.Services.Navigation;
using JQZHomeCareProject.Mobile.ViewModels.Base;
using Microsoft.Maui.ApplicationModel;
using Microsoft.Maui.ApplicationModel.Communication;

namespace JQZHomeCareProject.Mobile.ViewModels.Visits
{
    public partial class VisitDetailViewModel : BaseViewModel, IQueryAttributable
    {
        private readonly IVisitsApi _visitsApi;
        private readonly INavigationService _navigation;

        private Guid _visitId;

        [ObservableProperty]
        [NotifyPropertyChangedFor(nameof(IsScheduled))]
        [NotifyPropertyChangedFor(nameof(IsInProgress))]
        [NotifyPropertyChangedFor(nameof(IsCompleted))]
        [NotifyPropertyChangedFor(nameof(IsCancelled))]
        [NotifyPropertyChangedFor(nameof(IsActionable))]
        [NotifyPropertyChangedFor(nameof(CanCheckIn))]
        [NotifyPropertyChangedFor(nameof(CanCheckOut))]
        [NotifyPropertyChangedFor(nameof(CanCancel))]
        [NotifyPropertyChangedFor(nameof(CancelNoticeText))]
        [NotifyPropertyChangedFor(nameof(StatusLabel))]
        private VisitDto? visit;

        public bool IsScheduled => Visit?.Status == VisitStatus.Scheduled;
        public bool IsInProgress => Visit?.Status == VisitStatus.InProgress;
        public bool IsCompleted => Visit?.Status == VisitStatus.Completed;
        public bool IsCancelled => Visit?.Status == VisitStatus.Cancelled;

        // Whether the Check-in / Cancel / Check-out card should render at all.
        public bool IsActionable => IsScheduled || IsInProgress;

        public bool CanCheckIn => IsScheduled;
        public bool CanCheckOut => IsInProgress;

        public bool CanCancel =>
            IsScheduled &&
            Visit?.ScheduledDateTime is DateTime scheduled &&
            (scheduled - DateTime.Now) > TimeSpan.FromHours(Constants.CancelCutoffHours);

        public string StatusLabel => Visit?.Status switch
        {
            VisitStatus.Scheduled => "Upcoming",
            VisitStatus.InProgress => "In Progress",
            VisitStatus.Completed => "Completed",
            VisitStatus.Cancelled => "Cancelled",
            _ => string.Empty
        };

        public string CancelNoticeText
        {
            get
            {
                if (Visit is null) return string.Empty;

                return Visit.Status switch
                {
                    VisitStatus.Scheduled when CanCancel =>
                        "You can cancel this visit only before Check-in. After Check-in, visit cannot be cancelled.",
                    VisitStatus.Scheduled =>
                        $"Cancellation window has closed \u2014 visit starts in under {Constants.CancelCutoffHours} hours.",
                    VisitStatus.InProgress =>
                        "This visit is in progress and can no longer be cancelled.",
                    _ => string.Empty
                };
            }
        }

        public VisitDetailViewModel(IVisitsApi visitsApi, INavigationService navigation)
        {
            _visitsApi = visitsApi;
            _navigation = navigation;
            Title = "Visit Details";
        }

        // Shell calls this automatically when navigated to with a query string,
        // e.g. GoToAsync($"visits/detail?visitId={id}").
        public void ApplyQueryAttributes(IDictionary<string, object> query)
        {
            if (query.TryGetValue("visitId", out var value) && Guid.TryParse(value?.ToString(), out var id))
            {
                _visitId = id;
                _ = LoadAsync();
            }
        }

        [RelayCommand]
        private async Task LoadAsync()
        {
            await RunSafelyAsync(async () =>
            {
                Visit = await _visitsApi.GetByIdAsync(_visitId);
            });
        }

        [RelayCommand]
        private async Task RefreshAsync()
        {
            IsRefreshing = true;
            await LoadAsync();
        }

        [RelayCommand]
        private async Task CallPatientAsync()
        {
            if (string.IsNullOrWhiteSpace(Visit?.PatientPhone)) return;

            try
            {
                PhoneDialer.Default.Open(Visit.PatientPhone);
            }
            catch (Exception)
            {
                ErrorMessage = "Unable to open the dialer on this device.";
            }
        }

        [RelayCommand]
        private async Task NavigateToPatientAsync()
        {
            if (string.IsNullOrWhiteSpace(Visit?.PatientAddress)) return;

            var uri = new Uri("https://www.google.com/maps/search/?api=1&query=" + Uri.EscapeDataString(Visit.PatientAddress));

            try
            {
                await Launcher.Default.OpenAsync(uri);
            }
            catch (Exception)
            {
                ErrorMessage = "Unable to open Maps on this device.";
            }
        }

        [RelayCommand]
        private async Task GoToCheckInAsync()
        {
            if (!CanCheckIn) return;
            await _navigation.GoToAsync($"visits/checkin?visitId={_visitId}");
        }

        [RelayCommand]
        private async Task GoToCheckOutAsync()
        {
            if (!CanCheckOut) return;
            await _navigation.GoToAsync($"visits/checkout?visitId={_visitId}");
        }

        [RelayCommand]
        private async Task GoToCancelAsync()
        {
            if (!CanCancel) return;
            await _navigation.GoToAsync($"visits/cancel?visitId={_visitId}");
        }
    }
}