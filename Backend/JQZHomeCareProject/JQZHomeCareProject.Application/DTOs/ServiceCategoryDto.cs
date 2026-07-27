using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.DTOs
{
    public class ServiceCategoryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class CreateServiceCategoryDto
    {
        public string Name { get; set; } = string.Empty;
    }

    public class UpdateServiceCategoryDto
    {
        public string Name { get; set; } = string.Empty;
    }
}
