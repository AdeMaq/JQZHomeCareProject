using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.Common.Interfaces
{
    public interface IApiKeyHasher
    {
        string Hash(string rawApiKey);
        bool Verify(string rawApiKey, string storedHash);
    }
}
