using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using JQZHomeCareProject.Mobile.Helpers;
using JQZHomeCareProject.Mobile.Models.Auth;
using JQZHomeCareProject.Mobile.Services.Api;
using JQZHomeCareProject.Mobile.Services.Session;
using JQZHomeCareProject.Mobile.ViewModels.Base;

namespace JQZHomeCareProject.Mobile.ViewModels.Auth;

public partial class LoginViewModel : BaseViewModel
{
    private readonly IAuthApi _authApi;
    private readonly ISessionService _sessionService;

    private const string PractitionerRole = "Practitioner";

    public LoginViewModel(IAuthApi authApi, ISessionService sessionService)
    {
        _authApi = authApi;
        _sessionService = sessionService;
        Title = "Log In";
    }

    [ObservableProperty]
    private string email = string.Empty;

    [ObservableProperty]
    private string password = string.Empty;

    [ObservableProperty]
    private bool isPasswordHidden = true;

    [RelayCommand]
    private void ToggleShowPassword()
    {
        IsPasswordHidden = !IsPasswordHidden;
    }

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
            var response = await _authApi.LoginAsync(new LoginRequestDto
            {
                Email = Email.Trim(),
                Password = Password
            });

            if (!string.Equals(response.Role, PractitionerRole, StringComparison.OrdinalIgnoreCase))
            {
                ErrorMessage = "This app is for practitioners only.";
                return;
            }

            await _sessionService.SaveSessionAsync(
                response.Token, response.UserId, response.Role, response.PractitionerId);

            // TODO Phase 7: register device token for push notifications
            // once IDeviceTokenApi and the payload contract (Section 12,
            // Open Item #7) are confirmed and built.
            // await _deviceTokenApi.RegisterAsync(new RegisterDeviceTokenDto { ... });

            Password = string.Empty;
            await Shell.Current.GoToAsync("//home");
        });
    }
}