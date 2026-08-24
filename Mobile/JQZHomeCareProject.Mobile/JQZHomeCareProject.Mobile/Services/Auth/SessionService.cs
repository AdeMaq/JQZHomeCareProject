using JQZHomeCareProject.Mobile.Models.Common;

namespace JQZHomeCareProject.Mobile.Services.Auth
{
    public class SessionService : ISessionService
    {
        private const string TokenKey = "auth_token";
        private const string UserIdKey = "auth_user_id";
        private const string RoleKey = "auth_role";
        private const string PractitionerIdKey = "auth_practitioner_id";

        public event Action? SessionExpired;

        public async Task SaveSessionAsync(string token, Guid userId, UserRole role, Guid? practitionerId)
        {
            await SecureStorage.Default.SetAsync(TokenKey, token);
            await SecureStorage.Default.SetAsync(UserIdKey, userId.ToString());
            await SecureStorage.Default.SetAsync(RoleKey, role.ToString());

            if (practitionerId.HasValue)
                await SecureStorage.Default.SetAsync(PractitionerIdKey, practitionerId.Value.ToString());
        }

        public async Task<bool> HasValidSessionAsync()
        {
            // Splash only confirms a token is present; actual expiry is
            // discovered on the first 401 from the backend, via SessionExpired.
            var token = await GetTokenAsync();
            return !string.IsNullOrWhiteSpace(token);
        }

        public Task<string?> GetTokenAsync()
            => SecureStorage.Default.GetAsync(TokenKey);

        public async Task<Guid?> GetPractitionerIdAsync()
        {
            var raw = await SecureStorage.Default.GetAsync(PractitionerIdKey);
            return Guid.TryParse(raw, out var id) ? id : null;
        }

        public async Task<UserRole?> GetRoleAsync()
        {
            var raw = await SecureStorage.Default.GetAsync(RoleKey);
            return Enum.TryParse<UserRole>(raw, out var role) ? role : null;
        }

        public Task ClearAsync()
        {
            SecureStorage.Default.RemoveAll();
            return Task.CompletedTask;
        }

        public void RaiseSessionExpired() => SessionExpired?.Invoke();
    }
}