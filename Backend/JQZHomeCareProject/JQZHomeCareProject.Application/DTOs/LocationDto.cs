using JQZHomeCareProject.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.DTOs
{
    public class CheckInDto
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public DateTime Timestamp { get; set; }
    }
    public class CheckOutDto
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public DateTime Timestamp { get; set; }
        public ReceivedByType ReceivedBy { get; set; }
        public decimal? AmountReceived { get; set; }
    }
}
