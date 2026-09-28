namespace Hospital.Models;

public class Doctor
{
    public int Id { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string ImageUrl { get; set; } = string.Empty;

    public int SpecialtyId { get; set; }

    public Specialty? Specialty { get; set; }

    public bool IsActive { get; set; } = true;
}