using Hospital.Data;
using Hospital.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MedicalRecordController : ControllerBase
{
    private readonly HospitalDbContext _context;

    public MedicalRecordController(HospitalDbContext context)
    {
        _context = context;
    }

    // GET: api/medicalrecord
    [HttpGet]
    public async Task<IActionResult> GetMedicalRecords()
    {
        var records = await _context.MedicalRecords
            .Include(m => m.Patient)
            .Include(m => m.Doctor)
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
            .OrderByDescending(m => m.RecordDate)
            .ToListAsync();

        return Ok(records);
    }

    // GET: api/medicalrecord/1
    [HttpGet("{id}")]
    public async Task<IActionResult> GetMedicalRecord(int id)
    {
        var record = await _context.MedicalRecords
            .Include(m => m.Patient)
            .Include(m => m.Doctor)
            .Where(m => m.Id == id)
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
            .FirstOrDefaultAsync();

        if (record == null)
        {
            return NotFound(new
            {
                message = "Tibbi qeyd tapilmadi."
            });
        }

        return Ok(record);
    }

    // GET: api/medicalrecord/patient/1
    [HttpGet("patient/{patientId}")]
    public async Task<IActionResult> GetPatientMedicalRecords(int patientId)
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

    // GET: api/medicalrecord/doctor/1
    [HttpGet("doctor/{doctorId}")]
    public async Task<IActionResult> GetDoctorMedicalRecords(int doctorId)
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

    // POST: api/medicalrecord
    [HttpPost]
    public async Task<IActionResult> CreateMedicalRecord(
        MedicalRecord record)
    {
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

        if (string.IsNullOrWhiteSpace(record.Diagnosis))
        {
            return BadRequest(new
            {
                message = "Diaqnoz bos ola bilmez."
            });
        }

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
            }
        );
    }

    // PUT: api/medicalrecord/1
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMedicalRecord(
        int id,
        MedicalRecord record)
    {
        if (id != record.Id)
        {
            return BadRequest(new
            {
                message = "ID uygun gelmir."
            });
        }

        var existingRecord = await _context.MedicalRecords
            .FindAsync(id);

        if (existingRecord == null)
        {
            return NotFound(new
            {
                message = "Tibbi qeyd tapilmadi."
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

        if (string.IsNullOrWhiteSpace(record.Diagnosis))
        {
            return BadRequest(new
            {
                message = "Diaqnoz bos ola bilmez."
            });
        }

        existingRecord.PatientId = record.PatientId;
        existingRecord.DoctorId = record.DoctorId;
        existingRecord.Diagnosis = record.Diagnosis;
        existingRecord.Symptoms = record.Symptoms;
        existingRecord.Notes = record.Notes;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/medicalrecord/1
    [HttpDelete("{id}")]
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
}