using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Common;

namespace JQZHomeCareProject.Domain.Entities
{
    public class Package : BaseEntity
    {
        public Guid ServiceId { get; set; }
        public Service? Service { get; set; }

        public string Name { get; set; } = string.Empty;
        public int NumberOfVisits { get; set; }
        public decimal Amount { get; set; } 

        public ICollection<PatientPackage> PatientPackages { get; set; } = new List<PatientPackage>();
    }
}
