using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Infrastructure.Auth;
using JQZHomeCareProject.Infrastructure.Maps;
using JQZHomeCareProject.Infrastructure.Notifications;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace JQZHomeCareProject.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services,
            IConfiguration config,
            IHostEnvironment environment)
        {
            services.Configure<JwtSettings>(config.GetSection("Jwt"));
            services.Configure<GeoapifySettings>(config.GetSection("Geoapify"));

            services.Configure<FirebaseSettings>(config.GetSection("Firebase"));

            services.PostConfigure<FirebaseSettings>(settings =>
            {
                var repoRoot = Path.Combine(environment.ContentRootPath, "..", "..", "..");
                settings.CredentialsFileName = Path.GetFullPath(
                    Path.Combine(repoRoot, settings.CredentialsFileName));
            });

            services.AddScoped<IPasswordHasher, PasswordHasher>();
            services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
            services.AddScoped<IPushNotificationService, FirebasePushNotificationService>();

            services.AddHttpClient<IMapsService, MapsService>();

            return services;
        }
    }
}