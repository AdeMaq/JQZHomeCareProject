using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;

namespace JQZHomeCareProject.Mobile.Models.Visits
{
    public class VisitDateGroup: ObservableCollection<VisitDto>
    {
        public DateTime Date { get; }
        public string? DateLabel { get; }

        public VisitDateGroup(DateTime date, IEnumerable<VisitDto> visits):base (visits)
        {
            Date = date;
            DateLabel = date.ToString("dddd, d MMMM yyyy");
        }

    }
}
