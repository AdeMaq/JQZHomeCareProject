using JQZHomeCareProject.Mobile.ViewModels.Home;

namespace JQZHomeCareProject.Mobile.Views.Home;

public partial class HomePage : ContentPage
{
	private readonly HomeViewModel _viewModel;
	public HomePage(HomeViewModel viewModel)
	{
		InitializeComponent();
		_viewModel = viewModel;
		BindingContext = _viewModel;
	}
    protected override void OnAppearing()
    {
        base.OnAppearing();
		if(_viewModel.LoadCommand.CanExecute(null))
			_viewModel.LoadCommand.Execute(null);
    }
}