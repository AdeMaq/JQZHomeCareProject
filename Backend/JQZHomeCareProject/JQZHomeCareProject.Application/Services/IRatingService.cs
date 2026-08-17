using JQZHomeCareProject.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;
namespace JQZHomeCareProject.Application.Services
{
    public interface IRatingService
    {
        Task AddRatingAsync(Guid practitionerId, RatingDto dto);
        Task<IEnumerable<RatingDto>> GetByPractitionerAsync(Guid practitionerId);
        Task<IEnumerable<RatingDto>> GetMonthlyAsync(int year, int month);
        Task<RatingDto> GetByIdAsync(Guid ratingId);
        Task<IEnumerable<RatingDto>> GetAllAsync();
        Task<RatingDto> UpdateAsync(Guid ratingId, UpdateRatingDto dto);
    }
}
