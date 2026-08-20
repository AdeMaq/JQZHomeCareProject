using JQZHomeCareProject.Mobile.ViewModels.Auth;

namespace JQZHomeCareProject.Mobile.Views;

public partial class SplashPage : ContentPage
{
    public SplashPage(SplashViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}