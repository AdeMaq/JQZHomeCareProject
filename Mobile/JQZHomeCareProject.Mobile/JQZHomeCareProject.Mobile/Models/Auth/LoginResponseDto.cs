using JQZHomeCareProject.Mobile.Models.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Mobile.Models.Auth
{
    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public UserRole Role { get; set; }

        // Null for non-practitioner accounts; the mobile app only ever
        // expects Practitioner logins, but keep it nullable to match the API.
        public Guid? PractitionerId { get; set; }
    }
}
