using System.Net.Http.Json;
using JQZHomeCareProject.Mobile.Helpers;
using JQZHomeCareProject.Mobile.Models.Common;
using JQZHomeCareProject.Mobile.Models.Visits;

namespace JQZHomeCareProject.Mobile.Services.Api
{
    public class VisitsApi : IVisitsApi
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
                throw new ApiException(response.StatusCode, error?.Message ?? "Could not load visits.");
            }

            var result = await response.Content.ReadFromJsonAsync<List<VisitDto>>(AppJsonOptions.Default, cancellationToken);
            return result ?? new List<VisitDto>();
        }

        public async Task<VisitDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var response = await _http.GetAsync($"visits/{id}", cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadFromJsonAsync<ApiErrorResponse>(AppJsonOptions.Default, cancellationToken);
                throw new ApiException(response.StatusCode, error?.Message ?? "Could not load this visit.");
            }

            var result = await response.Content.ReadFromJsonAsync<VisitDto>(AppJsonOptions.Default, cancellationToken);
            return result ?? throw new ApiException(response.StatusCode, "Empty response from server.");
        }
    }
}