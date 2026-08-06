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
        [StringLength(100, MinimumLength = 1, ErrorMessage = "City name must be between 1 and 100 characters.")]
        public string Name { get; set; } = string.Empty;
    }

    public class UpdateCityDto
    {
        [Required(ErrorMessage = "City name is required.")]
        [StringLength(100, MinimumLength = 1, ErrorMessage = "City name must be between 1 and 100 characters.")]
        public string Name { get; set; } = string.Empty;
    }
}