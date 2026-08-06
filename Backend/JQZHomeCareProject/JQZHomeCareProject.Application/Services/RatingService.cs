using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.Common.Validation;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.Services
{
    public class RatingService : IRatingService
    {
        private readonly IRatingRepository _ratingRepository;
        private readonly IPractitionerRepository _practitionerRepository;

        public RatingService(IRatingRepository ratingRepository, IPractitionerRepository practitionerRepository)
        {
            _ratingRepository = ratingRepository;
            _practitionerRepository = practitionerRepository;
        }

        public async Task AddRatingAsync(Guid practitionerId, RatingDto dto)
        {
            Guard.EnsureNotEmpty(practitionerId, "PractitionerId");
            Guard.EnsureInRange(dto.Score, 1, 5, "Score");

            if (dto.Month == default)
                throw new ValidationException("Month is required.");
            if (dto.Month > DateTime.UtcNow.AddDays(1))
                throw new ValidationException("Month cannot be in the future.");

            var comments = NameValidator.NormalizeOptional(dto.Comments, "Comments", 1000);

            var practitioner = await _practitionerRepository.GetByIdAsync(practitionerId)
                ?? throw new NotFoundException($"Practitioner with ID {practitionerId} not found.");

            var rating = new Rating
            {
                Id = Guid.NewGuid(),
                PractitionerId = practitionerId,
                Month = dto.Month,
                Score = dto.Score,
                Comments = comments
            };
            await _ratingRepository.AddAsync(rating);
        }
        public async Task<IEnumerable<RatingDto>> GetByPractitionerAsync(Guid practitionerId)
        {
            var ratings = await _ratingRepository.GetByPractitionerAsync(practitionerId);
            return ratings.Select(MapToDto);
        }
        public async Task<IEnumerable<RatingDto>> GetMonthlyAsync(int year, int month)
        {
            var ratings = await _ratingRepository.GetByMonthAsync(year, month);
            return ratings.Select(MapToDto);
        }

        public async Task<RatingDto> UpdateAsync(Guid ratingId, UpdateRatingDto dto)
        {
            Guard.EnsureNotEmpty(ratingId, "RatingId");
            Guard.EnsureInRange(dto.Score, 1, 5, "Score");

            var rating = await _ratingRepository.GetByIdAsync(ratingId)
                ?? throw new NotFoundException($"Rating with id {ratingId} was not found.");

            rating.Score = dto.Score;
            rating.Comments = NameValidator.NormalizeOptional(dto.Comments, "Comments", 1000);

            await _ratingRepository.UpdateAsync(rating);
            return MapToDto(rating);
        }

        private static RatingDto MapToDto(Rating rating)
        {
            return new RatingDto
            {
                Id = rating.Id,
                PractitionerId = rating.PractitionerId,
                Month = rating.Month,
                Score = rating.Score,
                Comments = rating.Comments
            };
        }
    }
}
