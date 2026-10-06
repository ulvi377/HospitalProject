namespace Hospital.Models;

public class PainAssessment
{
    public int Id { get; set; }

    public int PatientId { get; set; }

    public Patient? Patient { get; set; }

    public int PainAreaId { get; set; }

    public PainArea? PainArea { get; set; }

    public int PainLevel { get; set; }

    public string? Symptoms { get; set; }

    public string? Description { get; set; }

    public DateTime AssessmentDate { get; set; } = DateTime.UtcNow;

    public bool IsEmergency { get; set; }
}