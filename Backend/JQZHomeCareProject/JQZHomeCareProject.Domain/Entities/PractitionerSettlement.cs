using JQZHomeCareProject.Domain.Common;
using JQZHomeCareProject.Domain.Enums;

namespace JQZHomeCareProject.Domain.Entities
{
    public class PractitionerSettlement : BaseEntity
    {
        public Guid PractitionerId { get; set; }
        public Practitioner? Practitioner { get; set; }

        public DateTime WeekStartDate { get; set; }
        public DateTime WeekEndDate { get; set; }
        public decimal TotalVisitAmount { get; set; }
        public decimal PractitionerShareAmount { get; set; }
        public decimal CompanyShareAmount { get; set; }
        public CollectionStatus Status { get; set; } = CollectionStatus.Pending;
        public DateTime? ReceivedDate { get; set; }

        public Guid? ReceivedByUserId { get; set; }
        public User? ReceivedByUser { get; set; }

        public ICollection<Visit> Visits { get; set; } = new List<Visit>();
    }
}