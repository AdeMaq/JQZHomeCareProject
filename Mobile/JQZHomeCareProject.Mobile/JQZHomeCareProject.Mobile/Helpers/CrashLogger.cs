namespace JQZHomeCareProject.Mobile.Helpers
{
    public static class CrashLogger
    {
        private static readonly string LogPath =
            Path.Combine(FileSystem.AppDataDirectory, "last_crash.txt");

        [Obsolete]
        public static void Log(Exception ex)
        {
            try
            {
                File.WriteAllText(LogPath, ex.ToString());
            }
            catch
            {
                // Ignore — if we can't write to disk, the alert below is the fallback.
            }

            try
            {
                MainThread.BeginInvokeOnMainThread(async () =>
                {
                    if (Application.Current?.Windows.Count > 0)
                    {
                        await Application.Current.Windows[0].Page!.DisplayAlert(
                            "Unhandled Exception",
                            ex.ToString(),
                            "OK");
                    }
                });
            }
            catch
            {
                // Alert itself failing shouldn't crash the crash handler.
            }
        }

        // Call this manually after a crash to re-read the last saved exception,
        // e.g. from a debug-only button, without needing logcat at all.
        public static string ReadLastCrash()
            => File.Exists(LogPath) ? File.ReadAllText(LogPath) : "(no crash log found)";
    }
}