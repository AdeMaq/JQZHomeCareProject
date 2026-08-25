using JQZHomeCareProject.Mobile.Views.Auth;
using JQZHomeCareProject.Mobile.Views.Home;
using JQZHomeCareProject.Mobile.Views.Visits;

namespace JQZHomeCareProject.Mobile
{
    public partial class AppShell : Shell
    {
        public AppShell()
        {
            InitializeComponent();

            Routing.RegisterRoute(nameof(Views.Home.HomePage), typeof(Views.Home.HomePage));
            Routing.RegisterRoute(nameof(Views.Visits.VisitsPage),typeof(Views.Visits.VisitsPage));
        }
    }
}
