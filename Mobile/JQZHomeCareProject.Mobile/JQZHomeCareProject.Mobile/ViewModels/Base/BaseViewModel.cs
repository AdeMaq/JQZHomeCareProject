using CommunityToolkit.Mvvm.ComponentModel;
using JQZHomeCareProject.Mobile.Helpers;

namespace JQZHomeCareProject.Mobile.ViewModels.Base
{
    public abstract partial class BaseViewModel : ObservableObject
    {
        [ObservableProperty] private bool isBusy;
        [ObservableProperty] private bool isRefreshing;
        [ObservableProperty] private string title = string.Empty;
        [ObservableProperty] private string? errorMessage;

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
                ErrorMessage = ex.Message;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[LOGIN ERROR] {ex.GetType().Name}: {ex.Message}");
                System.Diagnostics.Debug.WriteLine(ex.StackTrace);
                ErrorMessage = ex.Message; // TEMP — revert to the generic message once fixed
            }
            finally
            {
                IsBusy = false;
                IsRefreshing = false;
            }
        }
    }
}