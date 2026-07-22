using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.DTOs
{
    public class UpdateVisitDto
    {
        public Guid PractitionerId { get; set; }
        public Guid AreaId { get; set; }
        public Guid ServiceId { get; set; }
        public Guid? PackageId { get; set; }
        public DateTime ScheduledDate { get; set; }
        public string TimeSlot { get; set; } = string.Empty;
        public decimal AmountDue { get; set; }
    }
}
