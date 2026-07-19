using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Infrastructure.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace JQZHomeCareProject.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
        {
            services.Configure<JwtSettings>(config.GetSection("Jwt"));

            services.AddScoped<IPasswordHasher, PasswordHasher>();
            services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

            return services;
        }
    }
}
