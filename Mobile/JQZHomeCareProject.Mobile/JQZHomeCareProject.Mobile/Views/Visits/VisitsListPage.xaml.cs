using JQZHomeCareProject.Mobile.ViewModels.Visits;
namespace JQZHomeCareProject.Mobile.Views.Visits;

public partial class VisitsListPage : ContentPage
{
	private readonly VisitsListViewModel _viewModel;
    public VisitsListPage(VisitsListViewModel viewModel)
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
    }
}