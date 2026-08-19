using CommunityToolkit.Maui;
using JQZHomeCareProject.Mobile.Services.Api;
using JQZHomeCareProject.Mobile.Services.Session;
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

            const string apiBaseAddress = "https://your-backend-host/";

            // Session — singleton, no dependencies
            builder.Services.AddSingleton<ISessionService, SessionService>();
            // AuthHeaderHandler must be transient: HttpClientFactory creates
            // a new handler instance per named/typed client internally.
            builder.Services.AddTransient<AuthHeaderHandler>();
            // IAuthApi: no AuthHeaderHandler — login has no token to attach yet.
            builder.Services.AddHttpClient<IAuthApi, AuthApi>(client =>
            {
                client.BaseAddress = new Uri(apiBaseAddress);
            });

            // Other typed clients (IVisitsApi, IPractitionersApi, ...) get
            // AddHttpClient<T, TImpl>(...).AddHttpMessageHandler<AuthHeaderHandler>()
            // added here as you build each one in later phases.

#if DEBUG
            builder.Logging.AddDebug();
#endif

            return builder.Build();
        }
    }
}
