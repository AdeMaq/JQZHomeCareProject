using JQZHomeCareProject.Mobile.ViewModels.Visits;

namespace JQZHomeCareProject.Mobile.Views.Visits
{
    public partial class VisitDetailPage : ContentPage
    {
        public VisitDetailPage(VisitDetailViewModel viewModel)
        {
            InitializeComponent();
            BindingContext = viewModel;
        }
    }
}