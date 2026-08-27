using JQZHomeCareProject.Mobile.Helpers;
using JQZHomeCareProject.Mobile.Models.Common;
using JQZHomeCareProject.Mobile.Models.Visits;
using System;
using System.Collections.Generic;
using System.Net.Http.Json;
using System.Text;

namespace JQZHomeCareProject.Mobile.Services.Api
{
    public class VisitsApi:IVisitsApi
    {
        private readonly HttpClient _http;
        public VisitsApi(HttpClient http)
        {
            _http = http;
        }
        public async Task<List<VisitDto>> GetTodayAsync(Guid practitionerId, CancellationToken cancellationToken = default)
        {
            var response = await _http.GetAsync($"visits/today?practitionerId={practitionerId}", cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadFromJsonAsync<ApiErrorResponse>(AppJsonOptions.Default, cancellationToken);
                throw new ApiException(response.StatusCode, error?.Message ?? "Could not load today's visits.");
            }

            var result = await response.Content.ReadFromJsonAsync<List<VisitDto>>(AppJsonOptions.Default, cancellationToken);
            return result ?? new List<VisitDto>();
        }
        public async Task<List<VisitDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var response = await _http.GetAsync("visits", cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadFromJsonAsync<ApiErrorResponse>(AppJsonOptions.Default, cancellationToken);
                throw new ApiException(response.StatusCode, error?.Message ?? "Could not load all visits.");
            }
            var result = await response.Content.ReadFromJsonAsync<List<VisitDto>>(AppJsonOptions.Default, cancellationToken);
            return result ?? new List<VisitDto>();
        }
    }
}
