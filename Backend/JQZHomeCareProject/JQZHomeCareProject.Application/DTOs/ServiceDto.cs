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
        public ServiceCategory Category { get; set; }
        public string? Description { get; set; }
    }
}
