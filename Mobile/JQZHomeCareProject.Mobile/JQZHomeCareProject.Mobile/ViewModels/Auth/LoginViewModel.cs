using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using JQZHomeCareProject.Mobile.Models.Auth;
using JQZHomeCareProject.Mobile.Models.Common;
using JQZHomeCareProject.Mobile.Services.Api;
using JQZHomeCareProject.Mobile.Services.Auth;
using JQZHomeCareProject.Mobile.Services.Navigation;
using JQZHomeCareProject.Mobile.ViewModels.Base;

namespace JQZHomeCareProject.Mobile.ViewModels.Auth
{
    public partial class LoginViewModel : BaseViewModel
    {
        private readonly IAuthApi _authApi;
        private readonly ISessionService _session;
        private readonly INavigationService _navigation;

        [ObservableProperty] private string email = string.Empty;
        [ObservableProperty] private string password = string.Empty;
        [ObservableProperty] private bool isPasswordHidden = true;

        public LoginViewModel(IAuthApi authApi, ISessionService session, INavigationService navigation)
        {
            _authApi = authApi;
            _session = session;
            _navigation = navigation;
            Title = "Log In";
        }

        [RelayCommand]
        private void TogglePasswordVisibility() => IsPasswordHidden = !IsPasswordHidden;

        [RelayCommand]
        private async Task LoginAsync()
        {
            if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Password))
            {
                ErrorMessage = "Please enter both email and password.";
                return;
            }

            await RunSafelyAsync(async () =>
            {
                var result = await _authApi.LoginAsync(new LoginRequestDto
                {
                    Email = Email.Trim(),
                    Password = Password
                });

                if (result.Role != UserRole.Practitioner || result.PractitionerId is null)
                {
                    ErrorMessage = "This account is not a practitioner account.";
                    return;
                }

                await _session.SaveSessionAsync(result.Token, result.UserId, result.Role, result.PractitionerId);
                Password = string.Empty;

                await _navigation.GoToAppShellAsync();
            });
        }
    }
}