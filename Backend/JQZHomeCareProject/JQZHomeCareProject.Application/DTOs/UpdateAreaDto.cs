using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.DTOs
{
    public class UpdateAreaDto
    {
        public string Name { get; set; } = string.Empty;
        public string? GeoBoundary { get; set; }
    }
}
