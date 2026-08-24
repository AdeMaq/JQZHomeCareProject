using JQZHomeCareProject.Mobile.Services.Auth;
using JQZHomeCareProject.Mobile.Services.Navigation;

namespace JQZHomeCareProject.Mobile.Views.Auth
{
    public partial class SplashPage : ContentPage
    {
        private readonly ISessionService _session;
        private readonly INavigationService _navigation;

        public SplashPage(ISessionService session, INavigationService navigation)
        {
            InitializeComponent();
            _session = session;
            _navigation = navigation;
        }

        protected override async void OnAppearing()
        {
            base.OnAppearing();
            await Task.Delay(300);

            var hasSession = await _session.HasValidSessionAsync();

            if (hasSession)
                await _navigation.GoToAppShellAsync();
            else
                await _navigation.GoToLoginAsync();
        }
    }
}