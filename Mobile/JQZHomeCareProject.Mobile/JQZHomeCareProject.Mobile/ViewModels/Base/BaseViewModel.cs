using CommunityToolkit.Mvvm.ComponentModel;
using JQZHomeCareProject.Mobile.Helpers;

namespace JQZHomeCareProject.Mobile.ViewModels.Base;

public abstract partial class BaseViewModel : ObservableObject
{
    [ObservableProperty]
    private bool isBusy;

    [ObservableProperty]
    private bool isRefreshing;

    [ObservableProperty]
    private string title = string.Empty;

    [ObservableProperty]
    private string? errorMessage;

    /// <summary>
    /// Runs an async action with standard busy/error handling so
    /// individual ViewModels don't repeat this boilerplate.
    /// Guards against re-entrancy (e.g. double-tap on a command)
    /// by short-circuiting if IsBusy is already true.
    /// </summary>
    protected async Task RunSafelyAsync(Func<Task> action)
    {
        if (IsBusy) return;

        try
        {
            IsBusy = true;
            ErrorMessage = null;
            await action();
        }
        catch (ApiException ex)
        {
            // Maps the backend's { message } error payload directly
            // to something the UI can bind to and show.
            ErrorMessage = ex.Message;
        }
        catch (Exception)
        {
            ErrorMessage = "Something went wrong. Please try again.";
        }
        finally
        {
            IsBusy = false;
            IsRefreshing = false;
        }
    }
}