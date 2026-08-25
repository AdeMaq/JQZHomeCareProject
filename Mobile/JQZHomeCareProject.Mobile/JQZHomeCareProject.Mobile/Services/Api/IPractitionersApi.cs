using JQZHomeCareProject.Mobile.Models.Practitioners;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Mobile.Services.Api
{
    public interface IPractitionersApi
    {
        Task<PractitionerDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    }
}
