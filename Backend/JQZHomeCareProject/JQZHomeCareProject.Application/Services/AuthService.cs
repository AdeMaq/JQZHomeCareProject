using JQZHomeCareProject.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.DTOs.Auth;

namespace JQZHomeCareProject.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;

        public AuthService(IUserRepository userRepository,IPasswordHasher passwordHasher,IJwtTokenGenerator jwtTokenGenerator)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _jwtTokenGenerator = jwtTokenGenerator;
        }

        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email);

            if (user is null)
            {
                throw new AuthenticationException("Invalid email or password.");
            }

            var passwordValid = _passwordHasher.Verify(request.Password, user.PasswordHash);

            if (!passwordValid)
            {
                throw new AuthenticationException("Invalid email or password.");
            }

            var token = _jwtTokenGenerator.GenerateToken(user);

            return new LoginResponseDto
            {
                Token = token,
                UserId = user.Id,
                Role = user.Role,
                PractitionerId = user.PractitionerId
            };
        }
    }
}
