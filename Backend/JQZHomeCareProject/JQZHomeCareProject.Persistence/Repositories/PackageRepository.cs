using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Domain.Entities;

namespace JQZHomeCareProject.Persistence.Repositories
{
    public class PackageRepository : GenericRepository<Package>, IPackageRepository
    {
        public PackageRepository(AppDbContext context) : base(context)
        {

        }
    }
}
