using Hospital.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PatientHistoryController : ControllerBase
{
	private readonly HospitalDbContext _context;

	public PatientHistoryController(HospitalDbContext context)
	{
		_context = context;
	}

	[HttpGet("{patientId}")]
	public async Task<IActionResult> GetPatientHistory(int patientId)
	{
		var patient = await _context.Patients
			.FirstOrDefaultAsync(p => p.Id == patientId);

		if (patient == null)
		{
			return NotFound(new
			{
				message = "Pasiyent tapilmadi."
			});
		}

		var appointments = await _context.Appointments
			.Where(a => a.PatientId == patientId)
			.OrderByDescending(a => a.AppointmentDate)
			.Select(a => new
			{
				a.Id,
				a.PatientId,
				a.DoctorId,
				a.AppointmentDate,
				a.Status
			})
			.ToListAsync();

		var prescriptions = await _context.Prescriptions
			.Where(p => p.PatientId == patientId)
			.Include(p => p.Doctor)
			.OrderByDescending(p => p.PrescriptionDate)
			.Select(p => new
			{
				p.Id,
				p.PatientId,
				p.DoctorId,
				Doctor = p.Doctor == null
					? null
					: new
					{
						p.Doctor.Id,
						p.Doctor.FullName
					},
				p.MedicationName,
				p.Dosage,
				p.Instructions,
				p.PrescriptionDate
			})
			.ToListAsync();

		var medicalRecords = await _context.MedicalRecords
			.Where(m => m.PatientId == patientId)
			.Include(m => m.Doctor)
			.OrderByDescending(m => m.RecordDate)
			.Select(m => new
			{
				m.Id,
				m.PatientId,
				m.DoctorId,
				Doctor = m.Doctor == null
					? null
					: new
					{
						m.Doctor.Id,
						m.Doctor.FullName
					},
				m.Diagnosis,
				m.Symptoms,
				m.Notes,
				m.RecordDate
			})
			.ToListAsync();

		return Ok(new
		{
			patient = new
			{
				patient.Id,
				patient.FullName,
				patient.DateOfBirth,
				patient.Gender,
				patient.PhoneNumber,
				patient.Address
			},
			appointments,
			prescriptions,
			medicalRecords
		});
	}
}