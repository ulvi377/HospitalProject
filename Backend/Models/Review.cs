
using System.ComponentModel.DataAnnotations;

namespace Hospital.Models;

public class Review
{
	public int Id { get; set; }

	public int DoctorId { get; set; }
	public Doctor? Doctor { get; set; }

	public int PatientId { get; set; }
	public Patient? Patient { get; set; }

	[Range(1, 5)]
	public int Rating { get; set; }

	[Required]
	[StringLength(1000, MinimumLength = 3)]
	public string Comment { get; set; } = string.Empty;

	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
