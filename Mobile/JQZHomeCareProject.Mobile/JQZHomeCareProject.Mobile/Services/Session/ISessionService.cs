using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Mobile.Services.Session
{
    public interface ISessionService
    {
        Task SaveSessionAsync(string token, string userId, string role, string? practitionerId);
        Task<string?> GetTokenAsync();
        Task<string?> GetUserIdAsync();
        Task<string?> GetRoleAsync();
        Task<string?> GetPractitionerIdAsync();

        //True if a token is present in SecureStorage
        Task<bool> IsLoggedInAsync();

        //Clears all stored session data (logout, or forced-out on 401)
        Task ClearSessionAsync();

        /// <summary>
        /// Raised by AuthHeaderHandler when a request comes back 401,
        /// so App.xaml.cs can force navigation back to Login.
        /// </summary>
        event EventHandler? SessionExpired;

        //Called by AuthHeaderHandler to fire SessionExpired
        void NotifySessionExpired();
    }
}
