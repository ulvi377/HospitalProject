using Hospital.Data;
using Hospital.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PrescriptionController : ControllerBase
{
    private readonly HospitalDbContext _context;

    public PrescriptionController(HospitalDbContext context)
    {
        _context = context;
    }

    // GET: api/prescription
    [HttpGet]
    public async Task<IActionResult> GetPrescriptions()
    {
        var prescriptions = await _context.Prescriptions
            .Include(p => p.Patient)
            .Include(p => p.Doctor)
            .Select(p => new
            {
                p.Id,
                p.PatientId,

                Patient = p.Patient == null
                    ? null
                    : new
                    {
                        p.Patient.Id,
                        p.Patient.FullName
                    },

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
            .OrderByDescending(p => p.PrescriptionDate)
            .ToListAsync();

        return Ok(prescriptions);
    }

    // GET: api/prescription/1
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPrescription(int id)
    {
        var prescription = await _context.Prescriptions
            .Include(p => p.Patient)
            .Include(p => p.Doctor)
            .Where(p => p.Id == id)
            .Select(p => new
            {
                p.Id,
                p.PatientId,

                Patient = p.Patient == null
                    ? null
                    : new
                    {
                        p.Patient.Id,
                        p.Patient.FullName
                    },

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
            .FirstOrDefaultAsync();

        if (prescription == null)
        {
            return NotFound(new
            {
                message = "Resept tapilmadi."
            });
        }

        return Ok(prescription);
    }

    // GET: api/prescription/patient/1
    [HttpGet("patient/{patientId}")]
    public async Task<IActionResult> GetPatientPrescriptions(int patientId)
    {
        var patientExists = await _context.Patients
            .AnyAsync(p => p.Id == patientId);

        if (!patientExists)
        {
            return NotFound(new
            {
                message = "Pasiyent tapilmadi."
            });
        }

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

        return Ok(prescriptions);
    }

    // GET: api/prescription/doctor/1
    [HttpGet("doctor/{doctorId}")]
    public async Task<IActionResult> GetDoctorPrescriptions(int doctorId)
    {
        var doctorExists = await _context.Doctors
            .AnyAsync(d => d.Id == doctorId);

        if (!doctorExists)
        {
            return NotFound(new
            {
                message = "Hekim tapilmadi."
            });
        }

        var prescriptions = await _context.Prescriptions
            .Where(p => p.DoctorId == doctorId)
            .Include(p => p.Patient)
            .OrderByDescending(p => p.PrescriptionDate)
            .Select(p => new
            {
                p.Id,
                p.PatientId,

                Patient = p.Patient == null
                    ? null
                    : new
                    {
                        p.Patient.Id,
                        p.Patient.FullName
                    },

                p.DoctorId,
                p.MedicationName,
                p.Dosage,
                p.Instructions,
                p.PrescriptionDate
            })
            .ToListAsync();

        return Ok(prescriptions);
    }

    // POST: api/prescription
    [HttpPost]
    public async Task<IActionResult> CreatePrescription(
        Prescription prescription)
    {
        var patientExists = await _context.Patients
            .AnyAsync(p => p.Id == prescription.PatientId);

        if (!patientExists)
        {
            return BadRequest(new
            {
                message = "Gosterilen pasiyent movcud deyil."
            });
        }

        var doctorExists = await _context.Doctors
            .AnyAsync(d => d.Id == prescription.DoctorId);

        if (!doctorExists)
        {
            return BadRequest(new
            {
                message = "Gosterilen hekim movcud deyil."
            });
        }

        if (string.IsNullOrWhiteSpace(prescription.MedicationName))
        {
            return BadRequest(new
            {
                message = "Derman adi bos ola bilmez."
            });
        }

        if (string.IsNullOrWhiteSpace(prescription.Dosage))
        {
            return BadRequest(new
            {
                message = "Doza bos ola bilmez."
            });
        }

        if (string.IsNullOrWhiteSpace(prescription.Instructions))
        {
            return BadRequest(new
            {
                message = "Istifade qaydasi bos ola bilmez."
            });
        }

        prescription.PrescriptionDate = DateTime.UtcNow;

        _context.Prescriptions.Add(prescription);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetPrescription),
            new { id = prescription.Id },
            new
            {
                prescription.Id,
                prescription.PatientId,
                prescription.DoctorId,
                prescription.MedicationName,
                prescription.Dosage,
                prescription.Instructions,
                prescription.PrescriptionDate
            }
        );
    }

    // PUT: api/prescription/1
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePrescription(
        int id,
        Prescription prescription)
    {
        if (id != prescription.Id)
        {
            return BadRequest(new
            {
                message = "ID uygun gelmir."
            });
        }

        var existingPrescription = await _context.Prescriptions
            .FindAsync(id);

        if (existingPrescription == null)
        {
            return NotFound(new
            {
                message = "Resept tapilmadi."
            });
        }

        var patientExists = await _context.Patients
            .AnyAsync(p => p.Id == prescription.PatientId);

        if (!patientExists)
        {
            return BadRequest(new
            {
                message = "Gosterilen pasiyent movcud deyil."
            });
        }

        var doctorExists = await _context.Doctors
            .AnyAsync(d => d.Id == prescription.DoctorId);

        if (!doctorExists)
        {
            return BadRequest(new
            {
                message = "Gosterilen hekim movcud deyil."
            });
        }

        if (string.IsNullOrWhiteSpace(prescription.MedicationName))
        {
            return BadRequest(new
            {
                message = "Derman adi bos ola bilmez."
            });
        }

        if (string.IsNullOrWhiteSpace(prescription.Dosage))
        {
            return BadRequest(new
            {
                message = "Doza bos ola bilmez."
            });
        }

        if (string.IsNullOrWhiteSpace(prescription.Instructions))
        {
            return BadRequest(new
            {
                message = "Istifade qaydasi bos ola bilmez."
            });
        }

        existingPrescription.PatientId = prescription.PatientId;
        existingPrescription.DoctorId = prescription.DoctorId;
        existingPrescription.MedicationName = prescription.MedicationName;
        existingPrescription.Dosage = prescription.Dosage;
        existingPrescription.Instructions = prescription.Instructions;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/prescription/1
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePrescription(int id)
    {
        var prescription = await _context.Prescriptions
            .FindAsync(id);

        if (prescription == null)
        {
            return NotFound(new
            {
                message = "Resept tapilmadi."
            });
        }

        _context.Prescriptions.Remove(prescription);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}