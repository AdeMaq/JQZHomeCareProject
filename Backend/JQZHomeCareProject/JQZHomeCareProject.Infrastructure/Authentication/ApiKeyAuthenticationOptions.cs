using Microsoft.AspNetCore.Authentication;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Infrastructure.Authentication
{
    public class ApiKeyAuthenticationOptions: AuthenticationSchemeOptions
    {
        public const string SchemeName = "ApiKey";
        public const string HeaderName = "X-API-KEY";
    }
}
