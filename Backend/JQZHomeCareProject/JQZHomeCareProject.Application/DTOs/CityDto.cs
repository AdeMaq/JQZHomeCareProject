namespace JQZHomeCareProject.Application.DTOs
{
    public class CityDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class CreateCityDto
    {
        public string Name { get; set; } = string.Empty;
    }

    public class UpdateCityDto
    {
        public string Name { get; set; } = string.Empty;
    }
}