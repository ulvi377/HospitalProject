
using Hospital.Data;
using Hospital.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Controllers;

[ApiController]
[Route("api/[controller]")]
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
				p.Description.Contains(search) ||
				p.RecommendedSpecialty.Name.Contains(search));
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
				p.IsActive,

				RecommendedSpecialty = new
				{
					p.RecommendedSpecialty.Id,
					p.RecommendedSpecialty.Name
				}
			})
			.ToListAsync();

		return Ok(painAreas);
	}

	// GET: api/PainArea/1
	[HttpGet("{id}")]
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
				p.IsActive,

				RecommendedSpecialty = new
				{
					p.RecommendedSpecialty.Id,
					p.RecommendedSpecialty.Name
				}
			})
			.FirstOrDefaultAsync();

		if (painArea == null)
		{
			return NotFound(new
			{
				message = "Agri nahiyesi tapilmadi."
			});
		}

		return Ok(painArea);
	}

	// POST: api/PainArea
	[HttpPost]
	public async Task<IActionResult> CreatePainArea(PainArea painArea)
	{
		var specialtyExists = await _context.Specialties
			.AnyAsync(s => s.Id == painArea.RecommendedSpecialtyId);

		if (!specialtyExists)
		{
			return BadRequest(new
			{
				message = "Gosterilen ixtisas movcud deyil."
			});
		}

		if (string.IsNullOrWhiteSpace(painArea.Name))
		{
			return BadRequest(new
			{
				message = "Agri nahiyesinin adi bos ola bilmez."
			});
		}

		painArea.Name = painArea.Name.Trim();
		painArea.BodyPart = painArea.BodyPart.Trim();
		painArea.Description = painArea.Description.Trim();

		_context.PainAreas.Add(painArea);

		await _context.SaveChangesAsync();

		return CreatedAtAction(
			nameof(GetPainArea),
			new { id = painArea.Id },
			new
			{
				painArea.Id,
				painArea.Name,
				painArea.BodyPart,
				painArea.Description,
				painArea.RecommendedSpecialtyId,
				painArea.IsActive
			}
		);
	}

	// PUT: api/PainArea/1
	[HttpPut("{id}")]
	public async Task<IActionResult> UpdatePainArea(
		int id,
		PainArea painArea)
	{
		if (id != painArea.Id)
		{
			return BadRequest(new
			{
				message = "ID uygun gelmir."
			});
		}

		var existingPainArea = await _context.PainAreas
			.FindAsync(id);

		if (existingPainArea == null)
		{
			return NotFound(new
			{
				message = "Agri nahiyesi tapilmadi."
			});
		}

		var specialtyExists = await _context.Specialties
			.AnyAsync(s => s.Id == painArea.RecommendedSpecialtyId);

		if (!specialtyExists)
		{
			return BadRequest(new
			{
				message = "Gosterilen ixtisas movcud deyil."
			});
		}

		if (string.IsNullOrWhiteSpace(painArea.Name))
		{
			return BadRequest(new
			{
				message = "Agri nahiyesinin adi bos ola bilmez."
			});
		}

		existingPainArea.Name = painArea.Name.Trim();
		existingPainArea.BodyPart = painArea.BodyPart.Trim();
		existingPainArea.Description = painArea.Description.Trim();
		existingPainArea.RecommendedSpecialtyId =
			painArea.RecommendedSpecialtyId;
		existingPainArea.IsActive = painArea.IsActive;

		await _context.SaveChangesAsync();

		return NoContent();
	}

	// DELETE: api/PainArea/1
	[HttpDelete("{id}")]
	public async Task<IActionResult> DeletePainArea(int id)
	{
		var painArea = await _context.PainAreas
			.FindAsync(id);

		if (painArea == null)
		{
			return NotFound(new
			{
				message = "Agri nahiyesi tapilmadi."
			});
		}

		_context.PainAreas.Remove(painArea);

		await _context.SaveChangesAsync();

		return NoContent();
	}
}