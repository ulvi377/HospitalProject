namespace Hospital.Models;

public class PainArea
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string BodyPart { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int RecommendedSpecialtyId { get; set; }

    public Specialty RecommendedSpecialty { get; set; } = null!;

    public bool IsActive { get; set; } = true;
}