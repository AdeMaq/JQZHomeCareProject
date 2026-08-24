using System.Text.Json;
using System.Text.Json.Serialization;

namespace JQZHomeCareProject.Mobile.Helpers
{
    // Shared JSON options for every typed API client — handles enums sent
    // as strings (e.g. "role": "Practitioner") instead of numeric indexes.
    public static class AppJsonOptions
    {
        public static readonly JsonSerializerOptions Default = new(JsonSerializerDefaults.Web)
        {
            Converters = { new JsonStringEnumConverter() }
        };
    }
}