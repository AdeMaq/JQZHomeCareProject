using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Persistence
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration config)
        {
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(config.GetConnectionString("DefaultConnection")));

            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IPractitionerRepository, PractitionerRepository>();
            services.AddScoped<IAreaRepository, AreaRepository>();
            services.AddScoped<ICityRepository, CityRepository>();
            services.AddScoped<IVisitRepository, VisitRepository>();
            services.AddScoped<IPackageRepository, PackageRepository>();
            services.AddScoped<IServiceRepository, ServiceRepository>();
            services.AddScoped<ILocationRepository, LocationRepository>();
            services.AddScoped<IPatientRepository, PatientRepository>();
            services.AddScoped<IRefusalRepository, RefusalRepository>();
            services.AddScoped<IRatingRepository, RatingRepository>();
            services.AddScoped<IServiceCategoryRepository, ServiceCategoryRepository>();
            services.AddScoped<IPatientPackageRepository, PatientPackageRepository>();
            services.AddScoped<IPractitionerSettlementRepository, PractitionerSettlementRepository>();
            services.AddScoped<IApiClientRepository, ApiClientRepository>();

            return services;
        }
        
    }
}
