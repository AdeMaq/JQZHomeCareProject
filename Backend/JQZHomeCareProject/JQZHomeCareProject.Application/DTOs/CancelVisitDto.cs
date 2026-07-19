using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Enums;

namespace JQZHomeCareProject.Application.DTOs
{
    public class CancelVisitDto
    {
        public RefusedBy RefusedBy { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
}
