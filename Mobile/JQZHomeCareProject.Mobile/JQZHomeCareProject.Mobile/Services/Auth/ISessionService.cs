using JQZHomeCareProject.Mobile.Models.Common;

namespace JQZHomeCareProject.Mobile.Services.Auth
{
    public interface ISessionService
    {
        Task SaveSessionAsync(string token, Guid userId, UserRole role, Guid? practitionerId);
        Task<bool> HasValidSessionAsync();
        Task<string?> GetTokenAsync();
        Task<Guid?> GetPractitionerIdAsync();
        Task<UserRole?> GetRoleAsync();
        Task ClearAsync();

        event Action? SessionExpired;
        void RaiseSessionExpired();
    }
}