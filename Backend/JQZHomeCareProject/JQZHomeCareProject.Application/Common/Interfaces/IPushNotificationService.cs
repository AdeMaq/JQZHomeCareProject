using System;
using System.Collections.Generic;
using System.Text;
namespace JQZHomeCareProject.Application.Common.Interfaces
{
    public interface IPushNotificationService
    {
        Task SendVisitAssignedNotificationAsync(Guid practitionerUserId, Guid visitId);
        Task SendAsync(string deviceToken, string title, string body);
    }
}
