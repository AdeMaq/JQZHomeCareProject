using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Infrastructure.Maps
{
    public class GeoapifySettings
    {
        public string ApiKey { get; set; } = string.Empty;
        public string BaseUrl { get; set; } = "https://api.geoapify.com/v1/geocode/search";

    }
}
