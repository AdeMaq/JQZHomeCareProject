using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.Common.Exceptions
{
    public class AuthenticationException:Exception
    {
        public AuthenticationException(string message) : base(message)
        {
        
        }
    }
}
