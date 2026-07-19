using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Enums;

namespace JQZHomeCareProject.Application.DTOs
{
    public class CheckOutDto
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public DateTime Timestamp { get; set; }
        public ReceivedByType ReceivedBy { get; set; }
        public decimal? AmountReceived { get; set; }
    }
}
