using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Mobile.Models.Common
{
    // Matches the ExceptionHandlingMiddleware output shape: { "message": "..." }
    public class ApiErrorResponse
    {
        public string Message { get; set; } = string.Empty;
    }
}
