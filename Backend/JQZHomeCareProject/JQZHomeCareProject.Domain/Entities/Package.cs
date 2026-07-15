using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Common;

namespace JQZHomeCareProject.Domain.Entities
{
    public class Package : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public int NumberOfVisits { get; set; }
        public decimal Amount { get; set; }
        public ICollection<Visit> Visits { get; set; } = new List<Visit>();
    }
}
