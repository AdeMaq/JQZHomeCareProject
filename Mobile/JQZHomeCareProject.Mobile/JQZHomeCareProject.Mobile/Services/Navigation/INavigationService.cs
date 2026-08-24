using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Mobile.Services.Navigation
{
    public interface INavigationService
    {
        Task GoToLoginAsync();
        Task GoToAppShellAsync();
        Task GoToAsync(string route);
        Task GoToAsync(string route, IDictionary<string, object> parameters);
        Task GoBackAsync();
    }
}
