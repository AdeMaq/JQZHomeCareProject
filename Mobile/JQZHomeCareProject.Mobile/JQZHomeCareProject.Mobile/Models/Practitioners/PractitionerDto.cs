using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Mobile.Models.Practitioners
{
    public class PractitionerDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
        public string Education { get; set; } = string.Empty;

        // 1-5, Admin-set label only — read-only on mobile, not a score.
        public int Priority { get; set; }

        public decimal SharePercentage { get; set; }
        public List<AreaDto> Areas { get; set; } = new();
        public int VisitCount { get; set; }
        public int CancellationCount { get; set; }
    }
}
