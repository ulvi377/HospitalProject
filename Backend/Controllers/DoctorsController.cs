
using Hospital.Data;
using Hospital.Interfaces;
using Hospital.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text;

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

    private static string CreateSlug(string value)
    {
        value = value.Trim().ToLowerInvariant();

        value = value
            .Replace("ə", "e")
            .Replace("ı", "i")
            .Replace("ö", "o")
            .Replace("ü", "u")
            .Replace("ğ", "g")
            .Replace("ş", "s")
            .Replace("ç", "c");

        var result = new StringBuilder();
        var previousWasDash = false;

        foreach (var c in value)
        {
            if (char.IsLetterOrDigit(c))
            {
                result.Append(c);
                previousWasDash = false;
            }
            else if (!previousWasDash && result.Length > 0)
            {
                result.Append('-');
                previousWasDash = true;
            }
        }

        return result.ToString().Trim('-');
    }

    private async Task<string> GenerateUniqueSlugAsync(
        string fullName,
        int? excludeDoctorId = null)
    {
        var baseSlug = CreateSlug(fullName);

        if (string.IsNullOrWhiteSpace(baseSlug))
        {
            baseSlug = "doctor";
        }

        var slug = baseSlug;
        var number = 2;

        while (await _context.Doctors.AnyAsync(d =>
            d.Slug == slug &&
            (!excludeDoctorId.HasValue ||
             d.Id != excludeDoctorId.Value)))
        {
            slug = $"{baseSlug}-{number}";
            number++;
        }

        return slug;
    }

    private static object MapDoctor(Doctor d)
    {
        return new
        {
            d.Id,
            d.FullName,
            d.Slug,
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
        };
    }

    // GET: api/Doctors
    // Admin butun hekimleri, diger istifadeciler aktiv hekimleri gorur.
    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetDoctors(
        [FromQuery] string? search,
        [FromQuery] string? specialty,
        [FromQuery] bool? isActive)
    {
        var query = _context.Doctors
            .Include(d => d.Specialty)
            .AsQueryable();

        if (!User.IsInRole("Admin"))
        {
            query = query.Where(d => d.IsActive);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();

            query = query.Where(d =>
                d.FullName.Contains(search) ||
                d.Email.Contains(search) ||
                d.PhoneNumber.Contains(search) ||
                d.Slug.Contains(search) ||
                (d.Specialty != null &&
                 d.Specialty.Name.Contains(search)));
        }

        if (isActive.HasValue)
        {
            query = query.Where(d =>
                d.IsActive == isActive.Value);
        }

        var doctors = await query
            .OrderBy(d => d.FullName)
            .Select(d => new
            {
                d.Id,
                d.FullName,
                d.Slug,
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

    // GET: api/Doctors/by-slug/dr-elvin-aliyev
    [AllowAnonymous]
    [HttpGet("by-slug/{slug}")]
    public async Task<IActionResult> GetDoctorBySlug(string slug)
    {
        var query = _context.Doctors
            .Include(d => d.Specialty)
            .Where(d => d.Slug == slug);

        if (!User.IsInRole("Admin"))
        {
            query = query.Where(d => d.IsActive);
        }

        var doctor = await query.FirstOrDefaultAsync();

        if (doctor == null)
        {
            return NotFound(new
            {
                message = "Hekim tapilmadi."
            });
        }

        return Ok(MapDoctor(doctor));
    }

    // GET: api/Doctors/1
    [AllowAnonymous]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetDoctor(int id)
    {
        var query = _context.Doctors
            .Include(d => d.Specialty)
            .Where(d => d.Id == id);

        if (!User.IsInRole("Admin"))
        {
            query = query.Where(d => d.IsActive);
        }

        var doctor = await query.FirstOrDefaultAsync();

        if (doctor == null)
        {
            return NotFound(new
            {
                message = "Hekim tapilmadi."
            });
        }

        return Ok(MapDoctor(doctor));
    }

    // POST: api/Doctors
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateDoctor(
        [FromBody] Doctor doctor)
    {
        if (string.IsNullOrWhiteSpace(doctor.FullName))
        {
            return BadRequest(new
            {
                message = "Hekimin adi bos ola bilmez."
            });
        }

        var specialtyExists = await _context.Specialties
            .AnyAsync(s => s.Id == doctor.SpecialtyId);

        if (!specialtyExists)
        {
            return BadRequest(new
            {
                message = "Gosterilen ixtisas movcud deyil."
            });
        }

        doctor.Id = 0;
        doctor.FullName = doctor.FullName.Trim();
        doctor.Slug = await GenerateUniqueSlugAsync(
            doctor.FullName);

        _context.Doctors.Add(doctor);

        await _context.SaveChangesAsync();

        await _context.Entry(doctor)
            .Reference(d => d.Specialty)
            .LoadAsync();

        return CreatedAtAction(
            nameof(GetDoctorBySlug),
            new { slug = doctor.Slug },
            MapDoctor(doctor));
    }

    
// PUT: api/Doctors/1
[Authorize(Roles = "Admin,Doctor")]
[HttpPut("{id:int}")]
public async Task<IActionResult> UpdateDoctor(
    int id,
    [FromBody] Doctor doctor)
    {
        if (id != doctor.Id)
        {
            return BadRequest(new
            {
                message = "ID uygun gelmir."
            });
        }

        var existingDoctor = await _context.Doctors
            .FirstOrDefaultAsync(d => d.Id == id);

        if (existingDoctor == null)
        {
            return NotFound(new
            {
                message = "Hekim tapilmadi."
            });
        }

        if (!User.IsInRole("Admin"))
        {
            var userId = User.FindFirst(
                ClaimTypes.NameIdentifier)?.Value;

            var email = User.FindFirst(
                ClaimTypes.Email)?.Value
                ?? User.FindFirst("email")?.Value;

            var isOwnProfile =
                (!string.IsNullOrWhiteSpace(existingDoctor.ApplicationUserId)
                 && !string.IsNullOrWhiteSpace(userId)
                 && existingDoctor.ApplicationUserId == userId)
                ||
                (!string.IsNullOrWhiteSpace(email)
                 && string.Equals(
                     existingDoctor.Email,
                     email,
                     StringComparison.OrdinalIgnoreCase));

            if (!isOwnProfile)
            {
                return Forbid();
            }
        }

        if (!existingDoctor.IsActive)
        {
            return BadRequest(new
            {
                message = "Deaktiv hekim redakte edile bilmez."
            });
        }

        if (string.IsNullOrWhiteSpace(doctor.FullName))
        {
            return BadRequest(new
            {
                message = "Hekimin adi bos ola bilmez."
            });
        }

        if (User.IsInRole("Admin"))
        {
            var specialtyExists = await _context.Specialties
                .AnyAsync(s => s.Id == doctor.SpecialtyId);

            if (!specialtyExists)
            {
                return BadRequest(new
                {
                    message = "Gosterilen ixtisas movcud deyil."
                });
            }

            existingDoctor.SpecialtyId = doctor.SpecialtyId;
        }

        var nameChanged = !string.Equals(
            existingDoctor.FullName.Trim(),
            doctor.FullName.Trim(),
            StringComparison.OrdinalIgnoreCase);

        existingDoctor.FullName = doctor.FullName.Trim();
        existingDoctor.Email = doctor.Email;
        existingDoctor.PhoneNumber = doctor.PhoneNumber;

        // URL daxil edilibse, sekil linkini de yenile.
        if (User.IsInRole("Admin") &&
            doctor.ImageUrl != null &&
            !string.IsNullOrWhiteSpace(doctor.ImageUrl))
        {
            var imageUrl = doctor.ImageUrl.Trim();

            if (!Uri.TryCreate(
                imageUrl,
                UriKind.Absolute,
                out var parsedUri) ||
                (parsedUri.Scheme != Uri.UriSchemeHttp &&
                 parsedUri.Scheme != Uri.UriSchemeHttps))
            {
                return BadRequest(new
                {
                    message = "Sekil URL-i duzgun HTTP/HTTPS linki olmalidir."
                });
            }

            existingDoctor.ImageUrl = imageUrl;
        }

        if (nameChanged ||
            string.IsNullOrWhiteSpace(existingDoctor.Slug))
        {
            existingDoctor.Slug =
                await GenerateUniqueSlugAsync(
                    existingDoctor.FullName,
                    existingDoctor.Id);
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Hekim melumatlari yenilendi.",
            id = existingDoctor.Id,
            slug = existingDoctor.Slug,
            imageUrl = existingDoctor.ImageUrl
        });
    }


    // POST: api/Doctors/generate-slugs
    [Authorize(Roles = "Admin")]
    [HttpPost("generate-slugs")]
    public async Task<IActionResult> GenerateDoctorSlugs()
    {
        var doctors = await _context.Doctors
            .OrderBy(d => d.Id)
            .ToListAsync();

        var updatedCount = 0;

        foreach (var doctor in doctors)
        {
            if (string.IsNullOrWhiteSpace(doctor.Slug))
            {
                doctor.Slug = await GenerateUniqueSlugAsync(
                    doctor.FullName,
                    doctor.Id);

                updatedCount++;
            }
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Slug emeliyyati tamamlandi.",
            updatedCount,
            doctors = doctors.Select(d => new
            {
                d.Id,
                d.FullName,
                d.Slug,
                d.IsActive
            })
        });
    }

    // POST: api/Doctors/1/image
    [Authorize(Roles = "Admin,Doctor")]
    [HttpPost("{id:int}/image")]
    [Consumes("multipart/form-data")]
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

        if (!doctor.IsActive)
        {
            return BadRequest(new
            {
                message = "Deaktiv hekim ucun sekil deyisdirile bilmez."
            });
        }

        if (!User.IsInRole("Admin"))
        {
            var userId = User.FindFirst(
                ClaimTypes.NameIdentifier)?.Value;

            var email = User.FindFirst(
                ClaimTypes.Email)?.Value
                ?? User.FindFirst("email")?.Value;

            var isOwnProfile =
                (!string.IsNullOrWhiteSpace(
                    doctor.ApplicationUserId)
                 && !string.IsNullOrWhiteSpace(userId)
                 && doctor.ApplicationUserId == userId)
                ||
                (!string.IsNullOrWhiteSpace(email)
                 && string.Equals(
                     doctor.Email,
                     email,
                     StringComparison.OrdinalIgnoreCase));

            if (!isOwnProfile)
            {
                return Forbid();
            }
        }

        if (file == null || file.Length == 0)
        {
            return BadRequest(new
            {
                message = "Sekil fayli secilmelidir."
            });
        }

        const long maxFileSize = 5 * 1024 * 1024;

        if (file.Length > maxFileSize)
        {
            return BadRequest(new
            {
                message = "Sekilin olcusu maksimum 5 MB ola biler."
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
        catch
        {
            return StatusCode(500, new
            {
                message =
                    "Sekil yuklenmesi zamani xeta bas verdi."
            });
        }
    }

    // DELETE: api/Doctors/1
    // Hekim fiziki silinmir; tibbi tarixceler qorunur.
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteDoctor(int id)
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

        if (!doctor.IsActive)
        {
            return Ok(new
            {
                message = "Hekim artiq deaktiv edilib.",
                id = doctor.Id,
                isActive = false
            });
        }

        doctor.IsActive = false;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message =
                "Hekim deaktiv edildi. Tibbi tarixceler qorunur.",
            id = doctor.Id,
            isActive = false
        });
    }
}
