
using System.Security.Claims;
using Hospital.Data;
using Hospital.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewController : ControllerBase
{
    private readonly HospitalDbContext _context;

    public ReviewController(HospitalDbContext context)
    {
        _context = context;
    }

    // GET: api/Review
    // Yalnız admin bütün rəyləri görə bilər.
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var reviews = await _context.Reviews
            .AsNoTracking()
            .Include(r => r.Doctor)
            .Include(r => r.Patient)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.DoctorId,
                doctorName = r.Doctor!.FullName,
                r.PatientId,
                patientName = r.Patient!.FullName,
                r.Rating,
                r.Comment,
                r.CreatedAt
            })
            .ToListAsync();

        return Ok(reviews);
    }

    // GET: api/Review/doctor/1
    // Həkimin rəylərini hamı görə bilər.
    [HttpGet("doctor/{doctorId:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByDoctor(int doctorId)
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

        var reviews = await _context.Reviews
            .AsNoTracking()
            .Where(r => r.DoctorId == doctorId)
            .Include(r => r.Patient)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.DoctorId,
                patientName = r.Patient!.FullName,
                r.Rating,
                r.Comment,
                r.CreatedAt
            })
            .ToListAsync();

        var averageRating = reviews.Count == 0
            ? 0
            : Math.Round(reviews.Average(r => r.Rating), 1);

        return Ok(new
        {
            averageRating,
            totalReviews = reviews.Count,
            reviews
        });
    }

    // POST: api/Review
    [HttpPost]
    [Authorize(Roles = "Patient")]
    public async Task<IActionResult> Create(
        CreateReviewRequest request)
    {
        if (request.Rating < 1 || request.Rating > 5)
        {
            return BadRequest(new
            {
                message = "Reytinq 1 ile 5 arasinda olmalidir."
            });
        }

        if (string.IsNullOrWhiteSpace(request.Comment) ||
            request.Comment.Trim().Length < 3)
        {
            return BadRequest(new
            {
                message = "Rey en azi 3 simvol olmalidir."
            });
        }

        if (request.Comment.Trim().Length > 1000)
        {
            return BadRequest(new
            {
                message = "Rey 1000 simvoldan cox ola bilmez."
            });
        }

        var doctorExists = await _context.Doctors
            .AnyAsync(d => d.Id == request.DoctorId && d.IsActive);

        if (!doctorExists)
        {
            return NotFound(new
            {
                message = "Aktiv hekim tapilmadi."
            });
        }

        var userId = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var patient = await _context.Patients
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (patient == null)
        {
            return BadRequest(new
            {
                message =
                    "Hesabiniz xeste profili ile elaqelendirilmeyib."
            });
        }

        var review = new Review
        {
            DoctorId = request.DoctorId,
            PatientId = patient.Id,
            Rating = request.Rating,
            Comment = request.Comment.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Rey ugurla elave edildi.",
            review.Id,
            review.DoctorId,
            review.PatientId,
            review.Rating,
            review.Comment,
            review.CreatedAt
        });
    }

    // DELETE: api/Review/1
    // Rəyi yalnız admin silə bilər.
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var review = await _context.Reviews
            .FirstOrDefaultAsync(r => r.Id == id);

        if (review == null)
        {
            return NotFound(new
            {
                message = "Rey tapilmadi."
            });
        }

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Rey ugurla silindi."
        });
    }
}

public class CreateReviewRequest
{
    public int DoctorId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
}
