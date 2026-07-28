using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.DTOs
{
    public class PackageDto
    {
        public Guid Id { get; set; }
        public Guid ServiceId { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int NumberOfVisits { get; set; }
        public decimal Amount { get; set; }
        public decimal PricePerVisit { get; set; } 
        public decimal Savings { get; set; } 
    }

    public class CreatePackageDto
    {
        public Guid ServiceId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int NumberOfVisits { get; set; }
        public decimal Amount { get; set; }
    }

    public class UpdatePackageDto
    {
        public string Name { get; set; } = string.Empty;
        public int NumberOfVisits { get; set; }
        public decimal Amount { get; set; }
    }
}
