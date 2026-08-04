using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Enums;

namespace JQZHomeCareProject.Application.DTOs
{
    public class PractitionerDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public Guid ServiceId { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public string Education { get; set; } = string.Empty;
        public int Priority { get; set; }
        public decimal SharePercentage { get; set; }
        public List<AreaDto> Areas { get; set; } = new();
        public int VisitCount { get; set; }
        public int CancellationCount { get; set; }
    }

    public class CreatePractitionerDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public Guid ServiceId { get; set; }
        public string Education { get; set; } = string.Empty;
        public int Priority { get; set; }
        public decimal SharePercentage { get; set; }
        public List<Guid> AreaIds { get; set; } = new();
    }

    public class UpdatePractitionerDto
    {
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Password { get; set; } = null;
        public Guid ServiceId { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public string Education { get; set; } = string.Empty;
        public int Priority { get; set; }
        public decimal SharePercentage { get; set; }
        public List<Guid> AreaIds { get; set; } = new();
    }

    public class ResetPractitionerPasswordDto
    {
        public string NewPassword { get; set; } = string.Empty;
    }

}
