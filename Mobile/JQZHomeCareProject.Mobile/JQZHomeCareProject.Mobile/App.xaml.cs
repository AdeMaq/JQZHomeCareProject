using JQZHomeCareProject.Mobile.Views;
using Microsoft.Extensions.DependencyInjection;

namespace JQZHomeCareProject.Mobile
{
    public partial class App : Application
    {
        [Obsolete]
        public App(SplashPage splashPage)
        {
            InitializeComponent();
            // Login is the root page, not part of the Shell, matching
            // Section 9.2: Login/Splash sit outside the Shell.
            // Splash briefly owns MainPage first; once the session check
            // resolves, SplashViewModel navigates into either Login or
            // directly into AppShell via the pattern below.
            MainPage = splashPage;
        }

        protected override Window CreateWindow(IActivationState? activationState)
        {
            return new Window(new AppShell());
        }
    }
}