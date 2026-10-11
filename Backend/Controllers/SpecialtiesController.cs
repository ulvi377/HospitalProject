using Hospital.Data;
using Hospital.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SpecialtiesController : ControllerBase
{
    private readonly HospitalDbContext _context;

    public SpecialtiesController(HospitalDbContext context)
    {
        _context = context;
    }

    // GET: api/specialties
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Specialty>>> GetSpecialties()
    {
        var specialties = await _context.Specialties
            .Include(s => s.Doctors)
            .ToListAsync();

        return Ok(specialties);
    }

    // GET: api/specialties/1
    [HttpGet("{id}")]
    public async Task<ActionResult<Specialty>> GetSpecialty(int id)
    {
        var specialty = await _context.Specialties
            .Include(s => s.Doctors)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (specialty == null)
        {
            return NotFound(new
            {
                message = "Specialty tapılmadı."
            });
        }

        return Ok(specialty);
    }

    // POST: api/specialties
    [HttpPost]
    public async Task<ActionResult<Specialty>> CreateSpecialty(Specialty specialty)
    {
        _context.Specialties.Add(specialty);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetSpecialty),
            new { id = specialty.Id },
            specialty
        );
    }

    // PUT: api/specialties/1
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSpecialty(
        int id,
        Specialty specialty)
    {
        if (id != specialty.Id)
        {
            return BadRequest(new
            {
                message = "ID uyğun gəlmir."
            });
        }

        var existingSpecialty = await _context.Specialties
            .FindAsync(id);

        if (existingSpecialty == null)
        {
            return NotFound(new
            {
                message = "Specialty tapılmadı."
            });
        }

        existingSpecialty.Name = specialty.Name;
        existingSpecialty.Description = specialty.Description;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/specialties/1
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSpecialty(int id)
    {
        var specialty = await _context.Specialties
            .FindAsync(id);

        if (specialty == null)
        {
            return NotFound(new
            {
                message = "Specialty tapılmadı."
            });
        }

        _context.Specialties.Remove(specialty);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}