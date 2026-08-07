using JQZHomeCareProject.Application.Common.Exceptions;
using System.Text.RegularExpressions;

namespace JQZHomeCareProject.Application.Common.Validation
{
    public static class Guard
    {
        public static void EnsureNotEmpty(Guid value, string fieldLabel)
        {
            if (value == Guid.Empty)
                throw new ValidationException($"{fieldLabel} is required.");
        }

        public static void EnsureInRange(int value, int min, int max, string fieldLabel)
        {
            if (value < min || value > max)
                throw new ValidationException($"{fieldLabel} must be between {min} and {max}.");
        }

        public static void EnsurePositive(int value, string fieldLabel)
        {
            if (value <= 0)
                throw new ValidationException($"{fieldLabel} must be greater than 0.");
        }

        public static void EnsurePositive(decimal value, string fieldLabel)
        {
            if (value <= 0)
                throw new ValidationException($"{fieldLabel} must be greater than 0.");
        }
        public static string NormalizePhone(string? rawPhone, string fieldLabel = "Phone")
        {
            var trimmed = rawPhone?.Trim() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(trimmed))
                throw new ValidationException($"{fieldLabel} is required.");

            var compact = Regex.Replace(trimmed, @"[\s\-]", "");

            string normalized;

            if (Regex.IsMatch(compact, @"^03\d{9}$"))
            {
                normalized = "+92" + compact.Substring(1);
            }
            else if (Regex.IsMatch(compact, @"^\+923\d{9}$"))
            {
                normalized = compact;
            }
            else if (Regex.IsMatch(compact, @"^923\d{9}$"))
            {
                normalized = "+" + compact;
            }
            else
            {
                throw new ValidationException(
                    $"{fieldLabel} must be a valid Pakistani mobile number (e.g. 03001234567 or +923001234567).");
            }

            return normalized;
        }

        public static void EnsureInRange(decimal value, decimal min, decimal max, string fieldLabel)
        {
            if (value < min || value > max)
                throw new ValidationException($"{fieldLabel} must be between {min} and {max}.");
        }

        public static void EnsureValidEmail(string? rawEmail, string fieldLabel = "Email")
        {
            if (string.IsNullOrWhiteSpace(rawEmail))
                throw new ValidationException($"{fieldLabel} is required.");

            if (!Regex.IsMatch(rawEmail.Trim(), @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                throw new ValidationException($"{fieldLabel} format is invalid.");
        }
        public static void EnsureValidCoordinates(double latitude, double longitude)
        {
            if (latitude < -90 || latitude > 90)
                throw new ValidationException("Latitude must be between -90 and 180.");
            if (longitude < -180 || longitude > 180)
                throw new ValidationException("Longitude must be between -180 and 180.");

            if (latitude == 0 && longitude == 0)
                throw new ValidationException("Unable to determine your location — GPS reading was invalid. Please try again.");
        }

        public static void EnsureSlotOrder(TimeSpan start, TimeSpan end, string fieldLabel = "Time slot")
        {
            if (start >= end)
                throw new ValidationException($"{fieldLabel} start time must be before end time.");
            if (start < TimeSpan.Zero || end > TimeSpan.FromHours(24))
                throw new ValidationException($"{fieldLabel} must fall within a single day.");
        }
    }
}