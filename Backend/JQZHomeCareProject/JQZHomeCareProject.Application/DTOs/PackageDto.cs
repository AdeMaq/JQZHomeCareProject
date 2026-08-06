using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
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

        [Required(ErrorMessage = "Package name is required.")]
        [StringLength(150, MinimumLength = 1)]
        public string Name { get; set; } = string.Empty;

        [Range(1, int.MaxValue, ErrorMessage = "NumberOfVisits must be at least 1.")]
        public int NumberOfVisits { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0.")]
        public decimal Amount { get; set; }
    }

    public class UpdatePackageDto
    {
        [Required(ErrorMessage = "Package name is required.")]
        [StringLength(150, MinimumLength = 1)]
        public string Name { get; set; } = string.Empty;

        [Range(1, int.MaxValue, ErrorMessage = "NumberOfVisits must be at least 1.")]
        public int NumberOfVisits { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0.")]
        public decimal Amount { get; set; }
    }
}
