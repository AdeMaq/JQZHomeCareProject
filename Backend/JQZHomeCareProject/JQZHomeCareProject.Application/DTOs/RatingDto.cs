using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
namespace JQZHomeCareProject.Application.DTOs
{
    public class RatingDto
    {
        public Guid Id { get; set; }
        public Guid PractitionerId { get; set; }
        public DateTime Month { get; set; }

        [Range(1, 5, ErrorMessage = "Score must be between 1 and 5.")]
        public int Score { get; set; }

        [StringLength(1000, ErrorMessage = "Comments cannot exceed 1000 characters.")]
        public string? Comments { get; set; }
    }

    public class UpdateRatingDto
    {
        [Range(1, 5, ErrorMessage = "Score must be between 1 and 5.")]
        public int Score { get; set; }

        [StringLength(1000, ErrorMessage = "Comments cannot exceed 1000 characters.")]
        public string? Comments { get; set; }
    }
}
