namespace JQZHomeCareProject.Mobile.Services.Auth
{
    public interface ISessionService
    {
        Task SaveSessionAsync(string token, string userId, string role, string? practitionerId);
        Task<bool> HasValidSessionAsync();
        Task<string?> GetTokenAsync();
        Task<string?> GetPractitionerIdAsync();
        Task ClearAsync();

        event Action? SessionExpired;
        void RaiseSessionExpired();
    }
}