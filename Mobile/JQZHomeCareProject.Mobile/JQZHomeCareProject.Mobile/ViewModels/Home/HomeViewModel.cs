using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using JQZHomeCareProject.Mobile.Models.Visits;
using JQZHomeCareProject.Mobile.Services.Api;
using JQZHomeCareProject.Mobile.Services.Auth;
using JQZHomeCareProject.Mobile.Services.Navigation;
using JQZHomeCareProject.Mobile.ViewModels.Base;

namespace JQZHomeCareProject.Mobile.ViewModels.Home
{
    public partial class HomeViewModel : BaseViewModel
    {
        private readonly IVisitsApi _visitsApi;
        private readonly IRatingsApi _ratingsApi;
        private readonly IPractitionersApi _practitionersApi;
        private readonly ISessionService _session;
        private readonly INavigationService _navigation;

        private readonly string _greetingPrefix;
        private Guid _practitionerId;
        private bool _practitionerNameLoaded;

        [ObservableProperty]
        [NotifyPropertyChangedFor(nameof(GreetingLine))]
        private string practitionerName = string.Empty;

        [ObservableProperty]
        private string todayDateText = string.Empty;

        [ObservableProperty]
        private ObservableCollection<VisitDto> todaysVisits = new();

        [ObservableProperty]
        [NotifyPropertyChangedFor(nameof(ExpectedAmountTodayDisplay))]
        private decimal expectedAmountToday;

        [ObservableProperty]
        [NotifyPropertyChangedFor(nameof(LatestRatingDisplay))]
        private double? latestRatingScore;

        public string GreetingLine =>
            string.IsNullOrWhiteSpace(PractitionerName) ? _greetingPrefix : $"{_greetingPrefix}, {PractitionerName}";

        public string ExpectedAmountTodayDisplay => $"PKR {ExpectedAmountToday:N0}";

        public string LatestRatingDisplay => LatestRatingScore.HasValue ? $"{LatestRatingScore:0.0} \u2605" : "\u2014";

        public HomeViewModel(
            IVisitsApi visitsApi,
            IRatingsApi ratingsApi,
            IPractitionersApi practitionersApi,
            ISessionService session,
            INavigationService navigation)
        {
            _visitsApi = visitsApi;
            _ratingsApi = ratingsApi;
            _practitionersApi = practitionersApi;
            _session = session;
            _navigation = navigation;

            Title = "Home";
            TodayDateText = DateTime.Now.ToString("dddd, d MMMM yyyy");
            _greetingPrefix = BuildGreetingPrefix();
        }

        private static string BuildGreetingPrefix()
        {
            var hour = DateTime.Now.Hour;
            return hour switch
            {
                < 12 => "Good morning",
                < 17 => "Good afternoon",
                _ => "Good evening"
            };
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

                if (!_practitionerNameLoaded)
                {
                    var practitioner = await _practitionersApi.GetByIdAsync(_practitionerId);
                    PractitionerName = FirstName(practitioner.Name);
                    _practitionerNameLoaded = true;
                }

                var visits = await _visitsApi.GetTodayAsync(_practitionerId);
                TodaysVisits = new ObservableCollection<VisitDto>(visits.OrderBy(v => v.ScheduledDate));
                ExpectedAmountToday = visits.Sum(v => v.AmountDue);

                var ratings = await _ratingsApi.GetByPractitionerAsync(_practitionerId);
                LatestRatingScore = ratings.OrderByDescending(r => r.Month).FirstOrDefault()?.Score;
            });
        }

        [RelayCommand]
        private async Task RefreshAsync()
        {
            IsRefreshing = true;
            await LoadAsync();
        }

        [RelayCommand]
        private async Task ViewAllVisitsAsync()
        {
            await _navigation.GoToAsync("//visits");
        }

        [RelayCommand]
        private async Task OpenVisitAsync(VisitDto visit)
        {
            if (visit is null) return;
            await _navigation.GoToAsync($"visits/detail?visitId={visit.Id}");
        }

        [RelayCommand]
        private async Task OpenRatingsAsync()
        {
            // TEMP: routes to Visits until a dedicated Ratings page/tab exists.
            await _navigation.GoToAsync("//visits");
        }

        private static string FirstName(string fullName)
        {
            if (string.IsNullOrWhiteSpace(fullName)) return fullName;
            var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            return parts.Length > 0 ? parts[0] : fullName;
        }
    }
}