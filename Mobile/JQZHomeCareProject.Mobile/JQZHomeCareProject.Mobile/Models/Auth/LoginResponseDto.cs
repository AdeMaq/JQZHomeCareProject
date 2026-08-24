using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Mobile.Models.Auth
{
    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string UserId { get; set; }= string.Empty;
        public string Role { get; set; } = string.Empty;

        // Null if the account somehow isn't linked to a practitioner —
        // LoginViewModel should treat that as an error (this app is practitioner-only).
        public string? PractitionerId { get; set; }
    }
}
