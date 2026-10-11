
using Hospital.Data;
using Hospital.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Doctor,Patient")]
public class PainAreaController : ControllerBase
{
    private readonly HospitalDbContext _context;

    public PainAreaController(HospitalDbContext context)
    {
        _context = context;
    }

    // GET: api/PainArea
    [HttpGet]
    public async Task<IActionResult> GetPainAreas(
        [FromQuery] string? search,
        [FromQuery] string? bodyPart,
        [FromQuery] bool? isActive)
    {
        var query = _context.PainAreas
            .Include(p => p.RecommendedSpecialty)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();

            query = query.Where(p =>
                p.Name.Contains(search) ||
                p.BodyPart.Contains(search) ||
                p.Description.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(bodyPart))
        {
            bodyPart = bodyPart.Trim();

            query = query.Where(p =>
                p.BodyPart.Contains(bodyPart));
        }

        if (isActive.HasValue)
        {
            query = query.Where(p =>
                p.IsActive == isActive.Value);
        }

        var painAreas = await query
            .OrderBy(p => p.Name)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.BodyPart,
                p.Description,
                p.RecommendedSpecialtyId,

                RecommendedSpecialty =
                    p.RecommendedSpecialty == null
                        ? null
                        : new
                        {
                            p.RecommendedSpecialty.Id,
                            p.RecommendedSpecialty.Name,
                            p.RecommendedSpecialty.Description
                        },

                p.IsActive
            })
            .ToListAsync();

        return Ok(painAreas);
    }

    // GET: api/PainArea/1
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetPainArea(int id)
    {
        var painArea = await _context.PainAreas
            .Include(p => p.RecommendedSpecialty)
            .Where(p => p.Id == id)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.BodyPart,
                p.Description,
                p.RecommendedSpecialtyId,

                RecommendedSpecialty =
                    p.RecommendedSpecialty == null
                        ? null
                        : new
                        {
                            p.RecommendedSpecialty.Id,
                            p.RecommendedSpecialty.Name,
                            p.RecommendedSpecialty.Description
                        },

                p.IsActive
            })
            .FirstOrDefaultAsync();

        if (painArea == null)
        {
            return NotFound(new
            {
                message = "Ağrı nahiyəsi tapılmadı."
            });
        }

        return Ok(painArea);
    }

    // POST: api/PainArea
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreatePainArea(
        PainArea painArea)
    {
        if (string.IsNullOrWhiteSpace(painArea.Name))
        {
            return BadRequest(new
            {
                message = "Ağrı nahiyəsinin adı boş ola bilməz."
            });
        }

        if (string.IsNullOrWhiteSpace(painArea.BodyPart))
        {
            return BadRequest(new
            {
                message = "BodyPart boş ola bilməz."
            });
        }

        var specialtyExists = await _context.Specialties
            .AnyAsync(s =>
                s.Id == painArea.RecommendedSpecialtyId);

        if (!specialtyExists)
        {
            return BadRequest(new
            {
                message =
                    "Göstərilən Specialty mövcud deyil."
            });
        }

        _context.PainAreas.Add(painArea);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetPainArea),
            new { id = painArea.Id },
            painArea);
    }

    // PUT: api/PainArea/1
    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdatePainArea(
        int id,
        PainArea painArea)
    {
        if (id != painArea.Id)
        {
            return BadRequest(new
            {
                message = "ID uyğun gəlmir."
            });
        }

        var existingPainArea = await _context.PainAreas
            .FindAsync(id);

        if (existingPainArea == null)
        {
            return NotFound(new
            {
                message = "Ağrı nahiyəsi tapılmadı."
            });
        }

        if (string.IsNullOrWhiteSpace(painArea.Name))
        {
            return BadRequest(new
            {
                message = "Ağrı nahiyəsinin adı boş ola bilməz."
            });
        }

        if (string.IsNullOrWhiteSpace(painArea.BodyPart))
        {
            return BadRequest(new
            {
                message = "BodyPart boş ola bilməz."
            });
        }

        var specialtyExists = await _context.Specialties
            .AnyAsync(s =>
                s.Id == painArea.RecommendedSpecialtyId);

        if (!specialtyExists)
        {
            return BadRequest(new
            {
                message =
                    "Göstərilən Specialty mövcud deyil."
            });
        }

        existingPainArea.Name = painArea.Name;
        existingPainArea.BodyPart = painArea.BodyPart;
        existingPainArea.Description = painArea.Description;
        existingPainArea.RecommendedSpecialtyId =
            painArea.RecommendedSpecialtyId;
        existingPainArea.IsActive = painArea.IsActive;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/PainArea/1
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeletePainArea(int id)
    {
        var painArea = await _context.PainAreas
            .FindAsync(id);

        if (painArea == null)
        {
            return NotFound(new
            {
                message = "Ağrı nahiyəsi tapılmadı."
            });
        }

        var hasAssessments = await _context.PainAssessments
            .AnyAsync(p =>
                p.PainAreaId == id);

        if (hasAssessments)
        {
            return BadRequest(new
            {
                message =
                    "Bu ağrı nahiyəsinə aid qiymətləndirmələr mövcuddur. Silmək əvəzinə IsActive=false edin."
            });
        }

        _context.PainAreas.Remove(painArea);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}
