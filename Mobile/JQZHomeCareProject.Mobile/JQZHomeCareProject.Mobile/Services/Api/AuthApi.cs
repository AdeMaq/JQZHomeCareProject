using System.Net.Http.Json;
using JQZHomeCareProject.Mobile.Helpers;
using JQZHomeCareProject.Mobile.Models.Auth;
using JQZHomeCareProject.Mobile.Models.Common;

namespace JQZHomeCareProject.Mobile.Services.Api
{
    public class AuthApi : IAuthApi
    {
        private readonly HttpClient _http;

        public AuthApi(HttpClient http)
        {
            _http = http; // BaseAddress set at registration in MauiProgram.cs
        }

        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
        {
            var response = await _http.PostAsJsonAsync("auth/login", request, AppJsonOptions.Default, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadFromJsonAsync<ApiErrorResponse>(AppJsonOptions.Default, cancellationToken);
                throw new ApiException(response.StatusCode, error?.Message ?? "Login failed. Please check your credentials.");
            }

            var result = await response.Content.ReadFromJsonAsync<LoginResponseDto>(AppJsonOptions.Default, cancellationToken);
            return result ?? throw new ApiException(response.StatusCode, "Empty response from server.");
        }
    }
}