
namespace Hospital.Models;

public class DoctorRating
{
	public int Id { get; set; }

	public int AppointmentId { get; set; }
	public Appointment? Appointment { get; set; }

	public int PatientId { get; set; }
	public Patient? Patient { get; set; }

	public int DoctorId { get; set; }
	public Doctor? Doctor { get; set; }

	public int Rating { get; set; }

	public string Comment { get; set; } = string.Empty;

	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
