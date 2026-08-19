using System.Net.Http.Headers;
using JQZHomeCareProject.Mobile.Services.Session;

namespace JQZHomeCareProject.Mobile.Services.Api
{
    /// <summary>
    /// Attached as the primary HttpMessageHandler for every typed client
    /// except IAuthApi (login has no token yet to attach). Reads the JWT
    /// from ISessionService and attaches it as a Bearer header; on a 401
    /// response, notifies ISessionService so App.xaml.cs can force
    /// navigation back to Login.
    /// </summary>
    public class AuthHeaderHandler : DelegatingHandler
    {
        private readonly ISessionService _sessionService;

        public AuthHeaderHandler(ISessionService sessionService)
        {
            _sessionService = sessionService;
        }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var token = await _sessionService.GetTokenAsync();

            if (!string.IsNullOrEmpty(token))
            {
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            }

            var response = await base.SendAsync(request, cancellationToken);

            if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
            {
                _sessionService.NotifySessionExpired();
            }

            return response;
        }
    }
}

