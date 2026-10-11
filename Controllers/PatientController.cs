
using System.Security.Claims;
using Hospital.Data;
using Hospital.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PatientController : ControllerBase
{
    private readonly HospitalDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public PatientController(
        HospitalDbContext context,
        UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    // GET: api/Patient
    // Admin ve Doctor: yalniz Patient rolundaki profiller
    // Patient: yalniz oz profili
    [Authorize(Roles = "Admin,Patient,Doctor")]
    [HttpGet]
    public async Task<IActionResult> GetPatients()
    {
        var currentUserId = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        var isAdmin = User.IsInRole("Admin");
        var isDoctor = User.IsInRole("Doctor");

        var query = _context.Patients.AsQueryable();

        if (!isAdmin && !isDoctor)
        {
            query = query.Where(p => p.UserId == currentUserId);
        }

        var patientRows = await query
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

        var result = new List<object>();

        foreach (var patient in patientRows)
        {
            if (string.IsNullOrWhiteSpace(patient.UserId))
                continue;

            var user = await _userManager.FindByIdAsync(
                patient.UserId);

            if (user == null)
                continue;

            var roles = await _userManager.GetRolesAsync(user);

            if (!roles.Contains(
                "Patient",
                StringComparer.OrdinalIgnoreCase))
            {
                continue;
            }

            result.Add(new
            {
                patient.Id,
                patient.FullName,
                patient.DateOfBirth,
                patient.Gender,
                patient.PhoneNumber,
                patient.Address,
                patient.UserId,
                UserRole = "Patient"
            });
        }

        return Ok(result);
    }

    // GET: api/Patient/1
    // Admin: yalniz Patient rolundaki profili gore biler
    // Patient: yalniz oz profilini gore biler
    [Authorize(Roles = "Admin,Patient")]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetPatient(int id)
    {
        var currentUserId = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        var isAdmin = User.IsInRole("Admin");

        var patient = await _context.Patients
            .FirstOrDefaultAsync(p => p.Id == id);

        if (patient == null)
        {
            return NotFound(new
            {
                message = "Pasiyent tapilmadi."
            });
        }

        if (!isAdmin && patient.UserId != currentUserId)
        {
            return Forbid();
        }

        if (string.IsNullOrWhiteSpace(patient.UserId))
        {
            return NotFound(new
            {
                message = "Pasiyentin istifadeci hesabi yoxdur."
            });
        }

        var user = await _userManager.FindByIdAsync(
            patient.UserId);

        if (user == null)
        {
            return NotFound(new
            {
                message = "Pasiyentin istifadeci hesabi tapilmadi."
            });
        }

        var roles = await _userManager.GetRolesAsync(user);

        if (!roles.Contains(
            "Patient",
            StringComparer.OrdinalIgnoreCase))
        {
            return NotFound(new
            {
                message = "Bu profil Patient roluna aid deyil."
            });
        }

        return Ok(new
        {
            patient.Id,
            patient.FullName,
            patient.DateOfBirth,
            patient.Gender,
            patient.PhoneNumber,
            patient.Address,
            patient.UserId,
            UserRole = "Patient"
        });
    }

    // POST: api/Patient
    // Admin yeni Patient profili yarada biler.
    // Patient oz hesabina profil yarada biler.
    [Authorize(Roles = "Admin,Patient")]
    [HttpPost]
    public async Task<IActionResult> CreatePatient(
        [FromBody] Patient patient)
    {
        if (string.IsNullOrWhiteSpace(patient.FullName))
        {
            return BadRequest(new
            {
                message = "Pasiyentin adi bos ola bilmez."
            });
        }

        if (patient.DateOfBirth.HasValue &&
            patient.DateOfBirth.Value.Date > DateTime.UtcNow.Date)
        {
            return BadRequest(new
            {
                message = "Dogum tarixi gelecek tarix ola bilmez."
            });
        }

        var currentUserId = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        var isAdmin = User.IsInRole("Admin");

        if (!isAdmin)
        {
            patient.UserId = currentUserId;
        }
        else if (string.IsNullOrWhiteSpace(patient.UserId))
        {
            return BadRequest(new
            {
                message = "Admin yeni profil ucun UserId gondermelidir."
            });
        }

        if (string.IsNullOrWhiteSpace(patient.UserId))
        {
            return BadRequest(new
            {
                message = "Istifadeci hesabini teyin etmek lazimdir."
            });
        }

        var user = await _userManager.FindByIdAsync(
            patient.UserId);

        if (user == null)
        {
            return BadRequest(new
            {
                message = "Istifadeci hesabi tapilmadi."
            });
        }

        var roles = await _userManager.GetRolesAsync(user);

        if (!roles.Contains(
            "Patient",
            StringComparer.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message = "Yalniz Patient rolundaki istifadeci ucun profil yaradilabilir."
            });
        }

        var existingPatient = await _context.Patients
            .AnyAsync(p => p.UserId == patient.UserId);

        if (existingPatient)
        {
            return BadRequest(new
            {
                message = "Bu istifadeci ucun Patient profili artiq movcuddur."
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
                patient.UserId,
                UserRole = "Patient"
            });
    }

    // PUT: api/Patient/1
    // Admin istediyi Patient profilini deyise biler.
    // Patient yalniz oz profilini deyise biler.
    [Authorize(Roles = "Admin,Patient")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdatePatient(
        int id,
        [FromBody] Patient patient)
    {
        if (id != patient.Id)
        {
            return BadRequest(new
            {
                message = "ID uygun gelmir."
            });
        }

        if (string.IsNullOrWhiteSpace(patient.FullName))
        {
            return BadRequest(new
            {
                message = "Pasiyentin adi bos ola bilmez."
            });
        }

        if (patient.DateOfBirth.HasValue &&
            patient.DateOfBirth.Value.Date > DateTime.UtcNow.Date)
        {
            return BadRequest(new
            {
                message = "Dogum tarixi gelecek tarix ola bilmez."
            });
        }

        var existingPatient = await _context.Patients
            .FirstOrDefaultAsync(p => p.Id == id);

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

        if (!isAdmin &&
            existingPatient.UserId != currentUserId)
        {
            return Forbid();
        }

        // Profilin basqa hesaba kecirilmesine icaze verilmir.
        if (!isAdmin &&
            patient.UserId != null &&
            patient.UserId != existingPatient.UserId)
        {
            return Forbid();
        }

        // Admin de yalniz Patient rolundaki hesaba baglaya biler.
        if (isAdmin &&
            !string.IsNullOrWhiteSpace(patient.UserId))
        {
            var user = await _userManager.FindByIdAsync(
                patient.UserId);

            if (user == null)
            {
                return BadRequest(new
                {
                    message = "Istifadeci hesabi tapilmadi."
                });
            }

            var roles = await _userManager.GetRolesAsync(user);

            if (!roles.Contains(
                "Patient",
                StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message = "Profil yalniz Patient rolundaki hesaba baglana biler."
                });
            }

            var duplicate = await _context.Patients.AnyAsync(
                p => p.UserId == patient.UserId && p.Id != id);

            if (duplicate)
            {
                return BadRequest(new
                {
                    message = "Bu istifadeci ucun basqa Patient profili movcuddur."
                });
            }

            existingPatient.UserId = patient.UserId;
        }

        existingPatient.FullName = patient.FullName;
        existingPatient.DateOfBirth = patient.DateOfBirth;
        existingPatient.Gender = patient.Gender;
        existingPatient.PhoneNumber = patient.PhoneNumber;
        existingPatient.Address = patient.Address;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/Patient/1
    // Yalniz Admin
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeletePatient(int id)
    {
        var patient = await _context.Patients
            .FirstOrDefaultAsync(p => p.Id == id);

        if (patient == null)
        {
            return NotFound(new
            {
                message = "Pasiyent tapilmadi."
            });
        }

        var user = !string.IsNullOrWhiteSpace(patient.UserId)
            ? await _userManager.FindByIdAsync(patient.UserId)
            : null;

        if (user != null)
        {
            var roles = await _userManager.GetRolesAsync(user);

            if (!roles.Contains(
                "Patient",
                StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message = "Patient rolunda olmayan profil siline bilmez."
                });
            }
        }

        _context.Patients.Remove(patient);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}
