namespace Hospital.Models;

public class Prescription
{
    public int Id { get; set; }

    public int PatientId { get; set; }

    public Patient? Patient { get; set; }

    public int DoctorId { get; set; }

    public Doctor? Doctor { get; set; }

    public string MedicationName { get; set; } = string.Empty;

    public string Dosage { get; set; } = string.Empty;

    public string Instructions { get; set; } = string.Empty;

    public DateTime PrescriptionDate { get; set; } = DateTime.UtcNow;
}