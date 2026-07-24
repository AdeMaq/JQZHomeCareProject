using JQZHomeCareProject.Domain.Entities;
using JQZHomeCareProject.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;

namespace JQZHomeCareProject.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<City> Cities { get; set; }
        public DbSet<Area> Areas { get; set; }
        public DbSet<PractitionerArea> PractitionerAreas { get; set; }
        public DbSet<Practitioner> Practitioners => Set<Practitioner>();
        public DbSet<Patient> Patients => Set<Patient>();
        public DbSet<Location> Locations => Set<Location>();
        public DbSet<Package> Packages => Set<Package>();
        public DbSet<Service> Services => Set<Service>();
        public DbSet<Visit> Visits => Set<Visit>();
        public DbSet<Refusal> Refusals => Set<Refusal>();
        public DbSet<Rating> Ratings => Set<Rating>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    Name = "Super Admin",
                    Email = "superadmin@jqz.com",
                    PasswordHash = "100000.JIa07Th2kT4wSDYr8TvzXw==.MgTSH4YdTIoIbXfnbhUaqkiFAfndmXdEorfcD+x/5r8=",
                    Role = UserRole.SuperAdmin,
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new User
                {
                    Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    Name = "Middle Power Admin",
                    Email = "middleadmin@jqz.com",
                    PasswordHash = "100000.82XTcj/peRxNQbuB6isD+A==.Gsde6PWtQW+b8N5pxtEkvTkmu6N0hvifAvJ3Jyli5sY=",
                    Role = UserRole.MiddlePowerAdmin,
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new User
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                    Name = "Simple Admin",
                    Email = "simpleadmin@jqz.com",
                    PasswordHash = "100000.bOi3I8UEigu4rtqVUy+27Q==.s0OCxW8kVkXBgG5TZ9waUrTIU1jhSHu1JqUf0vIL5XY=",
                    Role = UserRole.SimpleAdmin,
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                }
            );

            base.OnModelCreating(modelBuilder);
        }
    }
}
