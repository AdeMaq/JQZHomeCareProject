using System.ComponentModel.DataAnnotations;

namespace JQZHomeCareProject.Application.DTOs
{
    public class CityDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class CreateCityDto
    {
        [Required(ErrorMessage = "City name is required.")]
        [StringLength(100, ErrorMessage = "City name cannot exceed 100 characters.")]
        [RegularExpression(
            @"^[A-Za-z\s]+$",
            ErrorMessage = "City name must not be empty, contain only spaces, or contain special characters."
        )]
        public string Name { get; set; } = string.Empty;
    }

    public class UpdateCityDto
    {
        [Required(ErrorMessage = "City name is required.")]
        [StringLength(100, ErrorMessage = "City name cannot exceed 100 characters.")]
        [RegularExpression(
            @"^[A-Za-z\s]+$",
            ErrorMessage = "City name must not be empty, contain only spaces, or contain special characters."
        )]
        public string Name { get; set; } = string.Empty;
    }
}