using Hospital.Data;
using Hospital.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentController : ControllerBase
{
    private readonly HospitalDbContext _context;

    public AppointmentController(HospitalDbContext context)
    {
        _context = context;
    }

    // GET: api/appointment
    [HttpGet]
    public async Task<IActionResult> GetAppointments()
    {
        var appointments = await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .Where(a => a.Patient != null && a.Doctor != null)
            .Select(a => new
            {
                a.Id,
                a.PatientId,

                Patient = new
                {
                    a.Patient!.Id,
                    a.Patient.FullName
                },

                a.DoctorId,

                Doctor = new
                {
                    a.Doctor!.Id,
                    a.Doctor.FullName,

                    Specialty = a.Doctor.Specialty == null
                        ? null
                        : new
                        {
                            a.Doctor.Specialty.Id,
                            a.Doctor.Specialty.Name
                        }
                },

                a.AppointmentDate,
                a.Status,
                a.Notes,
                a.CreatedAt
            })
            .OrderBy(a => a.AppointmentDate)
            .ToListAsync();

        return Ok(appointments);
    }

    // GET: api/appointment/1
    [HttpGet("{id}")]
    public async Task<IActionResult> GetAppointment(int id)
    {
        var appointment = await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .Where(a => a.Id == id)
            .Select(a => new
            {
                a.Id,
                a.PatientId,

                Patient = a.Patient == null
                    ? null
                    : new
                    {
                        a.Patient.Id,
                        a.Patient.FullName
                    },

                a.DoctorId,

                Doctor = a.Doctor == null
                    ? null
                    : new
                    {
                        a.Doctor.Id,
                        a.Doctor.FullName,

                        Specialty = a.Doctor.Specialty == null
                            ? null
                            : new
                            {
                                a.Doctor.Specialty.Id,
                                a.Doctor.Specialty.Name
                            }
                    },

                a.AppointmentDate,
                a.Status,
                a.Notes,
                a.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (appointment == null)
        {
            return NotFound(new
            {
                message = "Qebul tapilmadi."
            });
        }

        return Ok(appointment);
    }

    // GET: api/appointment/patient/1
    [HttpGet("patient/{patientId}")]
    public async Task<IActionResult> GetPatientAppointments(int patientId)
    {
        var patientExists = await _context.Patients
            .AnyAsync(p => p.Id == patientId);

        if (!patientExists)
        {
            return NotFound(new
            {
                message = "Pasiyent tapilmadi."
            });
        }

        var appointments = await _context.Appointments
            .Where(a => a.PatientId == patientId)
            .Include(a => a.Doctor)
            .OrderBy(a => a.AppointmentDate)
            .Select(a => new
            {
                a.Id,
                a.PatientId,
                a.DoctorId,

                Doctor = a.Doctor == null
                    ? null
                    : new
                    {
                        a.Doctor.Id,
                        a.Doctor.FullName
                    },

                a.AppointmentDate,
                a.Status,
                a.Notes,
                a.CreatedAt
            })
            .ToListAsync();

        return Ok(appointments);
    }

    // GET: api/appointment/doctor/1
    [HttpGet("doctor/{doctorId}")]
    public async Task<IActionResult> GetDoctorAppointments(int doctorId)
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

        var appointments = await _context.Appointments
            .Where(a => a.DoctorId == doctorId)
            .Include(a => a.Patient)
            .OrderBy(a => a.AppointmentDate)
            .Select(a => new
            {
                a.Id,
                a.PatientId,

                Patient = a.Patient == null
                    ? null
                    : new
                    {
                        a.Patient.Id,
                        a.Patient.FullName
                    },

                a.DoctorId,
                a.AppointmentDate,
                a.Status,
                a.Notes,
                a.CreatedAt
            })
            .ToListAsync();

        return Ok(appointments);
    }

    // POST: api/appointment
    [HttpPost]
    public async Task<IActionResult> CreateAppointment(
        Appointment appointment)
    {
        // Patient yoxlanışı
        var patientExists = await _context.Patients
            .AnyAsync(p => p.Id == appointment.PatientId);

        if (!patientExists)
        {
            return BadRequest(new
            {
                message = "Gosterilen pasiyent movcud deyil."
            });
        }

        // Doctor yoxlanışı
        var doctorExists = await _context.Doctors
            .AnyAsync(d => d.Id == appointment.DoctorId);

        if (!doctorExists)
        {
            return BadRequest(new
            {
                message = "Gosterilen hekim movcud deyil."
            });
        }

        // Tarix keçmişdə ola bilməz
        if (appointment.AppointmentDate <= DateTime.Now)
        {
            return BadRequest(new
            {
                message = "Qebul vaxti gelecek tarixde olmalidir."
            });
        }

        var dayOfWeek = appointment.AppointmentDate.DayOfWeek;
        var appointmentTime = appointment.AppointmentDate.TimeOfDay;

        // Həkimin həmin gün üçün qrafiki
        var schedule = await _context.DoctorSchedules
            .FirstOrDefaultAsync(s =>
                s.DoctorId == appointment.DoctorId &&
                s.DayOfWeek == dayOfWeek &&
                s.IsAvailable);

        if (schedule == null)
        {
            return BadRequest(new
            {
                message = "Hekimin secilen gun ucun is qrafiki yoxdur."
            });
        }

        // Qəbul saatı qrafik daxilində olmalıdır
        if (appointmentTime < schedule.StartTime ||
            appointmentTime >= schedule.EndTime)
        {
            return BadRequest(new
            {
                message =
                    $"Hekim bu gun {schedule.StartTime:hh\\:mm} - {schedule.EndTime:hh\\:mm} araliginda qebul edir."
            });
        }

        // Eyni həkimə eyni vaxtda ikinci qəbul yaratma
        var appointmentExists = await _context.Appointments
            .AnyAsync(a =>
                a.DoctorId == appointment.DoctorId &&
                a.AppointmentDate == appointment.AppointmentDate &&
                a.Status != "Cancelled");

        if (appointmentExists)
        {
            return BadRequest(new
            {
                message = "Bu saat ucun hekimde artiq qebul movcuddur."
            });
        }

        appointment.Status = "Pending";
        appointment.CreatedAt = DateTime.UtcNow;

        _context.Appointments.Add(appointment);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetAppointment),
            new { id = appointment.Id },
            new
            {
                appointment.Id,
                appointment.PatientId,
                appointment.DoctorId,
                appointment.AppointmentDate,
                appointment.Status,
                appointment.Notes,
                appointment.CreatedAt
            }
        );
    }

    // PUT: api/appointment/1
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAppointment(
        int id,
        Appointment appointment)
    {
        // ID yoxlanışı
        if (id != appointment.Id)
        {
            return BadRequest(new
            {
                message = "ID uygun gelmir."
            });
        }

        // Mövcud appointment
        var existingAppointment = await _context.Appointments
            .FindAsync(id);

        if (existingAppointment == null)
        {
            return NotFound(new
            {
                message = "Qebul tapilmadi."
            });
        }

        // Patient yoxlanışı
        var patientExists = await _context.Patients
            .AnyAsync(p => p.Id == appointment.PatientId);

        if (!patientExists)
        {
            return BadRequest(new
            {
                message = "Gosterilen pasiyent movcud deyil."
            });
        }

        // Doctor yoxlanışı
        var doctorExists = await _context.Doctors
            .AnyAsync(d => d.Id == appointment.DoctorId);

        if (!doctorExists)
        {
            return BadRequest(new
            {
                message = "Gosterilen hekim movcud deyil."
            });
        }

        // Tarix yoxlanışı
        if (appointment.AppointmentDate <= DateTime.Now)
        {
            return BadRequest(new
            {
                message = "Qebul vaxti gelecek tarixde olmalidir."
            });
        }

        var dayOfWeek = appointment.AppointmentDate.DayOfWeek;
        var appointmentTime = appointment.AppointmentDate.TimeOfDay;

        // Həkim qrafiki
        var schedule = await _context.DoctorSchedules
            .FirstOrDefaultAsync(s =>
                s.DoctorId == appointment.DoctorId &&
                s.DayOfWeek == dayOfWeek &&
                s.IsAvailable);

        if (schedule == null)
        {
            return BadRequest(new
            {
                message = "Hekimin secilen gun ucun is qrafiki yoxdur."
            });
        }

        // Saat yoxlanışı
        if (appointmentTime < schedule.StartTime ||
            appointmentTime >= schedule.EndTime)
        {
            return BadRequest(new
            {
                message =
                    $"Hekim bu gun {schedule.StartTime:hh\\:mm} - {schedule.EndTime:hh\\:mm} araliginda qebul edir."
            });
        }

        // Başqa appointment həmin saatı tutub?
        var duplicateAppointment = await _context.Appointments
            .AnyAsync(a =>
                a.Id != id &&
                a.DoctorId == appointment.DoctorId &&
                a.AppointmentDate == appointment.AppointmentDate &&
                a.Status != "Cancelled");

        if (duplicateAppointment)
        {
            return BadRequest(new
            {
                message = "Bu saat ucun hekimde artiq qebul movcuddur."
            });
        }

        existingAppointment.PatientId = appointment.PatientId;
        existingAppointment.DoctorId = appointment.DoctorId;
        existingAppointment.AppointmentDate = appointment.AppointmentDate;
        existingAppointment.Status = appointment.Status;
        existingAppointment.Notes = appointment.Notes;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/appointment/1
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAppointment(int id)
    {
        var appointment = await _context.Appointments
            .FindAsync(id);

        if (appointment == null)
        {
            return NotFound(new
            {
                message = "Qebul tapilmadi."
            });
        }

        _context.Appointments.Remove(appointment);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}