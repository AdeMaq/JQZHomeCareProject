using JQZHomeCareProject.Mobile.ViewModels.Auth;

namespace JQZHomeCareProject.Mobile.Views;

public partial class LoginPage : ContentPage
{
    public LoginPage(LoginViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}