using JQZHomeCareProject.Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
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
        [Required(ErrorMessage = "Service name is required.")]
        [StringLength(100, MinimumLength = 1, ErrorMessage = "Service name must be between 1 and 100 characters.")]
        public string Name { get; set; } = string.Empty;
        public Guid ServiceCategoryId { get; set; }

        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters.")]
        public string? Description { get; set; }
    }

    public class UpdateServiceDto
    {
        [Required(ErrorMessage = "Service name is required.")]
        [StringLength(100, MinimumLength = 1, ErrorMessage = "Service name must be between 1 and 100 characters.")]
        public string Name { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters.")]
        public string? Description { get; set; }
    }
}
