using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Mobile.Services.Navigation
{
    public class ShellNavigationService:INavigationService
    {
        public Task GoToAsync(string route) => Shell.Current.GoToAsync(route);
        public Task GoToAsync(string route, IDictionary<string, object> parameters) => Shell.Current.GoToAsync(route, parameters);
        public Task GoBackAsync() => Shell.Current.GoToAsync("..");
    }
}
