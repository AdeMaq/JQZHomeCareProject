using JQZHomeCareProject.Application.DTOs.Auth;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
    }
}
