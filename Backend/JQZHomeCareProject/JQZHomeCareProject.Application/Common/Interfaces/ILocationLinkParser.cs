using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.Common.Interfaces
{
    public interface ILocationLinkParser
    {
        /// <summary>
        /// Accepts anything a patient/admin might paste: a Google Maps link,
        /// a WhatsApp live-location link, an Apple Maps link, a geo: URI,
        /// raw "lat,lng" text, or a plain text address (falls back to Geoapify).
        /// </summary>
        Task<(double Latitude, double Longitude, string? FormattedAddress)> ParseAsync(string input);
    }
}
