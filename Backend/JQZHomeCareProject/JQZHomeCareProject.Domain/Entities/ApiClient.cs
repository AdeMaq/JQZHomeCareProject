using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Domain.Entities
{
    public class ApiClient
    {
        public Guid Id { get; set; }
        public string ClientName { get; set; } = default!;      
        public string ApiKeyHash { get; set; } = default!;       
        public string ApiKeyPrefix { get; set; } = default!;     
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public DateTime? RevokedAt { get; set; }
        public DateTime? LastUsedAt { get; set; }
        public string[] AllowedScopes { get; set; } = Array.Empty<string>(); 
    }
}
