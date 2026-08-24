using JQZHomeCareProject.Mobile.Services.Auth;

namespace JQZHomeCareProject.Mobile.Services.Api
{
    // Registered as the HttpMessageHandler for every typed client EXCEPT IAuthApi.
    // Attaches the Bearer token and raises SessionExpired on a 401 so App.xaml.cs
    // can route back to Login.
    public class AuthHeaderHandler : DelegatingHandler
    {
        private readonly ISessionService _session;

        public AuthHeaderHandler(ISessionService session)
        {
            _session = session;
        }

        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var token = await _session.GetTokenAsync();
            if (!string.IsNullOrWhiteSpace(token))
                request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            var response = await base.SendAsync(request, cancellationToken);

            if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                _session.RaiseSessionExpired();

            return response;
        }
    }
}