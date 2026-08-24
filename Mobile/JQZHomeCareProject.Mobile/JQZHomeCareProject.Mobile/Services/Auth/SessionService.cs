namespace JQZHomeCareProject.Mobile.Services.Auth
{
    public class SessionService : ISessionService
    {
        private const string TokenKey = "auth_token";
        private const string UserIdKey = "auth_user_id";
        private const string RoleKey = "auth_role";
        private const string PractitionerIdKey = "auth_practitioner_id";

        public event Action? SessionExpired;

        public async Task SaveSessionAsync(string token, string userId, string role, string? practitionerId)
        {
            await SecureStorage.Default.SetAsync(TokenKey, token);
            await SecureStorage.Default.SetAsync(UserIdKey, userId);
            await SecureStorage.Default.SetAsync(RoleKey, role);

            if (!string.IsNullOrWhiteSpace(practitionerId))
                await SecureStorage.Default.SetAsync(PractitionerIdKey, practitionerId);
        }

        public async Task<bool> HasValidSessionAsync()
        {
            var token = await GetTokenAsync();
            return !string.IsNullOrWhiteSpace(token);
        }

        public Task<string?> GetTokenAsync()
            => SecureStorage.Default.GetAsync(TokenKey);

        public Task<string?> GetPractitionerIdAsync()
            => SecureStorage.Default.GetAsync(PractitionerIdKey);

        public Task ClearAsync()
        {
            SecureStorage.Default.RemoveAll();
            return Task.CompletedTask;
        }

        public void RaiseSessionExpired() => SessionExpired?.Invoke();
    }
}