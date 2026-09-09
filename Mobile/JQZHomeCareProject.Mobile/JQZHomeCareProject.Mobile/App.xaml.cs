using JQZHomeCareProject.Mobile.Helpers;
using JQZHomeCareProject.Mobile.Services.Auth;
using JQZHomeCareProject.Mobile.Services.Navigation;
using JQZHomeCareProject.Mobile.Views.Auth;

namespace JQZHomeCareProject.Mobile
{
    public partial class App : Application
    {
        private readonly IServiceProvider _services;
        private readonly ISessionService _session;
        private readonly INavigationService _navigation;

        public App(IServiceProvider services, ISessionService session, INavigationService navigation)
        {
            InitializeComponent();

            _services = services;
            _session = session;
            _navigation = navigation;

            _session.SessionExpired += OnSessionExpired;

            AppDomain.CurrentDomain.UnhandledException += (_, args) =>
                CrashLogger.Log(args.ExceptionObject as Exception ?? new Exception("Unknown unhandled exception"));

            TaskScheduler.UnobservedTaskException += (_, args) =>
            {
                CrashLogger.Log(args.Exception);
                args.SetObserved();
            };
        }

        protected override Window CreateWindow(IActivationState? activationState)
        {
            var splash = _services.GetRequiredService<SplashPage>();
            return new Window(splash);
        }

        private async void OnSessionExpired()
        {
            await _session.ClearAsync();
            await _navigation.GoToLoginAsync();
        }
    }
}