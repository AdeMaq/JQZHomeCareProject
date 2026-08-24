using JQZHomeCareProject.Mobile.Models.Auth;

namespace JQZHomeCareProject.Mobile.Services.Api
{
    public interface IAuthApi
    {
        Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
    }
}