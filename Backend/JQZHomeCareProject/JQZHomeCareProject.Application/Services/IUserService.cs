using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.Services
{
    public interface IUserService
    {
        Task RegisterDeviceTokenAsync(Guid userId, string deviceToken);
    }
}
