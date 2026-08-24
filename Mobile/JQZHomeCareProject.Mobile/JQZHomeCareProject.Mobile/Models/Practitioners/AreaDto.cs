using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Mobile.Models.Practitioners
{
    public class AreaDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? CityName { get; set; }
    }
}
