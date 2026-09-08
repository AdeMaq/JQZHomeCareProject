using System.Text.RegularExpressions;
using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.Common.Interfaces;

namespace JQZHomeCareProject.Infrastructure.Maps
{
    public class LocationLinkParser : ILocationLinkParser
    {
        private readonly HttpClient _httpClient;
        private readonly IMapsService _mapsService; 
        private static readonly string[] ShortLinkHosts =
        {
            "maps.app.goo.gl", "goo.gl", "g.co", "app.goo.gl"
        };

        // --- Regex patterns ------------------------------------------------

        // geo:12.34,56.78 or geo:12.34,56.78?q=...
        private static readonly Regex GeoUriPattern = new(
            @"geo:\s*(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)",
            RegexOptions.Compiled | RegexOptions.IgnoreCase);

        // Google Maps "@lat,lng,zoom" — the map VIEWPORT center, not necessarily the pin.
        private static readonly Regex AtSignPattern = new(
            @"@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)",
            RegexOptions.Compiled);

        // Google Maps place-page precise pin coords: !3dLAT!4dLNG
        private static readonly Regex BangCoordPattern = new(
            @"!3d(-?\d{1,3}\.\d+)!4d(-?\d{1,3}\.\d+)",
            RegexOptions.Compiled);

        // ?q=lat,lng or &q=lat,lng (Google Maps AND WhatsApp shared-location links)
        private static readonly Regex QParamPattern = new(
            @"[?&]q=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)",
            RegexOptions.Compiled);

        // ?ll=lat,lng or &ll=lat,lng (Apple Maps, Google "ll" fallback)
        private static readonly Regex LlParamPattern = new(
            @"[?&]ll=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)",
            RegexOptions.Compiled);

        // Apple Maps "center=lat,lng" / "sll=lat,lng"
        private static readonly Regex CenterParamPattern = new(
            @"[?&](?:center|sll)=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)",
            RegexOptions.Compiled);

        // "Get directions" links — destination pin
        private static readonly Regex DaddrParamPattern = new(
            @"[?&]daddr=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)",
            RegexOptions.Compiled);

        private static readonly Regex DestinationParamPattern = new(
            @"[?&]destination=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)",
            RegexOptions.Compiled);

        // "Get directions" links — origin pin (last resort only)
        private static readonly Regex SaddrParamPattern = new(
            @"[?&]saddr=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)",
            RegexOptions.Compiled);

        // Plain "lat, lng" text with no URL at all
        private static readonly Regex RawPairPattern = new(
            @"^\s*(-?\d{1,3}\.\d{3,})\s*,\s*(-?\d{1,3}\.\d{3,})\s*$",
            RegexOptions.Compiled);

        // Google Maps "directions" links put the destination as a path segment:
        // .../maps/dir/Origin/31.531231,74.321724/@31.49,74.29,13z
        // Take the LAST lat,lng-shaped path segment before "/@" or end of path —
        // that's the destination, not the origin.
        private static readonly Regex DirPathCoordPattern = new(
            @"/dir/(?:[^/@]+/)*(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)(?:/@|/?(?:\?|$))",
            RegexOptions.Compiled);

        // Apple Maps links that carry only a text address, no ll=
        private static readonly Regex AppleAddressParamPattern = new(
            @"[?&]address=([^&]+)",
            RegexOptions.Compiled);

        // Google Maps search links with only a text query, no coordinates
        private static readonly Regex QueryParamPattern = new(
            @"[?&]query=([^&]+)",
            RegexOptions.Compiled);

        public LocationLinkParser(HttpClient httpClient, IMapsService mapsService)
        {
            _httpClient = httpClient;
            _mapsService = mapsService;
        }

