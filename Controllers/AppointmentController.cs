using System.Security.Claims;
using Hospital.Data;
using Hospital.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentController : ControllerBase
{
    private readonly HospitalDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public AppointmentController(
        HospitalDbContext context,
        UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    // GET: api/appointment
    // Admin -> butun appointmentler
    // Doctor -> yalniz oz appointmentleri
    // Patient -> yalniz oz appointmentleri
    [Authorize(Roles = "Admin,Doctor,Patient")]
    [HttpGet]
    public async Task<IActionResult> GetAppointments(
        [FromQuery] string? status,
        [FromQuery] int? doctorId,
        [FromQuery] int? patientId)
    {
        var query = _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .Where(a => a.Patient != null && a.Doctor != null)
            .AsQueryable();

        var isAdmin = User.IsInRole("Admin");
        var isDoctor = User.IsInRole("Doctor");
        var isPatient = User.IsInRole("Patient");

        if (!isAdmin)
        {
            if (isPatient)
            {
                var currentUserId = User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

                query = query.Where(a =>
                    a.Patient != null &&
                    a.Patient.UserId == currentUserId);
            }
            else if (isDoctor)
            {
                var currentUserEmail = User.FindFirstValue(
                    ClaimTypes.Email);

                if (string.IsNullOrWhiteSpace(currentUserEmail))
                {
                    return Unauthorized(new
                    {
                        message = "Istifadeci email melumatlari tapilmadi."
                    });
                }

                query = query.Where(a =>
                    a.Doctor != null &&
                    a.Doctor.Email == currentUserEmail);
            }
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            status = status.Trim();

            query = query.Where(a =>
                a.Status == status);
        }

        if (doctorId.HasValue)
        {
            query = query.Where(a =>
                a.DoctorId == doctorId.Value);
        }

        if (patientId.HasValue)
        {
            query = query.Where(a =>
                a.PatientId == patientId.Value);
        }

        var appointments = await query
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
    // Admin -> istediyi appointment
    // Doctor -> yalniz oz appointmenti
    // Patient -> yalniz oz appointmenti
    [Authorize(Roles = "Admin,Doctor,Patient")]
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
                        a.Patient.FullName,
                        a.Patient.UserId
                    },

                a.DoctorId,

                Doctor = a.Doctor == null
                    ? null
                    : new
                    {
                        a.Doctor.Id,
                        a.Doctor.FullName,
                        a.Doctor.Email,

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

        var isAdmin = User.IsInRole("Admin");

        if (!isAdmin)
        {
            if (User.IsInRole("Patient"))
            {
                var currentUserId = User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

                if (appointment.Patient?.UserId != currentUserId)
                {
                    return Forbid();
                }
            }
            else if (User.IsInRole("Doctor"))
            {
                var currentUserEmail = User.FindFirstValue(
                    ClaimTypes.Email);

                if (appointment.Doctor?.Email != currentUserEmail)
                {
                    return Forbid();
                }
            }
        }

        return Ok(appointment);
    }

    // GET: api/appointment/patient/1
    // Admin -> istediyi patient
    // Patient -> yalniz oz appointmentleri
    // Doctor -> bu endpoint istifade ede bilmez
    [Authorize(Roles = "Admin,Patient")]
    [HttpGet("patient/{patientId}")]
    public async Task<IActionResult> GetPatientAppointments(
        int patientId)
    {
        var patient = await _context.Patients
            .FirstOrDefaultAsync(p => p.Id == patientId);

        if (patient == null)
        {
            return NotFound(new
            {
                message = "Pasiyent tapilmadi."
            });
        }

        if (User.IsInRole("Patient"))
        {
            var currentUserId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (patient.UserId != currentUserId)
            {
                return Forbid();
            }
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
    // Admin -> istediyi doctor
    // Doctor -> yalniz oz appointmentleri
    // Patient -> bu endpoint istifade ede bilmez
    [Authorize(Roles = "Admin,Doctor")]
    [HttpGet("doctor/{doctorId}")]
    public async Task<IActionResult> GetDoctorAppointments(
        int doctorId)
    {
        var doctor = await _context.Doctors
            .FirstOrDefaultAsync(d => d.Id == doctorId);

        if (doctor == null)
        {
            return NotFound(new
            {
                message = "Hekim tapilmadi."
            });
        }

        if (User.IsInRole("Doctor"))
        {
            var currentUserEmail = User.FindFirstValue(
                ClaimTypes.Email);

            if (doctor.Email != currentUserEmail)
            {
                return Forbid();
            }
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
    // Admin + Doctor + Patient
    [Authorize(Roles = "Admin,Doctor,Patient")]
    [HttpPost]
    public async Task<IActionResult> CreateAppointment(
        Appointment appointment)
    {
        var isAdmin = User.IsInRole("Admin");
        var isDoctor = User.IsInRole("Doctor");
        var isPatient = User.IsInRole("Patient");

        // Patient oz adina appointment yarada biler
        if (isPatient)
        {
            var currentUserId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            var patient = await _context.Patients
                .FirstOrDefaultAsync(p =>
                    p.Id == appointment.PatientId);

            if (patient == null)
            {
                return BadRequest(new
                {
                    message = "Gosterilen pasiyent movcud deyil."
                });
            }

            if (patient.UserId != currentUserId)
            {
                return Forbid();
            }
        }

        // Doctor yalniz oz adina appointment yarada biler
        if (isDoctor)
        {
            var currentUserEmail = User.FindFirstValue(
                ClaimTypes.Email);

            var doctor = await _context.Doctors
                .FirstOrDefaultAsync(d =>
                    d.Id == appointment.DoctorId);

            if (doctor == null)
            {
                return BadRequest(new
                {
                    message = "Gosterilen hekim movcud deyil."
                });
            }

            if (doctor.Email != currentUserEmail)
            {
                return Forbid();
            }
        }

        // Patient yoxlanisi
        var patientExists = await _context.Patients
            .AnyAsync(p => p.Id == appointment.PatientId);

        if (!patientExists)
        {
            return BadRequest(new
            {
                message = "Gosterilen pasiyent movcud deyil."
            });
        }

        // Doctor yoxlanisi
        var doctorExists = await _context.Doctors
            .AnyAsync(d => d.Id == appointment.DoctorId);

        if (!doctorExists)
        {
            return BadRequest(new
            {
                message = "Gosterilen hekim movcud deyil."
            });
        }

        // Tarix kecmisde ola bilmez
        if (appointment.AppointmentDate <= DateTime.Now)
        {
            return BadRequest(new
            {
                message =
                    "Qebul vaxti gelecek tarixde olmalidir."
            });
        }

        var dayOfWeek = appointment.AppointmentDate.DayOfWeek;
        var appointmentTime = appointment.AppointmentDate.TimeOfDay;

        // Hekimin hemin gun ucun qrafiki
        var schedule = await _context.DoctorSchedules
            .FirstOrDefaultAsync(s =>
                s.DoctorId == appointment.DoctorId &&
                s.DayOfWeek == dayOfWeek &&
                s.IsAvailable);

        if (schedule == null)
        {
            return BadRequest(new
            {
                message =
                    "Hekimin secilen gun ucun is qrafiki yoxdur."
            });
        }

        // Qebul saati qrafik daxilinde olmalidir
        if (appointmentTime < schedule.StartTime ||
            appointmentTime >= schedule.EndTime)
        {
            return BadRequest(new
            {
                message =
                    $"Hekim bu gun {schedule.StartTime:hh\\:mm} - {schedule.EndTime:hh\\:mm} araliginda qebul edir."
            });
        }

        // Eyni hekim + eyni vaxt
        var appointmentExists = await _context.Appointments
            .AnyAsync(a =>
                a.DoctorId == appointment.DoctorId &&
                a.AppointmentDate == appointment.AppointmentDate &&
                a.Status != "Cancelled");

        if (appointmentExists)
        {
            return BadRequest(new
            {
                message =
                    "Bu saat ucun hekimde artiq qebul movcuddur."
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
    // Admin -> istediyi appointment
    // Doctor -> yalniz oz appointmenti
    // Patient -> yalniz oz appointmenti
    [Authorize(Roles = "Admin,Doctor,Patient")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAppointment(
        int id,
        Appointment appointment)
    {
        if (id != appointment.Id)
        {
            return BadRequest(new
            {
                message = "ID uygun gelmir."
            });
        }

        var existingAppointment = await _context.Appointments
            .Include(a => a.Doctor)
            .Include(a => a.Patient)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (existingAppointment == null)
        {
            return NotFound(new
            {
                message = "Qebul tapilmadi."
            });
        }

        var isAdmin = User.IsInRole("Admin");

        if (!isAdmin)
        {
            if (User.IsInRole("Patient"))
            {
                var currentUserId = User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

                if (existingAppointment.Patient?.UserId != currentUserId)
                {
                    return Forbid();
                }

                // Patient basqa patient secə bilmez
                if (existingAppointment.PatientId !=
                    appointment.PatientId)
                {
                    return Forbid();
                }
            }
            else if (User.IsInRole("Doctor"))
            {
                var currentUserEmail = User.FindFirstValue(
                    ClaimTypes.Email);

                if (existingAppointment.Doctor?.Email !=
                    currentUserEmail)
                {
                    return Forbid();
                }

                // Doctor basqa hekim secə bilmez
                var newDoctor = await _context.Doctors
                    .FirstOrDefaultAsync(d =>
                        d.Id == appointment.DoctorId);

                if (newDoctor == null ||
                    newDoctor.Email != currentUserEmail)
                {
                    return Forbid();
                }
            }
        }

        // Patient yoxlanisi
        var patientExists = await _context.Patients
            .AnyAsync(p => p.Id == appointment.PatientId);

        if (!patientExists)
        {
            return BadRequest(new
            {
                message = "Gosterilen pasiyent movcud deyil."
            });
        }

        // Doctor yoxlanisi
        var doctorExists = await _context.Doctors
            .AnyAsync(d => d.Id == appointment.DoctorId);

        if (!doctorExists)
        {
            return BadRequest(new
            {
                message = "Gosterilen hekim movcud deyil."
            });
        }

        // Tarix
        if (appointment.AppointmentDate <= DateTime.Now)
        {
            return BadRequest(new
            {
                message =
                    "Qebul vaxti gelecek tarixde olmalidir."
            });
        }

        var dayOfWeek = appointment.AppointmentDate.DayOfWeek;
        var appointmentTime = appointment.AppointmentDate.TimeOfDay;

        // Hekim qrafiki
        var schedule = await _context.DoctorSchedules
            .FirstOrDefaultAsync(s =>
                s.DoctorId == appointment.DoctorId &&
                s.DayOfWeek == dayOfWeek &&
                s.IsAvailable);

        if (schedule == null)
        {
            return BadRequest(new
            {
                message =
                    "Hekimin secilen gun ucun is qrafiki yoxdur."
            });
        }

        // Saat
        if (appointmentTime < schedule.StartTime ||
            appointmentTime >= schedule.EndTime)
        {
            return BadRequest(new
            {
                message =
                    $"Hekim bu gun {schedule.StartTime:hh\\:mm} - {schedule.EndTime:hh\\:mm} araliginda qebul edir."
            });
        }

        // Duplicate
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
                message =
                    "Bu saat ucun hekimde artiq qebul movcuddur."
            });
        }

        existingAppointment.PatientId =
            appointment.PatientId;

        existingAppointment.DoctorId =
            appointment.DoctorId;

        existingAppointment.AppointmentDate =
            appointment.AppointmentDate;

        existingAppointment.Notes =
            appointment.Notes;

        // Patient statusu deyise bilmez
        // Doctor ve Admin deyise biler
        if (!User.IsInRole("Patient"))
        {
            existingAppointment.Status =
                appointment.Status;
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/appointment/1
    // Yalniz Admin
    [Authorize(Roles = "Admin")]
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