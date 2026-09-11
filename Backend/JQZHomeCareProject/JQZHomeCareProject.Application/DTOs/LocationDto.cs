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
        public decimal Amount { get; set; } = 0; // amount collected at this visit; 0 = nothing collected here
        public PaymentStatus ReceivedBy { get; set; } // must be PaidToPractitioner or PaidToCompany if Amount > 0
    }
    public class ParseLocationLinkDto
    {
        [Required, StringLength(2000, MinimumLength = 1)]
        public string Link { get; set; } = string.Empty;
    }

    public class LocationCoordinatesDto
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string? FormattedAddress { get; set; }
        public string Source { get; set; } = string.Empty; // "link" or "geocoded"
    }
}