        public async Task<(double Latitude, double Longitude, string? FormattedAddress)> ParseAsync(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                throw new ValidationException("Location link/address is required.");

            var text = input.Trim();

            // 1. Raw "lat,lng" pasted directly (no URL).
            var rawMatch = RawPairPattern.Match(text);
            if (rawMatch.Success && TryParseCoords(rawMatch, out var rawLat, out var rawLng))
                return (rawLat, rawLng, null);

            // 2. Looks like a URL — resolve short links then extract.
            if (Uri.TryCreate(text, UriKind.Absolute, out var uri) && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
            {
                var resolvedUrl = await ResolveIfShortLinkAsync(uri);

                if (TryExtractFromUrl(resolvedUrl, out var lat, out var lng))
                    return (lat, lng, null);

                // No coordinates in the link itself — see if it carries a text
                // address/query we can geocode instead (Apple `address=`, Google `query=`).
                var addressMatch = AppleAddressParamPattern.Match(resolvedUrl);
                if (!addressMatch.Success)
                    addressMatch = QueryParamPattern.Match(resolvedUrl);

                if (addressMatch.Success)
                {
                    var decodedAddress = Uri.UnescapeDataString(addressMatch.Groups[1].Value.Replace('+', ' '));
                    var (addressLat, addressLng) = await _mapsService.GeocodeAsync(decodedAddress);
                    return (addressLat, addressLng, decodedAddress);
                }

                throw new ValidationException(
                    "Could not extract a location from this link. If it's a Plus Code or a live-location share, please open it and paste the coordinates or full address directly.");
            }

            // 3. geo: URIs.
            var geoUriMatch = GeoUriPattern.Match(text);
            if (geoUriMatch.Success && TryParseCoords(geoUriMatch, out var geoUriLat, out var geoUriLng))
                return (geoUriLat, geoUriLng, null);

            // 4. Plain text address — geocode via Geoapify.
            var (geocodedLat, geocodedLng) = await _mapsService.GeocodeAsync(text);
            return (geocodedLat, geocodedLng, text);
        }

        private bool TryExtractFromUrl(string url, out double lat, out double lng)
        {
            lat = 0; lng = 0;

            // Order matters: !3d/!4d is the precise pin and should win over
            // @lat,lng (viewport center, can be meaningfully off on place links).
            // daddr/destination (explicit destination pin) also outrank the
            // viewport. saddr (origin) is last resort.
            foreach (var pattern in new[]
            {
                BangCoordPattern,
                DaddrParamPattern,
                DestinationParamPattern,
                DirPathCoordPattern,  
                QParamPattern,
                LlParamPattern,
                CenterParamPattern,
                AtSignPattern,
                SaddrParamPattern
            })
            {
                var match = pattern.Match(url);
                if (match.Success && TryParseCoords(match, out lat, out lng))
                    return true;
            }

            var geoMatch = GeoUriPattern.Match(url);
            if (geoMatch.Success && TryParseCoords(geoMatch, out lat, out lng))
                return true;

            return false;
        }

        private static bool TryParseCoords(Match match, out double lat, out double lng)
        {
            lat = 0; lng = 0;

            if (!double.TryParse(match.Groups[1].Value, System.Globalization.CultureInfo.InvariantCulture, out lat))
                return false;
            if (!double.TryParse(match.Groups[2].Value, System.Globalization.CultureInfo.InvariantCulture, out lng))
                return false;

            if (lat < -90 || lat > 90 || lng < -180 || lng > 180)
                return false;

            return true;
        }

        private async Task<string> ResolveIfShortLinkAsync(Uri uri)
        {
            var isShortLink = ShortLinkHosts.Any(h =>
                uri.Host.Equals(h, StringComparison.OrdinalIgnoreCase) ||
                uri.Host.EndsWith("." + h, StringComparison.OrdinalIgnoreCase));

            if (!isShortLink)
                return uri.ToString();

            try
            {
                using var response = await _httpClient.GetAsync(uri, HttpCompletionOption.ResponseHeadersRead);
                var finalUrl = response.RequestMessage?.RequestUri?.ToString();
                return string.IsNullOrEmpty(finalUrl) ? uri.ToString() : finalUrl;
            }
            catch (HttpRequestException)
            {
                throw new ValidationException(
                    "Could not resolve the shortened location link. Please paste the full Google Maps link instead.");
            }
        }
    }
}