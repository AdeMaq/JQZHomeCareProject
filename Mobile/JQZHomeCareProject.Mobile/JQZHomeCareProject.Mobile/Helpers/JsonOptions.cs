using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace JQZHomeCareProject.Mobile.Helpers
{
    public class JsonOptions
    {
        /// <summary>
        /// Single shared JsonSerializerOptions instance for all typed API clients.
        /// JsonStringEnumConverter is required because the backend serializes
        /// enums (VisitStatus, ReceivedBy, CollectionStatus, RefusedBy) as
        /// strings, not the .NET default of numeric indices.
        /// </summary>
        public static readonly JsonSerializerOptions Default = new()
        {
            PropertyNameCaseInsensitive = true,
            Converters = { new JsonStringEnumConverter() }
        };
    }
}
