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
        public ReceivedBy ReceivedBy { get; set; }

        /// <summary>
        /// Required only when ReceivedBy = Practitioner. Never sent (or left
        /// null) when ReceivedBy = Company — validate this client-side before
        /// calling the API, matching the backend's rejection rule (Section 11).
        /// </summary>
        public decimal? AmountReceived { get; set; }
    }
}
