using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Enums;

namespace JQZHomeCareProject.Application.DTOs
{
    public class CreateServiceDto
    {
        public string Name { get; set; } = string.Empty;
        public ServiceCategory Category { get; set; }
        public string? Description { get; set; }
    }
}
