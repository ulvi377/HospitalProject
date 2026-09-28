using Hospital.Data;
using Hospital.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PatientController : ControllerBase
{
    private readonly HospitalDbContext _context;

    public PatientController(HospitalDbContext context)
    {
        _context = context;
    }

    // GET: api/patient
    [HttpGet]
    public async Task<IActionResult> GetPatients()
    {
        var patients = await _context.Patients
            .Select(p => new
            {
                p.Id,
                p.FullName,
                p.DateOfBirth,
                p.Gender,
                p.PhoneNumber,
                p.Address,
                p.UserId
            })
            .ToListAsync();

        return Ok(patients);
    }

    // GET: api/patient/1
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPatient(int id)
    {
        var patient = await _context.Patients
            .Where(p => p.Id == id)
            .Select(p => new
            {
                p.Id,
                p.FullName,
                p.DateOfBirth,
                p.Gender,
                p.PhoneNumber,
                p.Address,
                p.UserId
            })
            .FirstOrDefaultAsync();

        if (patient == null)
        {
            return NotFound(new
            {
                message = "Pasiyent tapilmadi."
            });
        }

        return Ok(patient);
    }

    // POST: api/patient
    [HttpPost]
    public async Task<IActionResult> CreatePatient(Patient patient)
    {
        if (string.IsNullOrWhiteSpace(patient.FullName))
        {
            return BadRequest(new
            {
                message = "Pasiyentin adi bos ola bilmez."
            });
        }

        if (patient.DateOfBirth > DateTime.UtcNow)
        {
            return BadRequest(new
            {
                message = "Dogum tarixi gelecek tarix ola bilmez."
            });
        }

        _context.Patients.Add(patient);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetPatient),
            new { id = patient.Id },
            new
            {
                patient.Id,
                patient.FullName,
                patient.DateOfBirth,
                patient.Gender,
                patient.PhoneNumber,
                patient.Address,
                patient.UserId
            }
        );
    }

    // PUT: api/patient/1
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePatient(
        int id,
        Patient patient)
    {
        if (id != patient.Id)
        {
            return BadRequest(new
            {
                message = "ID uygun gelmir."
            });
        }

        var existingPatient = await _context.Patients
            .FindAsync(id);

        if (existingPatient == null)
        {
            return NotFound(new
            {
                message = "Pasiyent tapilmadi."
            });
        }

        if (string.IsNullOrWhiteSpace(patient.FullName))
        {
            return BadRequest(new
            {
                message = "Pasiyentin adi bos ola bilmez."
            });
        }

        if (patient.DateOfBirth > DateTime.UtcNow)
        {
            return BadRequest(new
            {
                message = "Dogum tarixi gelecek tarix ola bilmez."
            });
        }

        existingPatient.FullName = patient.FullName;
        existingPatient.DateOfBirth = patient.DateOfBirth;
        existingPatient.Gender = patient.Gender;
        existingPatient.PhoneNumber = patient.PhoneNumber;
        existingPatient.Address = patient.Address;
        existingPatient.UserId = patient.UserId;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/patient/1
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePatient(int id)
    {
        var patient = await _context.Patients
            .FindAsync(id);

        if (patient == null)
        {
            return NotFound(new
            {
                message = "Pasiyent tapilmadi."
            });
        }

        _context.Patients.Remove(patient);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}