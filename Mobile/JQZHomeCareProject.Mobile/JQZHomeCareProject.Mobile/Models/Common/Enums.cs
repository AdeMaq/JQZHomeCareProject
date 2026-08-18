using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Mobile.Models.Common
{
   public enum VisitStatus
    {
        Scheduled,
        Accepted,
        Completed,
        Cancelled
    }

    public enum CollectionStatus
    {
        Pending,
        Received
    }

    public enum ReceivedBy
    {
        Practitioner,
        Company
    }

    public enum RefusedBy
    {
        Patient,
        Practitioner
    }
}
