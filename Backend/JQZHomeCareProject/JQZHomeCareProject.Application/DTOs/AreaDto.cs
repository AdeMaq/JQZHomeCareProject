using System.ComponentModel.DataAnnotations;

namespace JQZHomeCareProject.Application.DTOs
{
    public class AreaDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid CityId { get; set; }
        public string CityName { get; set; } = string.Empty;
    }

    public class CreateAreaDto
    {
        [Required(ErrorMessage = "Area name is required.")]
        [StringLength(100, MinimumLength = 1, ErrorMessage = "Area name must be between 1 and 100 characters.")]
        public string Name { get; set; } = string.Empty;
        public Guid CityId { get; set; }
    }

    public class UpdateAreaDto
    {
        [Required(ErrorMessage = "Area name is required.")]
        [StringLength(100, MinimumLength = 1, ErrorMessage = "Area name must be between 1 and 100 characters.")]
        public string Name { get; set; } = string.Empty;
        public Guid CityId { get; set; }
    }
}
