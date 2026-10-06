using Hospital.Data;
using Hospital.Interfaces;
using Hospital.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Doctor")]
public class DoctorsController : ControllerBase
{
    private readonly HospitalDbContext _context;
    private readonly ICloudinaryService _cloudinaryService;

    public DoctorsController(
        HospitalDbContext context,
        ICloudinaryService cloudinaryService)
    {
        _context = context;
        _cloudinaryService = cloudinaryService;
    }

    // GET: api/doctors
    // Admin + Doctor
    [HttpGet]
    public async Task<IActionResult> GetDoctors(
        [FromQuery] string? search,
        [FromQuery] string? specialty,
        [FromQuery] bool? isActive)
    {
        var query = _context.Doctors
            .Include(d => d.Specialty)
            .AsQueryable();

        // Search
        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();

            query = query.Where(d =>
                d.FullName.Contains(search) ||
                d.Email.Contains(search) ||
                d.PhoneNumber.Contains(search) ||
                (d.Specialty != null &&
                 d.Specialty.Name.Contains(search)));
        }

        // Specialty filter
        if (!string.IsNullOrWhiteSpace(specialty))
        {
            specialty = specialty.Trim();

            query = query.Where(d =>
                d.Specialty != null &&
                d.Specialty.Name.Contains(specialty));
        }

        // Active status filter
        if (isActive.HasValue)
        {
            query = query.Where(d =>
                d.IsActive == isActive.Value);
        }

        var doctors = await query
            .Select(d => new
            {
                d.Id,
                d.FullName,
                d.Email,
                d.PhoneNumber,
                d.ImageUrl,
                d.SpecialtyId,
                Specialty = d.Specialty == null
                    ? null
                    : new
                    {
                        d.Specialty.Id,
                        d.Specialty.Name,
                        d.Specialty.Description
                    },
                d.IsActive
            })
            .ToListAsync();

        return Ok(doctors);
    }

    // GET: api/doctors/1
    // Admin + Doctor
    [HttpGet("{id}")]
    public async Task<IActionResult> GetDoctor(int id)
    {
        var doctor = await _context.Doctors
            .Include(d => d.Specialty)
            .Where(d => d.Id == id)
            .Select(d => new
            {
                d.Id,
                d.FullName,
                d.Email,
                d.PhoneNumber,
                d.ImageUrl,
                d.SpecialtyId,
                Specialty = d.Specialty == null
                    ? null
                    : new
                    {
                        d.Specialty.Id,
                        d.Specialty.Name,
                        d.Specialty.Description
                    },
                d.IsActive
            })
            .FirstOrDefaultAsync();

        if (doctor == null)
        {
            return NotFound(new
            {
                message = "Hekim tapilmadi."
            });
        }

        return Ok(doctor);
    }

    // POST: api/doctors
    // Yalniz Admin
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<Doctor>> CreateDoctor(
        Doctor doctor)
    {
        var specialtyExists = await _context.Specialties
            .AnyAsync(s => s.Id == doctor.SpecialtyId);

        if (!specialtyExists)
        {
            return BadRequest(new
            {
                message = "Gosterilen Specialty movcud deyil."
            });
        }

        _context.Doctors.Add(doctor);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetDoctor),
            new { id = doctor.Id },
            doctor);
    }

    // PUT: api/doctors/1
    // Yalniz Admin
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDoctor(
        int id,
        Doctor doctor)
    {
        if (id != doctor.Id)
        {
            return BadRequest(new
            {
                message = "ID uygun gelmir."
            });
        }

        var existingDoctor = await _context.Doctors
            .FindAsync(id);

        if (existingDoctor == null)
        {
            return NotFound(new
            {
                message = "Hekim tapilmadi."
            });
        }

        var specialtyExists = await _context.Specialties
            .AnyAsync(s => s.Id == doctor.SpecialtyId);

        if (!specialtyExists)
        {
            return BadRequest(new
            {
                message = "Gosterilen Specialty movcud deyil."
            });
        }

        existingDoctor.FullName = doctor.FullName;
        existingDoctor.Email = doctor.Email;
        existingDoctor.PhoneNumber = doctor.PhoneNumber;
        existingDoctor.ImageUrl = doctor.ImageUrl;
        existingDoctor.SpecialtyId = doctor.SpecialtyId;
        existingDoctor.IsActive = doctor.IsActive;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/doctors/{id}/image
    // Yalniz Admin
    [Authorize(Roles = "Admin")]
    [HttpPost("{id}/image")]
    public async Task<IActionResult> UploadDoctorImage(
        int id,
        IFormFile file)
    {
        var doctor = await _context.Doctors
            .FirstOrDefaultAsync(d => d.Id == id);

        if (doctor == null)
        {
            return NotFound(new
            {
                message = "Hekim tapilmadi."
            });
        }

        if (file == null || file.Length == 0)
        {
            return BadRequest(new
            {
                message = "Sekil fayli secilmelidir."
            });
        }

        var allowedExtensions = new[]
        {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        };

        var extension = Path
            .GetExtension(file.FileName)
            .ToLowerInvariant();

        if (!allowedExtensions.Contains(extension))
        {
            return BadRequest(new
            {
                message =
                    "Yalniz JPG, JPEG, PNG ve WEBP formatlari desteklenir."
            });
        }

        const long maxFileSize = 5 * 1024 * 1024;

        if (file.Length > maxFileSize)
        {
            return BadRequest(new
            {
                message =
                    "Sekilin olcusu maksimum 5 MB ola biler."
            });
        }

        try
        {
            var imageUrl = await _cloudinaryService
                .UploadImageAsync(file);

            doctor.ImageUrl = imageUrl;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Hekimin sekli ugurla yuklendi.",
                doctorId = doctor.Id,
                imageUrl = doctor.ImageUrl
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message =
                    "Sekil yuklenmesi zamani xeta bas verdi.",
                error = ex.Message
            });
        }
    }

    // DELETE: api/doctors/1
    // Yalniz Admin
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDoctor(int id)
    {
        var doctor = await _context.Doctors
            .FindAsync(id);

        if (doctor == null)
        {
            return NotFound(new
            {
                message = "Hekim tapilmadi."
            });
        }

        _context.Doctors.Remove(doctor);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}