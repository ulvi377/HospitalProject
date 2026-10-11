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
public class MedicalRecordController : ControllerBase
{
    private readonly HospitalDbContext _context;

    public MedicalRecordController(HospitalDbContext context)
    {
        _context = context;
    }

    // GET: api/MedicalRecord
    // Admin: bütün tibbi qeydlər
    // Doctor: yalnız öz tibbi qeydləri
    [Authorize(Roles = "Admin,Doctor")]
    [HttpGet]
    public async Task<IActionResult> GetMedicalRecords()
    {
        var query = _context.MedicalRecords
            .Include(m => m.Patient)
            .Include(m => m.Doctor)
            .AsQueryable();

        if (!User.IsInRole("Admin"))
        {
            var doctorId = await GetCurrentDoctorIdAsync();

            if (doctorId == null)
                return Forbid();

            query = query.Where(m => m.DoctorId == doctorId.Value);
        }

        var records = await query
            .OrderByDescending(m => m.RecordDate)
            .Select(m => new
            {
                m.Id,
                m.PatientId,

                Patient = m.Patient == null
                    ? null
                    : new
                    {
                        m.Patient.Id,
                        m.Patient.FullName
                    },

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

        return Ok(records);
    }

    // GET: api/MedicalRecord/my
    // Patient yalnız öz müayinə tarixçəsini əldə edir.
    [Authorize(Roles = "Patient")]
    [HttpGet("my")]
    public async Task<IActionResult> GetMyMedicalRecords()
    {
        var userId =
            User.FindFirstValue(ClaimTypes.NameIdentifier) ??
            User.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new
            {
                message = "İstifadəçi məlumatı tapılmadı."
            });
        }

        var patientId = await _context.Patients
            .Where(p => p.UserId == userId)
            .Select(p => (int?)p.Id)
            .FirstOrDefaultAsync();

        if (patientId == null)
        {
            return NotFound(new
            {
                message = "Bu hesaba uyğun pasiyent profili tapılmadı."
            });
        }

        var records = await _context.MedicalRecords
            .Where(m => m.PatientId == patientId.Value)
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

        return Ok(records);
    }

    // GET: api/MedicalRecord/1
    // Admin, Doctor və Patient
    [Authorize(Roles = "Admin,Doctor,Patient")]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetMedicalRecord(int id)
    {
        var record = await _context.MedicalRecords
            .Include(m => m.Patient)
            .Include(m => m.Doctor)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (record == null)
        {
            return NotFound(new
            {
                message = "Tibbi qeyd tapilmadi."
            });
        }

        var allowed = User.IsInRole("Admin");

        if (!allowed && User.IsInRole("Patient"))
        {
            allowed = await IsPatientOwnerAsync(record.PatientId);
        }

        if (!allowed && User.IsInRole("Doctor"))
        {
            allowed = await IsDoctorOwnerAsync(record.DoctorId);
        }

        if (!allowed)
            return Forbid();

        return Ok(new
        {
            record.Id,
            record.PatientId,

            Patient = record.Patient == null
                ? null
                : new
                {
                    record.Patient.Id,
                    record.Patient.FullName
                },

            record.DoctorId,

            Doctor = record.Doctor == null
                ? null
                : new
                {
                    record.Doctor.Id,
                    record.Doctor.FullName
                },

            record.Diagnosis,
            record.Symptoms,
            record.Notes,
            record.RecordDate
        });
    }

