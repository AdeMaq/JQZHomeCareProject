using System;
using System.Collections.Generic;
using System.Text;
using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Domain.Entities;

namespace JQZHomeCareProject.Application.Services
{
    public class RatingService : IRatingService
    {
        private readonly IRatingRepository _ratingRepository;
        private readonly IPractitionerRepository _ractitionerRepository;

        public RatingService(IRatingRepository ratingRepository, IPractitionerRepository practitionerRepository)
        {
            _ratingRepository = ratingRepository;
            _ractitionerRepository = practitionerRepository;
        }

        public async Task AddRatingAsync(Guid practitionerId, RatingDto dto)
        {
            if(dto.Score is < 1 || dto.Score > 5)
            {
                throw new ValidationException("Score must be between 1 and 5.");
            }
            var practitioner = await _ractitionerRepository.GetByIdAsync(practitionerId); 
            if (practitioner == null)
            {
                throw new NotFoundException($"Practitioner with ID {practitionerId} not found.");
            }
            var rating = new Rating
            {
                Id = Guid.NewGuid(),
                PractitionerId = practitionerId,
                Month = dto.Month,
                Score = dto.Score,
                Comments = dto.Comments
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
