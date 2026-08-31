using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using JQZHomeCareProject.Mobile.Models.Common;
using JQZHomeCareProject.Mobile.Models.Visits;
using JQZHomeCareProject.Mobile.Services.Api;
using JQZHomeCareProject.Mobile.Services.Auth;
using JQZHomeCareProject.Mobile.Services.Navigation;
using JQZHomeCareProject.Mobile.ViewModels.Base;

namespace JQZHomeCareProject.Mobile.ViewModels.Visits
{
    public partial class VisitsViewModel : BaseViewModel
    {
        private readonly IVisitsApi _visitsApi;
        private readonly ISessionService _session;
        private readonly INavigationService _navigation;

        private Guid _practitionerId;

        [ObservableProperty] private ObservableCollection<VisitDto> upcomingVisits = new();
        [ObservableProperty] private ObservableCollection<VisitDto> inProgressVisits = new();
        [ObservableProperty] private ObservableCollection<VisitDto> completedVisits = new();
        [ObservableProperty] private ObservableCollection<VisitDto> cancelledVisits = new();
        [ObservableProperty] private bool hasNoVisits;

        public VisitsViewModel(IVisitsApi visitsApi, ISessionService session, INavigationService navigation)
        {
            _visitsApi = visitsApi;
            _session = session;
            _navigation = navigation;
            Title = "Visits";
        }

        [RelayCommand]
        private async Task LoadAsync()
        {
            await RunSafelyAsync(async () =>
            {
                var practitionerId = await _session.GetPractitionerIdAsync();
                if (practitionerId is null)
                {
                    ErrorMessage = "No practitioner linked to this account.";
                    return;
                }
                _practitionerId = practitionerId.Value;

                // NOTE: same client-side filtering pattern used in VisitsListViewModel —
                // GET /api/visits currently returns every practitioner's visits.
                var all = await _visitsApi.GetAllAsync();
                var mine = all.Where(v => v.PractitionerId == _practitionerId).ToList();

                UpcomingVisits = new ObservableCollection<VisitDto>(
                    mine.Where(v => v.Status == VisitStatus.Scheduled)
                        .OrderBy(v => v.ScheduledDate)
                        .ThenBy(v => v.SlotStart));

                InProgressVisits = new ObservableCollection<VisitDto>(
                    mine.Where(v => v.Status == VisitStatus.InProgress)
                        .OrderBy(v => v.ScheduledDate)
                        .ThenBy(v => v.SlotStart));

                CompletedVisits = new ObservableCollection<VisitDto>(
                    mine.Where(v => v.Status == VisitStatus.Completed)
                        .OrderByDescending(v => v.ScheduledDate)
                        .ThenByDescending(v => v.SlotStart));

                CancelledVisits = new ObservableCollection<VisitDto>(
                    mine.Where(v => v.Status == VisitStatus.Cancelled)
                        .OrderByDescending(v => v.ScheduledDate)
                        .ThenByDescending(v => v.SlotStart));

                HasNoVisits = UpcomingVisits.Count == 0
                              && InProgressVisits.Count == 0
                              && CompletedVisits.Count == 0
                              && CancelledVisits.Count == 0;
            });
        }

        [RelayCommand]
        private async Task RefreshAsync()
        {
            IsRefreshing = true;
            await LoadAsync();
        }

        [RelayCommand]
        private async Task OpenVisitAsync(VisitDto visit)
        {
            if (visit is null) return;
            await _navigation.GoToAsync($"visits/detail?visitId={visit.Id}");
        }
    }
}