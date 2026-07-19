using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Enums;

namespace JQZHomeCareProject.Application.DTOs
{
    public class RefusalDto
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string PractitionerName { get; set; } = string.Empty;
        public RefusedBy RefusedBy { get; set; }
        public string Reason { get; set; } = string.Empty;
        public DateTime Date { get; set; }
    }
}
