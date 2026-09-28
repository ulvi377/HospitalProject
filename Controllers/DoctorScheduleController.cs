using Hospital.Data;
using Hospital.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DoctorScheduleController : ControllerBase
{
    private readonly HospitalDbContext _context;

    public DoctorScheduleController(HospitalDbContext context)
    {
        _context = context;
    }

    // GET: api/doctorschedule
    [HttpGet]
    public async Task<IActionResult> GetSchedules()
    {
        var schedules = await _context.DoctorSchedules
            .Include(s => s.Doctor)
            .Select(s => new
            {
                s.Id,
                s.DoctorId,
                Doctor = s.Doctor == null
                    ? null
                    : new
                    {
                        s.Doctor.Id,
                        s.Doctor.FullName
                    },
                s.DayOfWeek,
                s.StartTime,
                s.EndTime,
                s.IsAvailable
            })
            .ToListAsync();

        return Ok(schedules);
    }
    // GET: api/doctorschedule/1
    [HttpGet("{id}")]
    public async Task<IActionResult> GetSchedule(int id)
    {
        var schedule = await _context.DoctorSchedules
            .Include(s => s.Doctor)
            .Where(s => s.Id == id)
            .Select(s => new
            {
                s.Id,
                s.DoctorId,
                Doctor = s.Doctor == null
                    ? null
                    : new
                    {
                        s.Doctor.Id,
                        s.Doctor.FullName
                    },
                s.DayOfWeek,
                s.StartTime,
                s.EndTime,
                s.IsAvailable
            })
            .FirstOrDefaultAsync();

        if (schedule == null)
        {
            return NotFound(new
            {
                message = "Hekim qrafiki tapilmadi."
            });
        }

        return Ok(schedule);
    }

    // GET: api/doctorschedule/doctor/1
    [HttpGet("doctor/{doctorId}")]
    public async Task<IActionResult> GetDoctorSchedules(int doctorId)
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

        var schedules = await _context.DoctorSchedules
            .Where(s => s.DoctorId == doctorId)
            .OrderBy(s => s.DayOfWeek)
            .ThenBy(s => s.StartTime)
            .Select(s => new
            {
                s.Id,
                s.DoctorId,
                s.DayOfWeek,
                s.StartTime,
                s.EndTime,
                s.IsAvailable
            })
            .ToListAsync();

        return Ok(schedules);
    }

    // POST: api/doctorschedule
    [HttpPost]
    public async Task<IActionResult> CreateSchedule(
        DoctorSchedule schedule)
    {
        var doctorExists = await _context.Doctors
            .AnyAsync(d => d.Id == schedule.DoctorId);

        if (!doctorExists)
        {
            return BadRequest(new
            {
                message = "Gosterilen hekim movcud deyil."
            });
        }

        if (schedule.StartTime >= schedule.EndTime)
        {
            return BadRequest(new
            {
                message = "Baslangic saati bitis saatindan kicik olmalidir."
            });
        }

        var scheduleExists = await _context.DoctorSchedules
            .AnyAsync(s =>
                s.DoctorId == schedule.DoctorId &&
                s.DayOfWeek == schedule.DayOfWeek);

        if (scheduleExists)
        {
            return BadRequest(new
            {
                message = "Bu hekim ucun bu gun artiq is qrafiki movcuddur."
            });
        }

        _context.DoctorSchedules.Add(schedule);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetSchedule),
            new { id = schedule.Id },
            new
            {
                schedule.Id,
                schedule.DoctorId,
                schedule.DayOfWeek,
                schedule.StartTime,
                schedule.EndTime,
                schedule.IsAvailable
            }
        );
    }

    // PUT: api/doctorschedule/1
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSchedule(
        int id,
        DoctorSchedule schedule)
    {
        if (id != schedule.Id)
        {
            return BadRequest(new
            {
                message = "ID uygun gelmir."
            });
        }

        var existingSchedule = await _context.DoctorSchedules
            .FindAsync(id);

        if (existingSchedule == null)
        {
            return NotFound(new
            {
                message = "Hekim qrafiki tapilmadi."
            });
        }

        var doctorExists = await _context.Doctors
            .AnyAsync(d => d.Id == schedule.DoctorId);

        if (!doctorExists)
        {
            return BadRequest(new
            {
                message = "Gosterilen hekim movcud deyil."
            });
        }

        if (schedule.StartTime >= schedule.EndTime)
        {
            return BadRequest(new
            {
                message = "Baslangic saati bitis saatindan kicik olmalidir."
            });
        }

        var duplicateSchedule = await _context.DoctorSchedules
            .AnyAsync(s =>
                s.Id != id &&
                s.DoctorId == schedule.DoctorId &&
                s.DayOfWeek == schedule.DayOfWeek);

        if (duplicateSchedule)
        {
            return BadRequest(new
            {
                message = "Bu hekim ucun bu gun artiq is qrafiki movcuddur."
            });
        }

        existingSchedule.DoctorId = schedule.DoctorId;
        existingSchedule.DayOfWeek = schedule.DayOfWeek;
        existingSchedule.StartTime = schedule.StartTime;
        existingSchedule.EndTime = schedule.EndTime;
        existingSchedule.IsAvailable = schedule.IsAvailable;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/doctorschedule/1
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSchedule(int id)
    {
        var schedule = await _context.DoctorSchedules
            .FindAsync(id);

        if (schedule == null)
        {
            return NotFound(new
            {
                message = "Hekim qrafiki tapilmadi."
            });
        }

        _context.DoctorSchedules.Remove(schedule);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}