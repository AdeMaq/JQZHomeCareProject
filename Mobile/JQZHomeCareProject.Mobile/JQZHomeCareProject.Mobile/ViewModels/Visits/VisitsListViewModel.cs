using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using JQZHomeCareProject.Mobile.Models.Visits;
using JQZHomeCareProject.Mobile.Services.Api;
using JQZHomeCareProject.Mobile.Services.Auth;
using JQZHomeCareProject.Mobile.Services.Navigation;
using JQZHomeCareProject.Mobile.ViewModels.Base;

namespace JQZHomeCareProject.Mobile.ViewModels.Visits
{
    public partial class VisitsListViewModel : BaseViewModel
    {
        private readonly IVisitsApi _visitsApi;
        private readonly ISessionService _session;
        private readonly INavigationService _navigation;

        private Guid _practitionerId;
        private List<VisitDto> _allVisits = new();

        [ObservableProperty]
        private ObservableCollection<VisitDateGroup> groupedVisits = new();

        [ObservableProperty]
        private VisitDateFilter selectedFilter = VisitDateFilter.Week;

        [ObservableProperty]
        private bool isCustomRangeVisible;

        [ObservableProperty]
        private DateTime customStartDate = DateTime.Today;

        [ObservableProperty]
        private DateTime customEndDate = DateTime.Today.AddDays(6);

        public VisitsListViewModel(IVisitsApi visitsApi, ISessionService session, INavigationService navigation)
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

                // NOTE: /api/visits returns every practitioner's visits — filtered
                // here client-side, per the reference doc's Section 10.4 spec.
                // Worth requesting a practitioner-scoped endpoint from the backend.
                var all = await _visitsApi.GetAllAsync();
                _allVisits = all.Where(v => v.PractitionerId == _practitionerId).ToList();

                ApplyFilter();
            });
        }

        [RelayCommand]
        private async Task RefreshAsync()
        {
            IsRefreshing = true;
            await LoadAsync();
        }

        [RelayCommand]
        private void ChangeFilter(VisitDateFilter filter)
        {
            SelectedFilter = filter;
            IsCustomRangeVisible = filter == VisitDateFilter.Custom;
            ApplyFilter();
        }

        [RelayCommand]
        private void ApplyCustomRange()
        {
            if (CustomEndDate < CustomStartDate)
            {
                ErrorMessage = "End date can't be before start date.";
                return;
            }

            ErrorMessage = null;
            ApplyFilter();
        }

        [RelayCommand]
        private async Task OpenVisitAsync(VisitDto visit)
        {
            if (visit is null) return;
            await _navigation.GoToAsync($"visits/detail?visitId={visit.Id}");
        }

        private void ApplyFilter()
        {
            var (start, end) = GetRange();
            var today = DateTime.Today;

            var inRange = _allVisits
                .Where(v => v.ScheduledDate.HasValue
                            && v.ScheduledDate.Value.Date >= start.Date
                            && v.ScheduledDate.Value.Date <= end.Date)
                .ToList();

            var upcoming = inRange
                .Where(v => v.ScheduledDate!.Value.Date >= today)
                .OrderBy(v => v.ScheduledDate!.Value.Date)
                .ThenBy(v => v.SlotStart);

            var past = inRange
                .Where(v => v.ScheduledDate!.Value.Date < today)
                .OrderByDescending(v => v.ScheduledDate!.Value.Date)
                .ThenBy(v => v.SlotStart);

            var orderedDates = upcoming.Select(v => v.ScheduledDate!.Value.Date)
                .Concat(past.Select(v => v.ScheduledDate!.Value.Date))
                .Distinct()
                .ToList();

            var byDate = inRange.ToLookup(v => v.ScheduledDate!.Value.Date);

            var groups = orderedDates
                .Select(d => new VisitDateGroup(d, byDate[d].OrderBy(v => v.SlotStart)))
                .ToList();

            GroupedVisits = new ObservableCollection<VisitDateGroup>(groups);
        }

        private (DateTime Start, DateTime End) GetRange()
        {
            var today = DateTime.Today;

            switch (SelectedFilter)
            {
                case VisitDateFilter.Week:
                    var diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
                    var weekStart = today.AddDays(-diff);
                    return (weekStart, weekStart.AddDays(6));

                case VisitDateFilter.Month:
                    var monthStart = new DateTime(today.Year, today.Month, 1);
                    return (monthStart, monthStart.AddMonths(1).AddDays(-1));

                case VisitDateFilter.Custom:
                default:
                    return (CustomStartDate, CustomEndDate);
            }
        }
    }
}