namespace Hospital.Models;

public class DoctorAbsenceRequest
{
    public int Id { get; set; }

    public int DoctorId { get; set; }

    public Doctor? Doctor { get; set; }

    public DateTime AbsenceDate { get; set; }

    public string Reason { get; set; } = string.Empty;

    public string? Note { get; set; }

    // Cloudinary image URL
    public string? ImageUrl { get; set; }

    // Pending, Approved, Rejected
    public string Status { get; set; } = "Pending";

    public string? AdminNote { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ReviewedAt { get; set; }
}