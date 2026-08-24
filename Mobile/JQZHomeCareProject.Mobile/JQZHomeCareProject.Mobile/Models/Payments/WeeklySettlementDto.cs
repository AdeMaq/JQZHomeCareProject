using JQZHomeCareProject.Mobile.Models.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Mobile.Models.Payments
{
    public class WeeklySettlementDto
    {
        public Guid PractitionerId { get; set; }
        public DateTime WeekStart { get; set; }
        public DateTime WeekEnd { get; set; }
        public decimal TotalVisitAmount { get; set; }
        public decimal PractitionerShareAmount { get; set; }
        public decimal CompanyShareAmount { get; set; }

        // Always confirmed manually by Admin — mobile never sets this.
        public CollectionStatus Status { get; set; }
        public DateTime? ReceivedDate { get; set; }
    }
}
