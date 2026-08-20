using CommunityToolkit.Mvvm.Input;
using JQZHomeCareProject.Mobile.Services.Session;
using JQZHomeCareProject.Mobile.ViewModels.Base;

namespace JQZHomeCareProject.Mobile.ViewModels.Auth;

public partial class SplashViewModel : BaseViewModel
{
    private readonly ISessionService _sessionService;

    public SplashViewModel(ISessionService sessionService)
    {
        _sessionService = sessionService;
    }

    [RelayCommand]
    private async Task AppearingAsync()
    {
        await RunSafelyAsync(async () =>
        {
            var isLoggedIn = await _sessionService.IsLoggedInAsync();

            if (isLoggedIn)
            {
                await Shell.Current.GoToAsync("//home");
            }
            else
            {
                await Shell.Current.GoToAsync("//login");
            }
        });
    }
}