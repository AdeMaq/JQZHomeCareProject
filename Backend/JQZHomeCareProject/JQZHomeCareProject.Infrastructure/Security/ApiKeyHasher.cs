using JQZHomeCareProject.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

namespace JQZHomeCareProject.Infrastructure.Security
{
    public class ApiKeyHasher : IApiKeyHasher
    {
        private readonly byte[]? _pepper;

        public ApiKeyHasher(IConfiguration config)
        {
            var pepper = config["ApiKeys:Pepper"];
            if (string.IsNullOrEmpty(pepper))
            {
                throw new InvalidOperationException("ApiKeys:Pepper is not configured.");
            }
            _pepper = Encoding.UTF8.GetBytes(pepper);
        }
        public string Hash(string rawApiKey)
        {
            if (_pepper == null)
            {
                throw new InvalidOperationException("Pepper is not configured.");
            }
            using var hmac = new HMACSHA256(_pepper);
            var bytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawApiKey));
            return Convert.ToHexString(bytes);

        }
        public bool Verify(string rawApiKey, string storedHash)
        {
            var computed = Hash(rawApiKey);
            return CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(computed),
                Encoding.UTF8.GetBytes(storedHash));
        }
    }
}
