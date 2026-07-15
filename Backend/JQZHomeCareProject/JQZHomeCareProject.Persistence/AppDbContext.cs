using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace JQZHomeCareProject.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Practitioner> Practitioners => Set<Practitioner>();
        public DbSet<PractitionerArea> PractitionerAreas => Set<PractitionerArea>();
        public DbSet<Area> Areas => Set<Area>();
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
            base.OnModelCreating(modelBuilder);
        }
    }
}
