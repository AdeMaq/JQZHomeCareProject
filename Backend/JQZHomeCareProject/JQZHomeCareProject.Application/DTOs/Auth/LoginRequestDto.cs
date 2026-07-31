using JQZHomeCareProject.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;
namespace JQZHomeCareProject.Application.DTOs.Auth
{
    public class LoginRequestDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public UserRole Role { get; set; }
        public Guid? PractitionerId { get; set; }
    }
}
