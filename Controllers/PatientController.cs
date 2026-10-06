using System.Security.Claims;
using Hospital.Data;
using Hospital.Models;
using Microsoft.AspNetCore.Authorization;
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
    // Admin -> butun patientler
    // Patient -> yalniz oz profili
    [Authorize(Roles = "Admin,Patient")]
    [HttpGet]
    public async Task<IActionResult> GetPatients()
    {
        var currentUserId = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        var isAdmin = User.IsInRole("Admin");

        var query = _context.Patients
            .AsQueryable();

        if (!isAdmin)
        {
            query = query.Where(p =>
                p.UserId == currentUserId);
        }

        var patients = await query
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
    // Admin -> istediyi patient
    // Patient -> yalniz oz profili
    [Authorize(Roles = "Admin,Patient")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPatient(int id)
    {
        var currentUserId = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        var isAdmin = User.IsInRole("Admin");

        var query = _context.Patients
            .Where(p => p.Id == id);

        if (!isAdmin)
        {
            query = query.Where(p =>
                p.UserId == currentUserId);
        }

        var patient = await query
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
    // Admin + Patient
    [Authorize(Roles = "Admin,Patient")]
    [HttpPost]
    public async Task<IActionResult> CreatePatient(
        Patient patient)
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
                message =
                    "Dogum tarixi gelecek tarix ola bilmez."
            });
        }

        var currentUserId = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        var isAdmin = User.IsInRole("Admin");

        // Patient ucun UserId JWT-den goturulur.
        if (!isAdmin)
        {
            patient.UserId = currentUserId;
        }

        // Patient basqa UserId gondere bilmez.
        if (!isAdmin &&
            patient.UserId != currentUserId)
        {
            return Forbid();
        }

        // Eyni user ucun ikinci Patient profili yaratilmasin.
        if (!string.IsNullOrWhiteSpace(patient.UserId))
        {
            var existingPatient = await _context.Patients
                .AnyAsync(p => p.UserId == patient.UserId);

            if (existingPatient)
            {
                return BadRequest(new
                {
                    message =
                        "Bu istifadeci ucun artiq Patient profili movcuddur."
                });
            }
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
    // Admin -> istediyi patient
    // Patient -> yalniz oz profili
    [Authorize(Roles = "Admin,Patient")]
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

        var currentUserId = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        var isAdmin = User.IsInRole("Admin");

        // Patient yalniz oz profilini deyise biler.
        if (!isAdmin &&
            existingPatient.UserId != currentUserId)
        {
            return Forbid();
        }

        if (string.IsNullOrWhiteSpace(patient.FullName))
        {
            return BadRequest(new
            {
                message =
                    "Pasiyentin adi bos ola bilmez."
            });
        }

        if (patient.DateOfBirth > DateTime.UtcNow)
        {
            return BadRequest(new
            {
                message =
                    "Dogum tarixi gelecek tarix ola bilmez."
            });
        }

        existingPatient.FullName = patient.FullName;
        existingPatient.DateOfBirth = patient.DateOfBirth;
        existingPatient.Gender = patient.Gender;
        existingPatient.PhoneNumber = patient.PhoneNumber;
        existingPatient.Address = patient.Address;

        // UserId-ni yalniz Admin deyise biler.
        if (isAdmin)
        {
            existingPatient.UserId = patient.UserId;
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/patient/1
    // Yalniz Admin
    [Authorize(Roles = "Admin")]
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