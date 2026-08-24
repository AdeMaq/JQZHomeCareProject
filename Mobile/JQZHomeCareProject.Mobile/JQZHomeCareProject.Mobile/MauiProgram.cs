using CommunityToolkit.Maui;
using JQZHomeCareProject.Mobile.Helpers;
using JQZHomeCareProject.Mobile.Services.Api;
using JQZHomeCareProject.Mobile.Services.Auth;
using JQZHomeCareProject.Mobile.Services.Navigation;
using JQZHomeCareProject.Mobile.ViewModels.Auth;
using JQZHomeCareProject.Mobile.Views.Auth;
using JQZHomeCareProject.Mobile.Views.Home;
using Microsoft.Extensions.Logging;

namespace JQZHomeCareProject.Mobile
{
    public static class MauiProgram
    {
        public static MauiApp CreateMauiApp()
        {
            var builder = MauiApp.CreateBuilder();
            builder
                .UseMauiApp<App>()
                .UseMauiCommunityToolkit()
                .ConfigureFonts(fonts =>
                {
                    fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                    fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
                });

            // --- Core services ---
            builder.Services.AddSingleton<ISessionService, SessionService>();
            builder.Services.AddSingleton<INavigationService, ShellNavigationService>();
            builder.Services.AddTransient<AuthHeaderHandler>();

            // --- Auth API (no AuthHeaderHandler — login can't require a token) ---
            builder.Services.AddHttpClient<IAuthApi, AuthApi>(client =>
            {
                client.BaseAddress = new Uri(Constants.ApiBaseUrl);
            });

            // --- Pages / ViewModels ---
            builder.Services.AddTransient<SplashPage>();
            builder.Services.AddTransient<LoginPage>();
            builder.Services.AddTransient<LoginViewModel>();
            builder.Services.AddTransient<HomePage>();
            builder.Services.AddTransient<AppShell>();


#if DEBUG
            builder.Logging.AddDebug();
#endif

            return builder.Build();
        }
    }
}
