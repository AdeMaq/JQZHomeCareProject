using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.DTOs
{
    public class WeeklySettlementDto
    {
        public Guid PractitionerId { get; set; }
        public DateTime WeekStart {  get; set; }
        public DateTime WeekEnd { get; set; }
        public decimal TotalDue { get; set; }
        public decimal TotalReceivedByPractitioner { get; set; }
        public decimal TotalReceivedByCompany { get; set; }

    }
}
