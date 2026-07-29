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
        public string Name { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string LocationAddress { get; set; } = string.Empty;
    }
}
