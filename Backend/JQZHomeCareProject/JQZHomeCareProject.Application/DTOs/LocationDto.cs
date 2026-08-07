using JQZHomeCareProject.Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace JQZHomeCareProject.Application.DTOs
{
    public class CheckInDto
    {
        [Range(-90, 90, ErrorMessage = "Latitude must be between -90 and 90.")]
        public double Latitude { get; set; }

        [Range(-180, 180, ErrorMessage = "Longitude must be between -180 and 180.")]
        public double Longitude { get; set; }
        public DateTime Timestamp { get; set; }
    }
    public class CheckOutDto
    {
        [Range(-90, 90, ErrorMessage = "Latitude must be between -90 and 90.")]
        public double Latitude { get; set; }

        [Range(-180, 180, ErrorMessage = "Longitude must be between -180 and 180.")]
        public double Longitude { get; set; }
        public DateTime Timestamp { get; set; }
        public ReceivedByType ReceivedBy { get; set; }
        public decimal? AmountReceived { get; set; }
    }
}
