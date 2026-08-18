using JQZHomeCareProject.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Domain.Entities
{
    public class City : BaseEntity
    {
        public string Name { get; set; } = string.Empty;

        public ICollection<Area> Areas { get; set; } = new List<Area>();
    }
}

