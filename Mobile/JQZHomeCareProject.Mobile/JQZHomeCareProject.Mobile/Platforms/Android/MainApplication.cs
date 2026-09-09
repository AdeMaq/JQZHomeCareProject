using Android.App;
using Android.Runtime;
using JQZHomeCareProject.Mobile.Helpers;

namespace JQZHomeCareProject.Mobile
{
    [Application]
    public class MainApplication : MauiApplication
    {
        [Obsolete]
        public MainApplication(IntPtr handle, JniHandleOwnership ownership)
            : base(handle, ownership)
        {
            AndroidEnvironment.UnhandledExceptionRaiser += (sender, args) =>
            {
                CrashLogger.Log(args.Exception);
                args.Handled = true;
            };
        }

        protected override MauiApp CreateMauiApp() => MauiProgram.CreateMauiApp();
    }
}