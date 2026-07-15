using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Common;
using JQZHomeCareProject.Domain.Enums;

namespace JQZHomeCareProject.Domain.Entities
{
    public class Refusal : BaseEntity
    {
        public Guid VisitId { get; set; }
        public Visit? Visit { get; set; }

        public RefusedBy RefusedBy { get; set; }
        public string Reason { get; set; } = string.Empty;
        public DateTime Date { get; set; }
    }
}
