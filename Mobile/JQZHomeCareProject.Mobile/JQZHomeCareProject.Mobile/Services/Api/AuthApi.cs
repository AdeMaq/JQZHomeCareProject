using System.Net.Http.Json;
using System.Text.Json;
using JQZHomeCareProject.Mobile.Helpers;
using JQZHomeCareProject.Mobile.Models.Auth;
using JQZHomeCareProject.Mobile.Models.Common;

namespace JQZHomeCareProject.Mobile.Services.Api
{
    public class AuthApi : IAuthApi
    {
        private readonly HttpClient _http;

        // Web defaults = camelCase-aware + case-insensitive matching,
        // consistent with ASP.NET Core's default output. Use these options
        // in every typed API client we add later (Visits, Practitioners, etc.).
        private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

        public AuthApi(HttpClient http)
        {
            _http = http; // BaseAddress + Timeout set at registration in MauiProgram.cs
        }

        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
        {
            var response = await _http.PostAsJsonAsync("auth/login", request, JsonOptions);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadFromJsonAsync<ApiErrorResponse>(JsonOptions);
                throw new ApiException(response.StatusCode, error?.Message ?? "Login failed.");
            }

            var result = await response.Content.ReadFromJsonAsync<LoginResponseDto>(JsonOptions);
            return result ?? throw new ApiException(response.StatusCode, "Empty response from server.");
        }
    }
}