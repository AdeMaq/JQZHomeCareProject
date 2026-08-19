using JQZHomeCareProject.Mobile.Models.Auth;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Mobile.Services.Api
{
    public interface IAuthApi
    {
        Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
    }
}
