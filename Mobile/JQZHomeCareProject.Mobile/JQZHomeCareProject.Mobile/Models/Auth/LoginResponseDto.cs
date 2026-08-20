using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Mobile.Models.Auth
{
    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string Role {  get; set; } = string.Empty;

        /// Null for non-practitioner roles; the mobile app only ever
        /// logs in practitioners, but keep this nullable to mirror the API exactly.
        public string? PractitionerId {  get; set; }
    }
}
