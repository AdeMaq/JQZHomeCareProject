using JQZHomeCareProject.Mobile.Models.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Mobile.Models.Visits
{
    public class CancelVisitDto
    {
        public RefusedBy RefusedBy { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
}
