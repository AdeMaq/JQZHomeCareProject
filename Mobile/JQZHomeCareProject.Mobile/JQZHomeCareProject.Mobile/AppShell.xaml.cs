namespace JQZHomeCareProject.Mobile
{
    public partial class AppShell : Shell
    {
        public AppShell()
        {
            InitializeComponent();

            // Pushed (non-tab) routes are registered here as each page is
            // built. Login/Splash are root pages set directly as MainPage,
            // so they don't need Shell route registration.
            //
            // Phase 5/6 additions:
            // Routing.RegisterRoute("visits/detail", typeof(VisitDetailPage));
            // Routing.RegisterRoute("visits/checkin", typeof(CheckInPage));
            // Routing.RegisterRoute("visits/checkout", typeof(CheckOutPage));
            // Routing.RegisterRoute("visits/cancel", typeof(CancelVisitPage));
        }
    }
}
