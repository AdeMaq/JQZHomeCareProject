using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.DTOs
{
    public class PackageDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int NumberOfVisits {  get; set; }
        public decimal Amount {  get; set; }
    }
}
