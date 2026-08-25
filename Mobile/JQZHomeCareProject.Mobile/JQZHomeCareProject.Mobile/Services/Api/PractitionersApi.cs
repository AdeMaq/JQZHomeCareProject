using JQZHomeCareProject.Mobile.Helpers;
using JQZHomeCareProject.Mobile.Models.Common;
using JQZHomeCareProject.Mobile.Models.Practitioners;
using System;
using System.Collections.Generic;
using System.Net.Http.Json;
using System.Text;

namespace JQZHomeCareProject.Mobile.Services.Api
{
    public class PractitionersApi:IPractitionersApi
    {
        private readonly HttpClient _http;
        public PractitionersApi(HttpClient http)
        {
            _http = http;
        }
        public async Task<PractitionerDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var response = await _http.GetAsync($"practitioners/{id}", cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadFromJsonAsync<ApiErrorResponse>(AppJsonOptions.Default, cancellationToken);
                throw new ApiException(response.StatusCode, error?.Message ?? "Could not load practitioner profile.");
            }

            var result = await response.Content.ReadFromJsonAsync<PractitionerDto>(AppJsonOptions.Default, cancellationToken);
            return result ?? throw new ApiException(response.StatusCode, "Empty response from server.");
        }
    }
}
