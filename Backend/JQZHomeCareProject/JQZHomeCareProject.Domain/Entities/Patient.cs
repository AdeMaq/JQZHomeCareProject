using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Common;

namespace JQZHomeCareProject.Domain.Entities
{
    public class Patient : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;

        public Guid LocationId { get; set; }
        public Location? Location { get; set; }

        public ICollection<Visit> Visits { get; set; } = new List<Visit>();
    }
}
