using JQZHomeCareProject.Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

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
        [Required, StringLength(150, MinimumLength = 1)]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required, MinLength(8, ErrorMessage = "Password must be at least 8 characters.")]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string Phone { get; set; } = string.Empty;

        public Guid ServiceId { get; set; }

        [Required, StringLength(200)]
        public string Education { get; set; } = string.Empty;

        [Range(1, 5)]
        public int Priority { get; set; }

        [Range(0, 100)]
        public decimal SharePercentage { get; set; }

        public List<Guid> AreaIds { get; set; } = new();
    }

    public class UpdatePractitionerDto
    {
        [Required, StringLength(150, MinimumLength = 1)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Phone { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string? Password { get; set; } = null;

        public Guid ServiceId { get; set; }
        public string ServiceName { get; set; } = string.Empty;

        [Required, StringLength(200)]
        public string Education { get; set; } = string.Empty;

        [Range(1, 5)]
        public int Priority { get; set; }

        [Range(0, 100)]
        public decimal SharePercentage { get; set; }

        public List<Guid> AreaIds { get; set; } = new();
    }

    public class ResetPractitionerPasswordDto
    {
        [Required, MinLength(8, ErrorMessage = "Password must be at least 8 characters.")]
        public string NewPassword { get; set; } = string.Empty;
    }

}
