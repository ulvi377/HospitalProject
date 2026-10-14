using System.Security.Claims;
using AutoMapper;
using Hospital.Data;
using Hospital.DTOs.DoctorSchedule;
using Hospital.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Controllers;

[ApiController]
[Route("api/[controller]")]
[Route("api/DoctorSchedules")]
[Authorize]
public class DoctorScheduleController : ControllerBase
{
    private readonly HospitalDbContext _context;
    private readonly IMapper _mapper;

    public DoctorScheduleController(
        HospitalDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    // GET: api/DoctorSchedule
    // Yalniz Admin butun hekimlerin qrafiklerini gore biler.
    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetSchedules()
    {
        var schedules = await _context.DoctorSchedules
            .Include(s => s.Doctor)
            .OrderBy(s => s.DayOfWeek)
            .ThenBy(s => s.StartTime)
            .ToListAsync();

        var response =
            _mapper.Map<List<DoctorScheduleResponseDto>>(schedules);

        return Ok(response);
    }

    // GET: api/DoctorSchedule/my
    // Hekim yalniz oz qrafikini gore biler.
    [Authorize(Roles = "Doctor")]
    [HttpGet("my")]
    public async Task<IActionResult> GetMySchedules()
    {
        var doctorId = await GetCurrentDoctorIdAsync();

        if (doctorId == null)
        {
            return NotFound(new
            {
                message = "Bu hesaba uygun hekim profili tapilmadi."
            });
        }

        var schedules = await _context.DoctorSchedules
            .Include(s => s.Doctor)
            .Where(s => s.DoctorId == doctorId.Value)
            .OrderBy(s => s.DayOfWeek)
            .ThenBy(s => s.StartTime)
            .ToListAsync();

        var response =
            _mapper.Map<List<DoctorScheduleResponseDto>>(schedules);

        return Ok(response);
    }

    // GET: api/DoctorSchedule/1
    // Qrafikin ID-si ile baxmaq yalniz Admin ucundur.
    [Authorize(Roles = "Admin")]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetSchedule(int id)
    {
        var schedule = await _context.DoctorSchedules
            .Include(s => s.Doctor)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (schedule == null)
        {
            return NotFound(new
            {
                message = "Hekim qrafiki tapilmadi."
            });
        }

        var response =
            _mapper.Map<DoctorScheduleResponseDto>(schedule);

        return Ok(response);
    }

   

// GET: api/DoctorSchedules/doctor/1
[Authorize(Roles = "Admin,Doctor,Patient")]
[HttpGet("doctor/{doctorId:int}")]
public async Task<IActionResult> GetDoctorSchedules(int doctorId)
    {
        // Doctor yalniz oz qrafikine baxa biler.
        if (User.IsInRole("Doctor"))
        {
            var currentDoctorId = await GetCurrentDoctorIdAsync();

            if (currentDoctorId == null)
            {
                return NotFound(new
                {
                    message = "Bu hesaba uygun hekim profili tapilmadi."
                });
            }

            if (currentDoctorId.Value != doctorId)
            {
                return Forbid();
            }
        }

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
            .Include(s => s.Doctor)
            .Where(s => s.DoctorId == doctorId)
            .OrderBy(s => s.DayOfWeek)
            .ThenBy(s => s.StartTime)
            .ToListAsync();

        var response =
            _mapper.Map<List<DoctorScheduleResponseDto>>(schedules);

        return Ok(response);
    }

    // POST: api/DoctorSchedule
    // Qrafiki yalniz Admin yarada biler.
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateSchedule(
        [FromBody] DoctorScheduleCreateDto dto)
    {
        if (dto.StartTime >= dto.EndTime)
        {
            return BadRequest(new
            {
                message =
                    "Baslangic saati bitis saatindan kicik olmalidir."
            });
        }

        var doctorExists = await _context.Doctors
            .AnyAsync(d => d.Id == dto.DoctorId);

        if (!doctorExists)
        {
            return BadRequest(new
            {
                message = "Gosterilen hekim movcud deyil."
            });
        }

        var scheduleExists = await _context.DoctorSchedules
            .AnyAsync(s =>
                s.DoctorId == dto.DoctorId &&
                s.DayOfWeek == dto.DayOfWeek);

        if (scheduleExists)
        {
            return BadRequest(new
            {
                message =
                    "Bu hekim ucun bu gun artiq is qrafiki movcuddur."
            });
        }

        var schedule = _mapper.Map<DoctorSchedule>(dto);

        _context.DoctorSchedules.Add(schedule);

        await _context.SaveChangesAsync();

        var createdSchedule = await _context.DoctorSchedules
            .Include(s => s.Doctor)
            .FirstAsync(s => s.Id == schedule.Id);

        var response =
            _mapper.Map<DoctorScheduleResponseDto>(createdSchedule);

        return CreatedAtAction(
            nameof(GetSchedule),
            new { id = schedule.Id },
            response
        );
    }

    // PUT: api/DoctorSchedule/1
    // Qrafiki yalniz Admin deyise biler.
    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateSchedule(
        int id,
        [FromBody] DoctorScheduleUpdateDto dto)
    {
        var existingSchedule = await _context.DoctorSchedules
            .FirstOrDefaultAsync(s => s.Id == id);

        if (existingSchedule == null)
        {
            return NotFound(new
            {
                message = "Hekim qrafiki tapilmadi."
            });
        }

        if (dto.StartTime >= dto.EndTime)
        {
            return BadRequest(new
            {
                message =
                    "Baslangic saati bitis saatindan kicik olmalidir."
            });
        }

        var duplicateSchedule = await _context.DoctorSchedules
            .AnyAsync(s =>
                s.Id != id &&
                s.DoctorId == existingSchedule.DoctorId &&
                s.DayOfWeek == dto.DayOfWeek);

        if (duplicateSchedule)
        {
            return BadRequest(new
            {
                message =
                    "Bu hekim ucun bu gun artiq is qrafiki movcuddur."
            });
        }

        _mapper.Map(dto, existingSchedule);

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/DoctorSchedule/1
    // Qrafiki yalniz Admin sile biler.
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
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

    // Daxil olan hekim hesabinin DoctorId-sini tapir.
    private async Task<int?> GetCurrentDoctorIdAsync()
    {
        var email =
            User.FindFirstValue(ClaimTypes.Email) ??
            User.FindFirstValue("email");

        if (!string.IsNullOrWhiteSpace(email))
        {
            var doctorId = await _context.Doctors
                .Where(d => d.Email == email)
                .Select(d => (int?)d.Id)
                .FirstOrDefaultAsync();

            if (doctorId.HasValue)
            {
                return doctorId.Value;
            }
        }

        var userId =
            User.FindFirstValue(ClaimTypes.NameIdentifier) ??
            User.FindFirstValue("sub");

        if (!string.IsNullOrWhiteSpace(userId))
        {
            var doctorId = await _context.Doctors
                .Where(d => d.ApplicationUserId == userId)
                .Select(d => (int?)d.Id)
                .FirstOrDefaultAsync();

            if (doctorId.HasValue)
            {
                return doctorId.Value;
            }
        }

        return null;
    }
}