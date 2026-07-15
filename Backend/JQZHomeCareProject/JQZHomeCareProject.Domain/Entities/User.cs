using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Domain.Common;
using JQZHomeCareProject.Domain.Enums;

namespace JQZHomeCareProject.Domain.Entities
{
    public class User : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public UserRole Role { get; set; }

        public Guid? PractitionerId { get; set; }
        public Practitioner? Practitioner { get; set; }
    }
}
