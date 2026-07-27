using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Common;
using JQZHomeCareProject.Domain.Enums;

namespace JQZHomeCareProject.Domain.Entities
{
    public class Service : BaseEntity
    {
        public string Name { get; set; } = string.Empty; 
        public Guid ServiceCategoryId { get; set; }
        public ServiceCategory? ServiceCategory { get; set; }
        public string? Description { get; set; }

        public ICollection<Practitioner> Practitioners { get; set; } = new List<Practitioner>();
        public ICollection<Package> Packages { get; set; } = new List<Package>();
    }
}
