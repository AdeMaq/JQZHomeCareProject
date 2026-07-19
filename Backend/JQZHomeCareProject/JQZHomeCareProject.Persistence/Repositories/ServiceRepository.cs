using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Domain.Entities;

namespace JQZHomeCareProject.Persistence.Repositories
{
    public class ServiceRepository : GenericRepository<Service>, IServiceRepository
    {
        public ServiceRepository(AppDbContext context) : base(context)
        {
        }
    }
}
