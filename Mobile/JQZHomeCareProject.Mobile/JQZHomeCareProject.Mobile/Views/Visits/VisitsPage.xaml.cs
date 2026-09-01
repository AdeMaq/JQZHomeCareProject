using JQZHomeCareProject.Mobile.ViewModels.Visits;

namespace JQZHomeCareProject.Mobile.Views.Visits;

public partial class VisitsPage : ContentPage
{
	private readonly VisitsViewModel _viewModel;
    public VisitsPage(VisitsViewModel viewModel)
	{
		InitializeComponent();
		_viewModel = viewModel;
		BindingContext = _viewModel;
	}
	protected override async void OnAppearing()
    {
        base.OnAppearing();
        if(_viewModel.LoadCommand.CanExecute(null))
				_viewModel.LoadCommand.Execute(null);

        _viewModel.StartOverdueTimer();
    }
    protected override void OnDisappearing()
    {
        base.OnDisappearing();
        _viewModel.StopOverdueTimer();
    }
}