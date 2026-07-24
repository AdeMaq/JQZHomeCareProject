using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Common;

namespace JQZHomeCareProject.Domain.Entities
{
    public class Area : BaseEntity
    {
        public string Name { get; set; } = string.Empty;

        public Guid CityId { get; set; }
        public City? City { get; set; }

        public ICollection<PractitionerArea> PractitionerAreas { get; set; } = new List<PractitionerArea>();
        public ICollection<Visit> Visits { get; set; } = new List<Visit>();
    }
}
