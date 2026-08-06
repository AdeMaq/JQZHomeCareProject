using JQZHomeCareProject.Application.Common.Exceptions;

namespace JQZHomeCareProject.Application.Common.Validation
{
    public static class NameValidator
    {
        public static string NormalizeRequired(string? rawValue, string fieldLabel, int maxLength = 100)
        {
            var trimmed = rawValue?.Trim() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(trimmed))
                throw new ValidationException($"{fieldLabel} is required.");

            if (trimmed.Length > maxLength)
                throw new ValidationException($"{fieldLabel} cannot exceed {maxLength} characters.");

            return trimmed;
        }
        public static string? NormalizeOptional(string? rawValue, string fieldLabel, int maxLength)
        {
            if (rawValue is null) return null;

            var trimmed = rawValue.Trim();

            if (trimmed.Length > maxLength)
                throw new ValidationException($"{fieldLabel} cannot exceed {maxLength} characters.");

            return trimmed.Length == 0 ? null : trimmed;
        }
        public static void EnsureUnique<T>(
            IEnumerable<T> existing,
            Func<T, string> nameSelector,
            Func<T, Guid> idSelector,
            string candidateName,
            Guid? excludeId,
            string entityLabel)
        {
            var clash = existing.Any(e =>
                (excludeId is null || idSelector(e) != excludeId.Value) &&
                string.Equals(nameSelector(e), candidateName, StringComparison.OrdinalIgnoreCase));

            if (clash)
                throw new ValidationException($"A {entityLabel} named '{candidateName}' already exists.");
        }
    }
}