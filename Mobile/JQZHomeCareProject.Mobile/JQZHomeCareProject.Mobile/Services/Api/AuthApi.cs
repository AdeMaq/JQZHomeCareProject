using JQZHomeCareProject.Mobile.Helpers;
using JQZHomeCareProject.Mobile.Models.Auth;
using JQZHomeCareProject.Mobile.Models.Common;
using System;
using System.Collections.Generic;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace JQZHomeCareProject.Mobile.Services.Api
{
    public class AuthApi: IAuthApi
    {
        private readonly HttpClient _httpClient;

        public AuthApi(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }
        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
        {
            var response = await _httpClient.PostAsJsonAsync("api/auth/login", request, JsonOptions.Default);

            if (!response.IsSuccessStatusCode)
            {
                throw await BuildApiExceptionAsync(response);
            }

            var result = await response.Content.ReadFromJsonAsync<LoginResponseDto>(JsonOptions.Default);

            return result
                ?? throw new ApiException("Login succeeded but the response could not be read.");
        }
        private static async Task<ApiException> BuildApiExceptionAsync(HttpResponseMessage response)
        {
            try
            {
                var error = await response.Content.ReadFromJsonAsync<ApiErrorResponse>(JsonOptions.Default);

                if (error is not null && !string.IsNullOrWhiteSpace(error.Message))
                {
                    return new ApiException(error.Message, (int)response.StatusCode);
                }
            }
            catch (JsonException)
            {
                // Body wasn't the expected { message } shape — fall through to generic message.
            }

            return new ApiException($"Request failed with status {(int)response.StatusCode}.",(int)response.StatusCode);
        }
    }
}
