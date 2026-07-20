using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace JQZHomeCareProject.Infrastructure.Maps
{
    public class GeoapifyGeocodeResponse
    {
        [JsonPropertyName("features")]
        public List<GeoapifyFeature> Features { get; set; } = new();

    }

    public class GeoapifyFeature
    {
        [JsonPropertyName("properties")]
        public GeoapifyProperties Properties { get; set; } = new();
    }

    public class GeoapifyProperties 
    {
        [JsonPropertyName("lat")]
        public double Lat { get; set; }

        [JsonPropertyName("lon")]
        public double Lon { get; set; }

        [JsonPropertyName("formatted")]
        public string? Formatted { get; set; } 
    }
}
