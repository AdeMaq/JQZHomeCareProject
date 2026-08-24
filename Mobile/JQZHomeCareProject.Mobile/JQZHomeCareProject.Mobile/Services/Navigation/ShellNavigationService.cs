using JQZHomeCareProject.Mobile.Views.Auth;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Mobile.Services.Navigation
{
    public class ShellNavigationService : INavigationService
    {
        private readonly IServiceProvider _services;

        public ShellNavigationService(IServiceProvider services)
        {
            _services = services;
        }

        public Task GoToLoginAsync()
        {
            var login = _services.GetRequiredService<LoginPage>();
            Application.Current!.Windows[0].Page = new NavigationPage(login)
            {
                BarBackgroundColor = Colors.Transparent
            };
            return Task.CompletedTask;
        }

        public Task GoToAppShellAsync()
        {
            var shell = _services.GetRequiredService<AppShell>();
            Application.Current!.Windows[0].Page = shell;
            return Task.CompletedTask;
        }

        public Task GoToAsync(string route) => Shell.Current.GoToAsync(route);

        public Task GoToAsync(string route, IDictionary<string, object> parameters)
            => Shell.Current.GoToAsync(route, parameters);

        public Task GoBackAsync() => Shell.Current.GoToAsync("..");
    }
}
