using Hospital.Data;
using Hospital.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DoctorsController : ControllerBase
{
    private readonly HospitalDbContext _context;

    public DoctorsController(HospitalDbContext context)
    {
        _context = context;
    }

    // GET: api/doctors
    [HttpGet]
    public async Task<IActionResult> GetDoctors()
    {
        var doctors = await _context.Doctors
            .Include(d => d.Specialty)
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
    [HttpPost]
    public async Task<ActionResult<Doctor>> CreateDoctor(Doctor doctor)
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
            doctor
        );
    }

    // PUT: api/doctors/1
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

    // DELETE: api/doctors/1
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