    // GET: api/MedicalRecord/patient/1
    // Patient yalnız öz qeydlərini görə bilər
    [Authorize(Roles = "Admin,Patient")]
    [HttpGet("patient/{patientId:int}")]
    public async Task<IActionResult> GetPatientMedicalRecords(int patientId)
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
                message = "Pasiyent tapilmadi."
            });
        }

        var records = await _context.MedicalRecords
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

        return Ok(records);
    }

    // GET: api/MedicalRecord/doctor/1
    // Doctor yalnız öz qeydlərini görə bilər
    [Authorize(Roles = "Admin,Doctor")]
    [HttpGet("doctor/{doctorId:int}")]
    public async Task<IActionResult> GetDoctorMedicalRecords(int doctorId)
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
                message = "Hekim tapilmadi."
            });
        }

        var records = await _context.MedicalRecords
            .Where(m => m.DoctorId == doctorId)
            .Include(m => m.Patient)
            .OrderByDescending(m => m.RecordDate)
            .Select(m => new
            {
                m.Id,
                m.PatientId,

                Patient = m.Patient == null
                    ? null
                    : new
                    {
                        m.Patient.Id,
                        m.Patient.FullName
                    },

                m.DoctorId,
                m.Diagnosis,
                m.Symptoms,
                m.Notes,
                m.RecordDate
            })
            .ToListAsync();

        return Ok(records);
    }

    // POST: api/MedicalRecord
    // Admin və Doctor tibbi qeyd yarada bilər
    [Authorize(Roles = "Admin,Doctor")]
    [HttpPost]
    public async Task<IActionResult> CreateMedicalRecord(
        [FromBody] MedicalRecord record)
    {
        if (record == null)
        {
            return BadRequest(new
            {
                message = "Tibbi qeyd melumatlari gonderilmeyib."
            });
        }

        if (string.IsNullOrWhiteSpace(record.Diagnosis))
        {
            return BadRequest(new
            {
                message = "Diaqnoz bos ola bilmez."
            });
        }

        var patientExists = await _context.Patients
            .AnyAsync(p => p.Id == record.PatientId);

        if (!patientExists)
        {
            return BadRequest(new
            {
                message = "Gosterilen pasiyent movcud deyil."
            });
        }

        if (record.DoctorId.HasValue)
        {
            var doctorExists = await _context.Doctors
                .AnyAsync(d => d.Id == record.DoctorId.Value);

            if (!doctorExists)
            {
                return BadRequest(new
                {
                    message = "Gosterilen hekim movcud deyil."
                });
            }
        }

        if (User.IsInRole("Doctor"))
        {
            var currentDoctorId = await GetCurrentDoctorIdAsync();

            if (currentDoctorId == null)
                return Forbid();

            // Doctor öz adından qeyd yaratmalıdır.
            record.DoctorId = currentDoctorId.Value;
        }

        record.Id = 0;
        record.RecordDate = DateTime.UtcNow;

        _context.MedicalRecords.Add(record);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetMedicalRecord),
            new { id = record.Id },
            new
            {
                record.Id,
                record.PatientId,
                record.DoctorId,
                record.Diagnosis,
                record.Symptoms,
                record.Notes,
                record.RecordDate
            });
    }

    // PUT: api/MedicalRecord/1
    // Admin və qeydin sahibi olan Doctor
    [Authorize(Roles = "Admin,Doctor")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateMedicalRecord(
        int id,
        [FromBody] MedicalRecord record)
    {
        if (record == null || id != record.Id)
        {
            return BadRequest(new
            {
                message = "ID uygun gelmir."
            });
        }

        var existingRecord = await _context.MedicalRecords
            .FirstOrDefaultAsync(m => m.Id == id);

        if (existingRecord == null)
        {
            return NotFound(new
            {
                message = "Tibbi qeyd tapilmadi."
            });
        }

        if (User.IsInRole("Doctor"))
        {
            var currentDoctorId = await GetCurrentDoctorIdAsync();

            if (currentDoctorId == null ||
                existingRecord.DoctorId != currentDoctorId.Value)
            {
                return Forbid();
            }

            // Doctor qeydin sahibini dəyişə bilməz.
            if (record.DoctorId != existingRecord.DoctorId)
            {
                return BadRequest(new
                {
                    message = "Hekim tibbi qeydin sahibini deyise bilmez."
                });
            }
        }

        if (string.IsNullOrWhiteSpace(record.Diagnosis))
        {
            return BadRequest(new
            {
                message = "Diaqnoz bos ola bilmez."
            });
        }

        var patientExists = await _context.Patients
            .AnyAsync(p => p.Id == record.PatientId);

        if (!patientExists)
        {
            return BadRequest(new
            {
                message = "Gosterilen pasiyent movcud deyil."
            });
        }

        if (record.DoctorId.HasValue)
        {
            var doctorExists = await _context.Doctors
                .AnyAsync(d => d.Id == record.DoctorId.Value);

            if (!doctorExists)
            {
                return BadRequest(new
                {
                    message = "Gosterilen hekim movcud deyil."
                });
            }
        }

        existingRecord.PatientId = record.PatientId;
        existingRecord.Diagnosis = record.Diagnosis;
        existingRecord.Symptoms = record.Symptoms;
        existingRecord.Notes = record.Notes;

        // Yalnız Admin DoctorId-ni dəyişə bilər.
        if (User.IsInRole("Admin"))
        {
            existingRecord.DoctorId = record.DoctorId;
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/MedicalRecord/1
    // Yalnız Admin
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteMedicalRecord(int id)
    {
        var record = await _context.MedicalRecords
            .FindAsync(id);

        if (record == null)
        {
            return NotFound(new
            {
                message = "Tibbi qeyd tapilmadi."
            });
        }

        _context.MedicalRecords.Remove(record);

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // Cari Doctor hesabının ID-sini tapır
    private async Task<int?> GetCurrentDoctorIdAsync()
    {
        var email =
            User.FindFirstValue(ClaimTypes.Email) ??
            User.FindFirstValue("email");

        if (!string.IsNullOrWhiteSpace(email))
        {
            var doctorId = await _context.Doctors
                .Where(d => d.Email == email)
                .Select(d => (int?)d.Id)
                .FirstOrDefaultAsync();

            if (doctorId.HasValue)
                return doctorId.Value;
        }

        var userId =
            User.FindFirstValue(ClaimTypes.NameIdentifier) ??
            User.FindFirstValue("sub");

        if (!string.IsNullOrWhiteSpace(userId))
        {
            var doctorId = await _context.Doctors
                .Where(d => d.ApplicationUserId == userId)
                .Select(d => (int?)d.Id)
                .FirstOrDefaultAsync();

            if (doctorId.HasValue)
                return doctorId.Value;
        }

        return null;
    }

    // Patient-in öz tibbi qeydinə girişini yoxlayır
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

    // Doctor-un öz qeydinə girişini yoxlayır
    private async Task<bool> IsDoctorOwnerAsync(int? doctorId)
    {
        if (!doctorId.HasValue)
            return false;

        var currentDoctorId = await GetCurrentDoctorIdAsync();

        return currentDoctorId.HasValue &&
               currentDoctorId.Value == doctorId.Value;
    }
}