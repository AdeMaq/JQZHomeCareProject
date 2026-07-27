using JQZHomeCareProject.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.DTOs
{
    public class ServiceDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid ServiceCategoryId { get; set; }
        public string ServiceCategoryName { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class CreateServiceDto
    {
        public string Name { get; set; } = string.Empty;
        public Guid ServiceCategoryId { get; set; }
        public string? Description { get; set; }
    }

    public class UpdateServiceDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
