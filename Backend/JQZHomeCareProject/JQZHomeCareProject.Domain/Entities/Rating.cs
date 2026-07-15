using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Common;

namespace JQZHomeCareProject.Domain.Entities
{
    public class Rating : BaseEntity
    {
        public Guid PractitionerId { get; set; }
        public Practitioner? Practitioner { get; set; }
        public DateTime Month { get; set; }
        public int Score { get; set; }
        public string? Comments { get; set; }
    }
}
