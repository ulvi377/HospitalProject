
using System.Security.Claims;
using Hospital.Data;
using Hospital.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DoctorRatingsController : ControllerBase
{
    private readonly HospitalDbContext _context;

    public DoctorRatingsController(HospitalDbContext context)
    {
        _context = context;
    }

    private string? CurrentUserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier);

    private string? CurrentEmail =>
        User.FindFirstValue(ClaimTypes.Email)
        ?? User.FindFirstValue("email");

    // GET: api/DoctorRatings
    // Qonaqlar və bütün istifadəçilər bütün rəyləri görə bilər.
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var ratings = await _context.DoctorRatings
            .AsNoTracking()
            .Include(r => r.Doctor)
            .Include(r => r.Patient)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.AppointmentId,
                r.DoctorId,
                DoctorName = r.Doctor != null
                    ? r.Doctor.FullName
                    : "",
                PatientName = r.Patient != null
                    ? r.Patient.FullName
                    : "",
                r.Rating,
                r.Comment,
                r.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            totalRatings = ratings.Count,
            averageRating = ratings.Count == 0
                ? 0
                : Math.Round(ratings.Average(r => r.Rating), 2),
            ratings
        });
    }

    // GET: api/DoctorRatings/doctor/5
    // Müəyyən həkimin bütün rəyləri.
    [HttpGet("doctor/{doctorId:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetDoctorRatings(int doctorId)
    {
        var doctorExists = await _context.Doctors
            .AnyAsync(d => d.Id == doctorId);

        if (!doctorExists)
        {
            return NotFound(new
            {
                message = "Həkim tapılmadı."
            });
        }

        var ratings = await _context.DoctorRatings
            .AsNoTracking()
            .Where(r => r.DoctorId == doctorId)
            .Include(r => r.Doctor)
            .Include(r => r.Patient)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.AppointmentId,
                r.DoctorId,
                DoctorName = r.Doctor != null
                    ? r.Doctor.FullName
                    : "",
                PatientName = r.Patient != null
                    ? r.Patient.FullName
                    : "",
                r.Rating,
                r.Comment,
                r.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            doctorId,
            totalRatings = ratings.Count,
            averageRating = ratings.Count == 0
                ? 0
                : Math.Round(ratings.Average(r => r.Rating), 2),
            ratings
        });
    }

    // GET: api/DoctorRatings/my
    // Həkim öz rəylərini görə bilər.
    [HttpGet("my")]
    [Authorize(Roles = "Doctor")]
    public async Task<IActionResult> GetMyRatings()
    {
        var doctor = await FindCurrentDoctor();

        if (doctor == null)
        {
            return NotFound(new
            {
                message = "Həkim hesabı tapılmadı."
            });
        }

        var ratings = await _context.DoctorRatings
            .AsNoTracking()
            .Where(r => r.DoctorId == doctor.Id)
            .Include(r => r.Patient)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.AppointmentId,
                r.Rating,
                r.Comment,
                r.CreatedAt,
                PatientName = r.Patient != null
                    ? r.Patient.FullName
                    : ""
            })
            .ToListAsync();

        return Ok(new
        {
            doctorId = doctor.Id,
            doctorName = doctor.FullName,
            totalRatings = ratings.Count,
            averageRating = ratings.Count == 0
                ? 0
                : Math.Round(ratings.Average(r => r.Rating), 2),
            ratings
        });
    }

    // POST: api/DoctorRatings
    // Yalnız pasiyent öz tamamlanmış qəbuluna rəy yaza bilər.
    [HttpPost]
    [Authorize(Roles = "Patient")]
    public async Task<IActionResult> Create(
        [FromBody] CreateDoctorRatingDto dto)
    {
        if (dto.Rating < 1 || dto.Rating > 5)
        {
            return BadRequest(new
            {
                message = "Qiymət 1 ilə 5 ulduz arasında olmalıdır."
            });
        }

        if (string.IsNullOrWhiteSpace(dto.Comment)
            || dto.Comment.Trim().Length < 3
            || dto.Comment.Trim().Length > 1000)
        {
            return BadRequest(new
            {
                message = "Rəy 3–1000 simvol arasında olmalıdır."
            });
        }

        if (string.IsNullOrWhiteSpace(CurrentUserId))
        {
            return Unauthorized();
        }

        var appointment = await _context.Appointments
            .Include(a => a.Patient)
            .FirstOrDefaultAsync(a => a.Id == dto.AppointmentId);

        if (appointment == null)
        {
            return NotFound(new
            {
                message = "Qəbul tapılmadı."
            });
        }

        if (appointment.Patient == null
            || appointment.Patient.UserId != CurrentUserId)
        {
            return Forbid();
        }

        if (!string.Equals(
            appointment.Status,
            "Completed",
            StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message = "Yalnız tamamlanmış qəbulu qiymətləndirmək olar."
            });
        }

        var alreadyRated = await _context.DoctorRatings
            .AnyAsync(r => r.AppointmentId == appointment.Id);

        if (alreadyRated)
        {
            return BadRequest(new
            {
                message = "Bu qəbul artıq qiymətləndirilib."
            });
        }

        var rating = new DoctorRating
        {
            AppointmentId = appointment.Id,
            PatientId = appointment.PatientId,
            DoctorId = appointment.DoctorId,
            Rating = dto.Rating,
            Comment = dto.Comment.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.DoctorRatings.Add(rating);
        await _context.SaveChangesAsync();

        return Created(
            $"/api/DoctorRatings/{rating.Id}",
            new
            {
                message = "Rəyiniz uğurla əlavə edildi.",
                rating.Id,
                rating.AppointmentId,
                rating.DoctorId,
                rating.Rating,
                rating.Comment,
                rating.CreatedAt
            });
    }

    // GET: api/DoctorRatings/my-patient
    // Pasiyent öz yazdığı rəyləri görə bilər.
    [HttpGet("my-patient")]
    [Authorize(Roles = "Patient")]
    public async Task<IActionResult> GetMyPatientRatings()
    {
        if (string.IsNullOrWhiteSpace(CurrentUserId))
        {
            return Unauthorized();
        }

        var ratings = await _context.DoctorRatings
            .AsNoTracking()
            .Where(r => r.Patient != null &&
                        r.Patient.UserId == CurrentUserId)
            .Include(r => r.Doctor)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.AppointmentId,
                r.DoctorId,
                DoctorName = r.Doctor != null
                    ? r.Doctor.FullName
                    : "",
                r.Rating,
                r.Comment,
                r.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            totalRatings = ratings.Count,
            averageRating = ratings.Count == 0
                ? 0
                : Math.Round(ratings.Average(r => r.Rating), 2),
            ratings
        });
    }

    // DELETE: api/DoctorRatings/5
    // Rəyi yalnız admin silə bilər.
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var rating = await _context.DoctorRatings
            .FirstOrDefaultAsync(r => r.Id == id);

        if (rating == null)
        {
            return NotFound(new
            {
                message = "Rəy tapılmadı."
            });
        }

        _context.DoctorRatings.Remove(rating);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Rəy silindi."
        });
    }

    private async Task<Doctor?> FindCurrentDoctor()
    {
        var userId = CurrentUserId;
        var email = CurrentEmail;

        if (string.IsNullOrWhiteSpace(userId)
            && string.IsNullOrWhiteSpace(email))
        {
            return null;
        }

        if (!string.IsNullOrWhiteSpace(userId))
        {
            var doctor = await _context.Doctors
                .FirstOrDefaultAsync(d =>
                    d.ApplicationUserId == userId);

            if (doctor != null)
            {
                return doctor;
            }
        }

        if (!string.IsNullOrWhiteSpace(email))
        {
            return await _context.Doctors
                .FirstOrDefaultAsync(d => d.Email == email);
        }

        return null;
    }
}

public class CreateDoctorRatingDto
{
    public int AppointmentId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
}
