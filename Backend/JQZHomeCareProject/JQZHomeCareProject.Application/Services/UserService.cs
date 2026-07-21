using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }
        public async Task RegisterDeviceTokenAsync(Guid userId, string deviceToken)
        {
            if (string.IsNullOrWhiteSpace(deviceToken))
            {
                throw new ValidationException("Device token is required.");
            }

            var user = await _userRepository.GetByIdAsync(userId);
            if (user is null)
            {
                throw new NotFoundException($"User with id '{userId}' was not found.");
            }

            user.DeviceToken = deviceToken;
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);
        }

    }
}
