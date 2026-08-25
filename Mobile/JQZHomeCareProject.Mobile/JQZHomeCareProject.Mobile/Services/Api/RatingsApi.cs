using JQZHomeCareProject.Mobile.Helpers;
using JQZHomeCareProject.Mobile.Models.Common;
using JQZHomeCareProject.Mobile.Models.Ratings;
using System;
using System.Collections.Generic;
using System.Net.Http.Json;
using System.Text;

namespace JQZHomeCareProject.Mobile.Services.Api
{
    public class RatingsApi:IRatingsApi
    {
        private readonly HttpClient _http;
        public RatingsApi(HttpClient http)
        {
            _http = http;
        }
        public async Task<List<RatingDto>> GetByPractitionerAsync(Guid practitionerId, CancellationToken cancellationToken = default)
        {
            var response = await _http.GetAsync($"ratings/practitioner/{practitionerId}", cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadFromJsonAsync<ApiErrorResponse>(AppJsonOptions.Default, cancellationToken);
                throw new ApiException(response.StatusCode, error?.Message ?? "Could not load ratings.");
            }

            var result = await response.Content.ReadFromJsonAsync<List<RatingDto>>(AppJsonOptions.Default, cancellationToken);
            return result ?? new List<RatingDto>();
        }
    }
}
