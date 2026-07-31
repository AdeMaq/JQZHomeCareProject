using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.DTOs
{
    public class DashboardSummaryDto
    {
        public int ExpectedVisits { get; set; }
        public int ActualVisitsDone { get; set; }
        public decimal PaymentReceived { get; set; }
        public decimal PendingCollectionAmount { get; set; }
    }
}
