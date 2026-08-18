using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Mobile.Models.Ratings
{
    public class RatingDto
    {
        public string Id { get; set; } = string.Empty;
        public string PractitionerId { get; set; } = string.Empty;
        public string Month { get; set; } = string.Empty;
        public decimal Score { get; set; }
        public string? Comments { get; set; }
    }
}
