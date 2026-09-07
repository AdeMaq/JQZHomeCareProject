using System.Text.RegularExpressions;
using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.Common.Interfaces;

namespace JQZHomeCareProject.Infrastructure.Maps
{
    public class LocationLinkParser : ILocationLinkParser
    {
        private readonly HttpClient _httpClient;
        private readonly IMapsService _mapsService; // your existing Geoapify wrapper

        // Domains that hand back short links needing a redirect resolve first.
        private static readonly string[] ShortLinkHosts =
        {
            "maps.app.goo.gl", "goo.gl", "g.co", "app.goo.gl"
        };

        // --- Regex patterns, tried in order ------------------------------------

        // geo:12.34,56.78 or geo:12.34,56.78?q=...
        private static readonly Regex GeoUriPattern = new(
            @"geo:\s*(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)",
            RegexOptions.Compiled | RegexOptions.IgnoreCase);

        // Google Maps "@lat,lng,zoom" — appears in /maps/@..., /maps/place/.../@...
        private static readonly Regex AtSignPattern = new(
            @"@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)",
            RegexOptions.Compiled);

        // Google Maps place-page internal coords: !3dLAT!4dLNG
        private static readonly Regex BangCoordPattern = new(
            @"!3d(-?\d{1,3}\.\d+)!4d(-?\d{1,3}\.\d+)",
            RegexOptions.Compiled);

        // ?q=lat,lng or &q=lat,lng  (Google Maps AND WhatsApp shared-location links use this)
        private static readonly Regex QParamPattern = new(
            @"[?&]q=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)",
            RegexOptions.Compiled);

        // ?ll=lat,lng or &ll=lat,lng (Apple Maps, and Google "ll" fallback)
        private static readonly Regex LlParamPattern = new(
            @"[?&]ll=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)",
            RegexOptions.Compiled);

        // Apple Maps "center=lat,lng" (rare variant) and "sll=lat,lng"
        private static readonly Regex CenterParamPattern = new(
            @"[?&](?:center|sll)=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)",
            RegexOptions.Compiled);

        // Plain "lat, lng" text with no URL at all — e.g. pasted from WhatsApp
        // live-location caption "12.9716, 77.5946" or "12.9716,77.5946"
        private static readonly Regex RawPairPattern = new(
            @"^\s*(-?\d{1,3}\.\d{3,})\s*,\s*(-?\d{1,3}\.\d{3,})\s*$",
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

            // 1. Raw "lat,lng" pasted directly (no URL) — cheapest check, do first.
            var rawMatch = RawPairPattern.Match(text);
            if (rawMatch.Success && TryParseCoords(rawMatch, out var rawLat, out var rawLng))
                return (rawLat, rawLng, null);

            // 2. If it looks like a URL, resolve short links then run regex passes on it.
            if (Uri.TryCreate(text, UriKind.Absolute, out var uri) &&
                (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
            {
                var resolvedUrl = await ResolveIfShortLinkAsync(uri);

                if (TryExtractFromUrl(resolvedUrl, out var lat, out var lng))
                    return (lat, lng, null);

                // It was a URL but we couldn't find coordinates in it
                // (e.g. a plain place-name Google Maps search link with no lat/lng).
                // Fall through to geocoding as a last resort using the URL's text params if present,
                // otherwise fail clearly rather than silently geocoding a URL string.
                throw new ValidationException(
                    "Could not extract coordinates from this link. Please paste a Google Maps / WhatsApp / Apple Maps location link that includes coordinates, or the plain address instead.");
            }

            // 3. geo: URIs aren't parsed by Uri.TryCreate as http(s), handle separately.
            var geoMatch = GeoUriPattern.Match(text);
            if (geoMatch.Success && TryParseCoords(geoMatch, out var geoLat, out var geoLng))
                return (geoLat, geoLng, null);

            // 4. Not a link at all — treat as a plain address and geocode via Geoapify.
            var (geocodedLat, geocodedLng) = await _mapsService.GeocodeAsync(text);
            return (geocodedLat, geocodedLng, text);
        }

        private bool TryExtractFromUrl(string url, out double lat, out double lng)
        {
            lat = 0; lng = 0;

            foreach (var pattern in new[] { AtSignPattern, BangCoordPattern, QParamPattern, LlParamPattern, CenterParamPattern })
            {
                var match = pattern.Match(url);
                if (match.Success && TryParseCoords(match, out lat, out lng))
                    return true;
            }

            // geo: can also appear embedded inside some app-share URLs
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

            // Sanity-check ranges so a mis-fired regex (e.g. matching zoom level as lng) doesn't slip through.
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
                // HttpClient here must be configured with an HttpClientHandler that has
                // AllowAutoRedirect = true (default) so we land on the final expanded URL.
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