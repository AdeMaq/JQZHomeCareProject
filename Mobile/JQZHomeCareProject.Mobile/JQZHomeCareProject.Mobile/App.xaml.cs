using JQZHomeCareProject.Mobile.Services.Auth;
using JQZHomeCareProject.Mobile.Services.Navigation;
using JQZHomeCareProject.Mobile.Views.Auth;

namespace JQZHomeCareProject.Mobile
{
    public partial class App : Application
    {
        private readonly IServiceProvider _services;

        public App(IServiceProvider services)
        {
            InitializeComponent();
            _services = services;

            var session = _services.GetRequiredService<ISessionService>();
            session.SessionExpired += OnSessionExpired;
        }

        private async void OnSessionExpired()
        {
            var session = _services.GetRequiredService<ISessionService>();
            var navigation = _services.GetRequiredService<INavigationService>();

            await session.ClearAsync();
            await navigation.GoToLoginAsync();
        }

        protected override Window CreateWindow(IActivationState? activationState)
        {
            var splash = _services.GetRequiredService<SplashPage>();
            return new Window(splash);
        }
    }
}