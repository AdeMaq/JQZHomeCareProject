using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.Common.Interfaces
{
    public interface IUnitOfWork
    {
        Task ExecuteInTransactionAsync(Func<Task> operation);
    }
}
