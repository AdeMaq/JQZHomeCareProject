using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Common;
using JQZHomeCareProject.Domain.Enums;

namespace JQZHomeCareProject.Domain.Entities
{
    public class Practitioner : BaseEntity
    {
        public PractitionerType Type { get; set; }
        public string Education { get; set; } = string.Empty;
        public int Priority { get; set; } 
        public Guid CreatedByUserId { get; set; }
        public User? CreatedByUser { get; set; }

        public ICollection<PractitionerArea> PractitionerAreas { get; set; } = new List<PractitionerArea>();
        public ICollection<Visit> Visits { get; set; } = new List<Visit>();
        public ICollection<Rating> Ratings { get; set; } = new List<Rating>();
    }
}
