using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.Common.Interfaces;
using Microsoft.Extensions.Options;
using System.Net.Http.Json;
using System.Web;

namespace JQZHomeCareProject.Infrastructure.Maps
{
    public class MapsService : IMapsService
    {
        private readonly HttpClient _httpClient;
        private readonly GeoapifySettings _settings;

        public MapsService(HttpClient httpClient, IOptions<GeoapifySettings> settings)
        {
            _httpClient = httpClient;
            _settings = settings.Value;
        }

        public async Task<(double Latitude, double Longitude)> GeocodeAsync(string address)
        {
            if (string.IsNullOrWhiteSpace(address))
            {
                throw new ValidationException("Address is required to determine location.");
            }

            var encodedAddress = HttpUtility.UrlEncode(address);
            var requestUrl = $"{_settings.BaseUrl}?text={encodedAddress}&apiKey={_settings.ApiKey}&limit=1";

            var response = await _httpClient.GetAsync(requestUrl);

            if (!response.IsSuccessStatusCode)
            {
                throw new ValidationException("Unable to reach the geocoding service. Please try again.");
            }

            var result = await response.Content.ReadFromJsonAsync<GeoapifyGeocodeResponse>();

            var firstFeature = result?.Features.FirstOrDefault();

            if (firstFeature is null)
            {
                throw new ValidationException($"Could not determine coordinates for address: '{address}'.");
            }

            return (firstFeature.Properties.Lat, firstFeature.Properties.Lon);
        }
    }
}