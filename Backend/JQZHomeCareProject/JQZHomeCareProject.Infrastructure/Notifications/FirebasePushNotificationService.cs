using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using JQZHomeCareProject.Application.Common.Interfaces;
using Microsoft.Extensions.Options;

namespace JQZHomeCareProject.Infrastructure.Notifications
{
    public class FirebasePushNotificationService : IPushNotificationService
    {
        private readonly IUserRepository _userRepository;

        [Obsolete]
        public FirebasePushNotificationService(IUserRepository userRepository, IOptions<FirebaseSettings> settings)
        {
            _userRepository = userRepository;

            if (FirebaseApp.DefaultInstance is null)
            {
                FirebaseApp.Create(new AppOptions
                {
                    Credential = GoogleCredential.FromFile(settings.Value.CredentialsFileName)
                });
            }
        }

        [Obsolete]
        public async Task SendVisitAssignedNotificationAsync(Guid practitionerUserId, Guid visitId)
        {
            var user = await _userRepository.GetByIdAsync(practitionerUserId);

            if (user is null || string.IsNullOrWhiteSpace(user.DeviceToken))
            {
                return;
            }

            await SendAsync(
                user.DeviceToken,
                "New Visit Assigned",
                "You have been assigned a new home-visit session.");
        }

        [Obsolete]
        public async Task SendAsync(string deviceToken, string title, string body)
        {
            var message = new Message
            {
                Token = deviceToken,
                Notification = new Notification
                {
                    Title = title,
                    Body = body
                }
            };

            await FirebaseMessaging.DefaultInstance.SendAsync(message);
        }
    }
}