using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Common;

namespace JQZHomeCareProject.Domain.Entities
{
    public class PractitionerArea : BaseEntity
    {
        public Guid PractitionerId { get; set; }
        public Practitioner? Practitioner { get; set; }
        public Guid AreaId { get; set; }
        public Area? Area { get; set; }
    }
}
