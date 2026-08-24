namespace JQZHomeCareProject.Mobile
{
    public partial class AppShell : Shell
    {
        public AppShell()
        {
            InitializeComponent();

            Routing.RegisterRoute(nameof(Views.Home.HomePage), typeof(Views.Home.HomePage));
        }
    }
}
