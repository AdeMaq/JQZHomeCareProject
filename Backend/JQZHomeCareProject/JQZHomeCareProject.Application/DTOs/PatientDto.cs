using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace JQZHomeCareProject.Application.DTOs
{
    public class PatientDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public int VisitCount { get; set; }
        public string LocationAddress { get; set; } = string.Empty;
    }

    public class UpdatePatientDto
    {
        [Required(ErrorMessage = "Patient name is required.")]
        [StringLength(150, MinimumLength = 1)]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Phone is required.")]
        [StringLength(20, MinimumLength = 7)]
        public string Phone { get; set; } = string.Empty;

        [Required(ErrorMessage = "Location address is required.")]
        [StringLength(500, MinimumLength = 1)]
        public string LocationAddress { get; set; } = string.Empty;
    }
}
