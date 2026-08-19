using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Mobile.Services.Session
{
    public class SessionService: ISessionService
    {
        private const string TokenKey = "auth_token";
        private const string UserIdKey = "user_id";
        private const string RoleKey = "role";
        private const string PractitionerIdKey = "practitioner_id";

        public event EventHandler? SessionExpired;

        public async Task SaveSessionAsync(string token, string userId, string role, string? practitionerId)
        {
            SecureStorage.Default.Remove(TokenKey);
            SecureStorage.Default.Remove(UserIdKey);
            SecureStorage.Default.Remove(RoleKey);
            SecureStorage.Default.Remove(PractitionerIdKey);

            await SecureStorage.Default.SetAsync(TokenKey, token);
            await SecureStorage.Default.SetAsync(UserIdKey, userId);
            await SecureStorage.Default.SetAsync(RoleKey, role);

            if (!string.IsNullOrEmpty(practitionerId))
            {
                await SecureStorage.Default.SetAsync(PractitionerIdKey, practitionerId);
            }
        }

        public Task<string?> GetTokenAsync() => SecureStorage.Default.GetAsync(TokenKey);

        public Task<string?> GetUserIdAsync() => SecureStorage.Default.GetAsync(UserIdKey);

        public Task<string?> GetRoleAsync() => SecureStorage.Default.GetAsync(RoleKey);

        public Task<string?> GetPractitionerIdAsync() => SecureStorage.Default.GetAsync(PractitionerIdKey);

        public async Task<bool> IsLoggedInAsync()
        {
            var token = await GetTokenAsync();
            return !string.IsNullOrEmpty(token);
        }

        public Task ClearSessionAsync()
        {
            SecureStorage.Default.RemoveAll();
            return Task.CompletedTask;
        }

        public void NotifySessionExpired()
        {
            SessionExpired?.Invoke(this, EventArgs.Empty);
        }
    }
}
