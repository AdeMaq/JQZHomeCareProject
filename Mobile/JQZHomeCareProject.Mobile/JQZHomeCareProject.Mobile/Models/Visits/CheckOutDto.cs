using JQZHomeCareProject.Mobile.Models.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Mobile.Models.Visits
{
    public class CheckOutDto
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public DateTime Timestamp { get; set; }
        public ReceivedByType ReceivedBy { get; set; }

        // Required only when ReceivedBy == Practitioner; must stay null/hidden
        // when ReceivedBy == Company. Enforce this in CheckOutViewModel before
        // the API call (Section 11 business rule), not here.
        public decimal? AmountReceived { get; set; }
    }
}
