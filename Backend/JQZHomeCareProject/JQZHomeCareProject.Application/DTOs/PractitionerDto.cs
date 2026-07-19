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
        public PractitionerType Type { get; set; }
        public string Education { get; set; } = string.Empty;
        public int Priority { get; set; }
        public List<AreaDto> Areas { get; set; } = new();
        public int VisitCount { get; set; }
        public int CancellationCount { get; set; }
    }
}
