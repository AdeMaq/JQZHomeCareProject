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
        public ServiceCategory Category { get; set; }
        public string? Description { get; set; }

        public ICollection<Visit> Visits { get; set; } = new List<Visit>();
    }
}
