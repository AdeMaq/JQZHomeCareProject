using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.Services;
using JQZHomeCareProject.Infrastructure;
using JQZHomeCareProject.Infrastructure.Auth;
using JQZHomeCareProject.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using JQZHomeCareProject.API.Middleware;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "JQZHomeCareProject API",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste your raw JWT token here (no 'Bearer ' prefix needed)."
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = new List<string>()
    });
});

builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddInfrastructure(builder.Configuration, builder.Environment);
builder.Services.AddScoped<IAuthService, JQZHomeCareProject.Application.Services.AuthService>();
builder.Services.AddScoped<IPractitionerService, JQZHomeCareProject.Application.Services.PractitionerService>();
builder.Services.AddScoped<IAreaService, JQZHomeCareProject.Application.Services.AreaService>();
builder.Services.AddScoped<IPackageService, JQZHomeCareProject.Application.Services.PackageService>();
builder.Services.AddScoped<IServiceService, JQZHomeCareProject.Application.Services.ServiceService>();
builder.Services.AddScoped<ILocationRepository, JQZHomeCareProject.Persistence.Repositories.LocationRepository>();
builder.Services.AddScoped<IPatientRepository, JQZHomeCareProject.Persistence.Repositories.PatientRepository>();
builder.Services.AddScoped<IVisitService, JQZHomeCareProject.Application.Services.VisitService>(); 
builder.Services.AddScoped<IDashboardService, JQZHomeCareProject.Application.Services.DashboardService>();
builder.Services.AddScoped<IRatingService, JQZHomeCareProject.Application.Services.RatingService>();
builder.Services.AddScoped<IPaymentService, JQZHomeCareProject.Application.Services.PaymentService>();
builder.Services.AddScoped<IUserService, JQZHomeCareProject.Application.Services.UserService>();
builder.Services.AddScoped<ICityService, JQZHomeCareProject.Application.Services.CityService>();



var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>()
    ?? throw new InvalidOperationException("Jwt configuration section is missing.");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret))
    };
});

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseCors("AngularPolicy");

app.UseMiddleware<JQZHomeCareProject.API.Middleware.ExceptionHandlingMiddleware>();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();