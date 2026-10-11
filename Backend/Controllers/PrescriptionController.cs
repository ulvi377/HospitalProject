
using System.Security.Claims;
using Hospital.Data;
using Hospital.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PrescriptionController : ControllerBase
{
    private readonly HospitalDbContext _context;

    public PrescriptionController(HospitalDbContext context)
    {
        _context = context;
    }

    // GET: api/Prescription
    // Admin: bütün reseptlər
    // Doctor: yalnız öz reseptləri
    [Authorize(Roles = "Admin,Doctor")]
    [HttpGet]
    public async Task<IActionResult> GetPrescriptions()
    {
        var query = _context.Prescriptions
            .Include(p => p.Patient)
            .Include(p => p.Doctor)
            .AsQueryable();

        if (User.IsInRole("Doctor") && !User.IsInRole("Admin"))
        {
            var doctorId = await GetCurrentDoctorIdAsync();

            if (doctorId == null)
                return Forbid();

            query = query.Where(p => p.DoctorId == doctorId.Value);
        }

        var prescriptions = await query
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

    // GET: api/Prescription/1
    // Admin, resepti yazan Doctor və reseptin sahibi Patient
    [Authorize(Roles = "Admin,Doctor,Patient")]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetPrescription(int id)
    {
        var prescription = await _context.Prescriptions
            .Include(p => p.Patient)
            .Include(p => p.Doctor)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (prescription == null)
        {
            return NotFound(new
            {
                message = "Resept tapılmadı."
            });
        }

        var accessAllowed = User.IsInRole("Admin");

        if (!accessAllowed && User.IsInRole("Patient"))
        {
            accessAllowed = await IsPatientOwnerAsync(
                prescription.PatientId
            );
        }

        if (!accessAllowed && User.IsInRole("Doctor"))
        {
            accessAllowed = await IsDoctorOwnerAsync(
                prescription.DoctorId
            );
        }

        if (!accessAllowed)
            return Forbid();

        return Ok(new
        {
            prescription.Id,
            prescription.PatientId,
            Patient = prescription.Patient == null
                ? null
                : new
                {
                    prescription.Patient.Id,
                    prescription.Patient.FullName
                },
            prescription.DoctorId,
            Doctor = prescription.Doctor == null
                ? null
                : new
                {
                    prescription.Doctor.Id,
                    prescription.Doctor.FullName
                },
            prescription.MedicationName,
            prescription.Dosage,
            prescription.Instructions,
            prescription.PrescriptionDate
        });
    }

    // GET: api/Prescription/patient/1
    // Admin və yalnız öz reseptlərini görən Patient
    [Authorize(Roles = "Admin,Patient")]
    [HttpGet("patient/{patientId:int}")]
    public async Task<IActionResult> GetPatientPrescriptions(int patientId)
    {
        if (!User.IsInRole("Admin"))
        {
            var isOwner = await IsPatientOwnerAsync(patientId);

            if (!isOwner)
                return Forbid();
        }

        var patientExists = await _context.Patients
            .AnyAsync(p => p.Id == patientId);

        if (!patientExists)
        {
            return NotFound(new
            {
                message = "Pasiyent tapılmadı."
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

    // GET: api/Prescription/doctor/1
    // Admin və yalnız öz reseptlərini görən Doctor
    [Authorize(Roles = "Admin,Doctor")]
    [HttpGet("doctor/{doctorId:int}")]
    public async Task<IActionResult> GetDoctorPrescriptions(int doctorId)
    {
        if (!User.IsInRole("Admin"))
        {
            var isOwner = await IsDoctorOwnerAsync(doctorId);

            if (!isOwner)
                return Forbid();
        }

        var doctorExists = await _context.Doctors
            .AnyAsync(d => d.Id == doctorId);

        if (!doctorExists)
        {
            return NotFound(new
            {
                message = "Həkim tapılmadı."
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

    // POST: api/Prescription
    // Admin və Doctor resept yarada bilər
    [Authorize(Roles = "Admin,Doctor")]
    [HttpPost]
    public async Task<IActionResult> CreatePrescription(
        [FromBody] Prescription prescription)
    {
        if (prescription == null)
        {
            return BadRequest(new
            {
                message = "Resept məlumatları göndərilməyib."
            });
        }

        if (prescription.PatientId <= 0 ||
            string.IsNullOrWhiteSpace(prescription.MedicationName) ||
            string.IsNullOrWhiteSpace(prescription.Dosage))
        {
            return BadRequest(new
            {
                message = "Pasiyent, dərman adı və doza mütləqdir."
            });
        }

        var patientExists = await _context.Patients
            .AnyAsync(p => p.Id == prescription.PatientId);

        if (!patientExists)
        {
            return BadRequest(new
            {
                message = "Pasiyent mövcud deyil."
            });
        }

        if (User.IsInRole("Doctor") && !User.IsInRole("Admin"))
        {
            var currentDoctorId = await GetCurrentDoctorIdAsync();

            if (currentDoctorId == null)
                return Forbid();

            prescription.DoctorId = currentDoctorId.Value;
        }
        else if (prescription.DoctorId <= 0)
        {
            return BadRequest(new
            {
                message = "Admin üçün həkim ID-si göstərilməlidir."
            });
        }

        var doctorExists = await _context.Doctors
            .AnyAsync(d => d.Id == prescription.DoctorId);

        if (!doctorExists)
        {
            return BadRequest(new
            {
                message = "Həkim mövcud deyil."
            });
        }

        prescription.Id = 0;
        prescription.PrescriptionDate = DateTime.UtcNow;

        _context.Prescriptions.Add(prescription);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Resept uğurla yaradıldı.",
            prescription.Id,
            prescription.PatientId,
            prescription.DoctorId,
            prescription.MedicationName,
            prescription.Dosage,
            prescription.Instructions,
            prescription.PrescriptionDate
        });
    }

    // PUT: api/Prescription/1
    // Admin və resepti yazan Doctor
    [Authorize(Roles = "Admin,Doctor")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdatePrescription(
        int id,
        [FromBody] Prescription prescription)
    {
        if (prescription == null || id != prescription.Id)
        {
            return BadRequest(new
            {
                message = "Resept ID-si uyğun gəlmir."
            });
        }

        var existingPrescription = await _context.Prescriptions
            .FirstOrDefaultAsync(p => p.Id == id);

        if (existingPrescription == null)
        {
            return NotFound(new
            {
                message = "Resept tapılmadı."
            });
        }

        if (!User.IsInRole("Admin"))
        {
            var currentDoctorId = await GetCurrentDoctorIdAsync();

            if (currentDoctorId == null ||
                currentDoctorId.Value != existingPrescription.DoctorId)
            {
                return Forbid();
            }

            if (prescription.DoctorId != existingPrescription.DoctorId)
            {
                return BadRequest(new
                {
                    message = "Həkim reseptin sahibini dəyişə bilməz."
                });
            }
        }

        if (prescription.PatientId <= 0 ||
            string.IsNullOrWhiteSpace(prescription.MedicationName) ||
            string.IsNullOrWhiteSpace(prescription.Dosage))
        {
            return BadRequest(new
            {
                message = "Pasiyent, dərman adı və doza boş ola bilməz."
            });
        }

        var patientExists = await _context.Patients
            .AnyAsync(p => p.Id == prescription.PatientId);

        if (!patientExists)
        {
            return BadRequest(new
            {
                message = "Göstərilən pasiyent mövcud deyil."
            });
        }

        var doctorExists = await _context.Doctors
            .AnyAsync(d => d.Id == prescription.DoctorId);

        if (!doctorExists)
        {
            return BadRequest(new
            {
                message = "Göstərilən həkim mövcud deyil."
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

    // DELETE: api/Prescription/1
    // Admin bütün reseptləri, Doctor yalnız öz reseptlərini silə bilər
    [Authorize(Roles = "Admin,Doctor")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeletePrescription(int id)
    {
        var prescription = await _context.Prescriptions
            .FirstOrDefaultAsync(p => p.Id == id);

        if (prescription == null)
        {
            return NotFound(new
            {
                message = "Resept tapılmadı."
            });
        }

        if (!User.IsInRole("Admin"))
        {
            var currentDoctorId = await GetCurrentDoctorIdAsync();

            if (currentDoctorId == null ||
                currentDoctorId.Value != prescription.DoctorId)
            {
                return Forbid();
            }
        }

        _context.Prescriptions.Remove(prescription);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Resept uğurla silindi."
        });
    }

    // Cari Doctor hesabının Doctor cədvəlindəki ID-sini tapır
    private async Task<int?> GetCurrentDoctorIdAsync()
    {
        var email =
            User.FindFirstValue(ClaimTypes.Email) ??
            User.FindFirstValue("email");

        if (!string.IsNullOrWhiteSpace(email))
        {
            var doctorByEmail = await _context.Doctors
                .Where(d => d.Email == email)
                .Select(d => (int?)d.Id)
                .FirstOrDefaultAsync();

            if (doctorByEmail.HasValue)
                return doctorByEmail.Value;
        }

        var userId =
            User.FindFirstValue(ClaimTypes.NameIdentifier) ??
            User.FindFirstValue("sub");

        if (!string.IsNullOrWhiteSpace(userId))
        {
            var doctorByUserId = await _context.Doctors
                .Where(d => d.ApplicationUserId == userId)
                .Select(d => (int?)d.Id)
                .FirstOrDefaultAsync();

            if (doctorByUserId.HasValue)
                return doctorByUserId.Value;
        }

        return null;
    }

    // Cari Patient hesabının sahibi olub-olmadığını yoxlayır
    private async Task<bool> IsPatientOwnerAsync(int patientId)
    {
        var userId =
            User.FindFirstValue(ClaimTypes.NameIdentifier) ??
            User.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(userId))
            return false;

        return await _context.Patients.AnyAsync(p =>
            p.Id == patientId &&
            p.UserId == userId);
    }

    // Cari Doctor hesabının reseptə aid Doctor olub-olmadığını yoxlayır
    private async Task<bool> IsDoctorOwnerAsync(int doctorId)
    {
        var currentDoctorId = await GetCurrentDoctorIdAsync();

        return currentDoctorId.HasValue &&
               currentDoctorId.Value == doctorId;
    }
}
