using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Mobile.Models.Auth
{
    public class LoginRequestDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; }= string.Empty;
    }
}
