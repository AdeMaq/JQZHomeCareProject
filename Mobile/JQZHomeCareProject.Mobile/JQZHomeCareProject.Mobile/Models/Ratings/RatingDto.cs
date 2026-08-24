using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Mobile.Models.Ratings
{
    public class RatingDto
    {
        public Guid Id { get; set; }
        public Guid PractitionerId { get; set; }
        public DateTime Month { get; set; }
        public int Score { get; set; }
        public string? Comments { get; set; }
    }
}
