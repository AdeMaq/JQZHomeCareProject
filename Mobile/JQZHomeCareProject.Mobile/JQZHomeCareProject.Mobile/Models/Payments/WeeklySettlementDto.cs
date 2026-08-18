using JQZHomeCareProject.Mobile.Models.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Mobile.Models.Payments
{
    public class WeeklySettlementDto
    {
        public string PractitionerId { get; set; } = string.Empty;
        public DateTime WeekStart { get; set; }
        public DateTime WeekEnd { get; set; }
        public decimal TotalVisitAmount { get; set; }
        public decimal PractitionerShareAmount { get; set; }
        public decimal CompanyShareAmount { get; set; }
        public CollectionStatus Status { get; set; }
        public DateTime? ReceivedDate { get; set; }
    }
}
