using JQZHomeCareProject.Mobile.Models.Ratings;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Mobile.Services.Api
{
    public interface IRatingsApi
    {
        Task<List<RatingDto>> GetByPractitionerAsync(Guid practitionerId, CancellationToken cancellationToken = default);
    }
}
