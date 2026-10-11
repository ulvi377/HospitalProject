
using AutoMapper;
using Hospital.Data;
using Hospital.DTOs.DoctorSchedule;
using Hospital.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Controllers;

[ApiController]
[Route("api/[controller]")]
[Route("api/DoctorSchedules")]
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
    // GET: api/DoctorSchedules
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

    // GET: api/DoctorSchedule/1
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

    // GET: api/DoctorSchedule/doctor/1
    [HttpGet("doctor/{doctorId:int}")]
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
    // POST: api/DoctorSchedules
    [HttpPost]
    public async Task<IActionResult> CreateSchedule(
        [FromBody] DoctorScheduleCreateDto dto)
    {
        if (dto.StartTime >= dto.EndTime)
        {
            return BadRequest(new
            {
                message = "Baslangic saati bitis saatindan kicik olmalidir."
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
                message = "Bu hekim ucun bu gun artiq is qrafiki movcuddur."
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
    // PUT: api/DoctorSchedules/1
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
                message = "Baslangic saati bitis saatindan kicik olmalidir."
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
                message = "Bu hekim ucun bu gun artiq is qrafiki movcuddur."
            });
        }

        _mapper.Map(dto, existingSchedule);

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/DoctorSchedule/1
    // DELETE: api/DoctorSchedules/1
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
}
