
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

    // Bildiris yaratmaq ucun komekci metod
    private async Task AddAppointmentNotificationAsync(
        int patientId,
        int appointmentId,
        string status)
    {
        string title;
        string message;
        string type;

        switch (status.Trim().ToLowerInvariant())
        {
            case "pending":
                title = "Rezerv sorğunuz yaradıldı";
                message = "Rezerv sorğunuz yaradıldı. Həkimin təsdiqi gözlənilir.";
                type = "info";
                break;

            case "confirmed":
                title = "Rezerviniz təsdiqləndi";
                message = "Həkim rezervinizi təsdiqlədi.";
                type = "success";
                break;

            case "cancelled":
                title = "Rezerv ləğv edildi";
                message = "Rezerviniz ləğv edildi.";
                type = "warning";
                break;

            case "completed":
                title = "Qəbul tamamlandı";
                message = "Həkim qəbulunuzu tamamlanmış kimi qeyd etdi.";
                type = "success";
                break;

            default:
                return;
        }

        _context.Notifications.Add(new Notification
        {
            PatientId = patientId,
            AppointmentId = appointmentId,
            Title = title,
            Message = message,
            Type = type,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
    }

    // GET: api/appointment
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
            query = query.Where(a => a.Status == status);
        }

        if (doctorId.HasValue)
        {
            query = query.Where(a => a.DoctorId == doctorId.Value);
        }

        if (patientId.HasValue)
        {
            query = query.Where(a => a.PatientId == patientId.Value);
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
    [Authorize(Roles = "Admin,Doctor,Patient")]
    [HttpPost]
    public async Task<IActionResult> CreateAppointment(
        Appointment appointment)
    {
        var isAdmin = User.IsInRole("Admin");
        var isDoctor = User.IsInRole("Doctor");
        var isPatient = User.IsInRole("Patient");

        if (isPatient && !isAdmin)
        {
            var currentUserId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(currentUserId))
            {
                return Unauthorized(new
                {
                    message = "Istifadeci melumatlari tapilmadi."
                });
            }

            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.UserId == currentUserId);

            if (patient == null)
            {
                var user = await _userManager.FindByIdAsync(currentUserId);

                if (user == null)
                {
                    return Unauthorized(new
                    {
                        message = "Istifadeci tapilmadi."
                    });
                }

                patient = new Patient
                {
                    FullName = !string.IsNullOrWhiteSpace(user.FullName)
                        ? user.FullName
                        : user.Email ?? "Pasiyent",
                    UserId = user.Id,
                    PhoneNumber = user.PhoneNumber ?? string.Empty,
                    DateOfBirth = null,
                    Gender = string.Empty,
                    Address = string.Empty
                };

                _context.Patients.Add(patient);
                await _context.SaveChangesAsync();
            }

            appointment.PatientId = patient.Id;
        }

        if (isDoctor && !isAdmin)
        {
            var currentUserEmail = User.FindFirstValue(ClaimTypes.Email);

            var doctor = await _context.Doctors
                .FirstOrDefaultAsync(d => d.Id == appointment.DoctorId);

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

        var patientExists = await _context.Patients
            .AnyAsync(p => p.Id == appointment.PatientId);

        if (!patientExists)
        {
            return BadRequest(new
            {
                message = "Gosterilen pasiyent movcud deyil."
            });
        }

        var doctorExists = await _context.Doctors
            .AnyAsync(d => d.Id == appointment.DoctorId);

        if (!doctorExists)
        {
            return BadRequest(new
            {
                message = "Gosterilen hekim movcud deyil."
            });
        }

        if (appointment.AppointmentDate <= DateTime.Now)
        {
            return BadRequest(new
            {
                message = "Qebul vaxti gelecek tarixde olmalidir."
            });
        }

        var appointmentDate = appointment.AppointmentDate.Date;
        var nextDay = appointmentDate.AddDays(1);

        var approvedAbsence = await _context.DoctorAbsenceRequests
            .AnyAsync(r =>
                r.DoctorId == appointment.DoctorId &&
                r.AbsenceDate >= appointmentDate &&
                r.AbsenceDate < nextDay &&
                r.Status == "Approved");

        if (approvedAbsence)
        {
            return BadRequest(new
            {
                message = "Hekim secilen tarixde mezuniyyetde oldugu ucun rezerv etmek mumkun deyil."
            });
        }

        var dayOfWeek = appointment.AppointmentDate.DayOfWeek;
        var appointmentTime = appointment.AppointmentDate.TimeOfDay;

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

        if (appointmentTime < schedule.StartTime ||
            appointmentTime >= schedule.EndTime)
        {
            return BadRequest(new
            {
                message =
                    $"Hekim bu gun {schedule.StartTime:hh\\:mm} - {schedule.EndTime:hh\\:mm} araliginda qebul edir."
            });
        }

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

        await AddAppointmentNotificationAsync(
            appointment.PatientId,
            appointment.Id,
            appointment.Status);

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
            });
    }

 
// PUT: api/appointment/1
[Authorize(Roles = "Admin,Doctor,Patient")]
[HttpPut("{id}")]
public async Task<IActionResult> UpdateAppointment(
    int id,
    [FromBody] Appointment appointment)
    {
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
        var isDoctor = User.IsInRole("Doctor");
        var isPatient = User.IsInRole("Patient");

        if (!isAdmin)
        {
            if (isPatient)
            {
                var currentUserId = User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

                if (existingAppointment.Patient?.UserId != currentUserId)
                {
                    return Forbid();
                }
            }
            else if (isDoctor)
            {
                var currentUserEmail = User.FindFirstValue(
                    ClaimTypes.Email);

                if (existingAppointment.Doctor?.Email != currentUserEmail)
                {
                    return Forbid();
                }
            }
            else
            {
                return Forbid();
            }
        }

        var oldStatus = existingAppointment.Status;

        // Yalnız status dəyişdirilir.
        // Digər sahələr mövcud dəyərlərində qalır.
        if (!isPatient)
        {
            if (string.IsNullOrWhiteSpace(appointment.Status))
            {
                return BadRequest(new
                {
                    message = "Status bos ola bilmez."
                });
            }

            var allowedStatuses = new[]
            {
            "Pending",
            "Confirmed",
            "Completed",
            "Cancelled"
        };

            var newStatus = allowedStatuses.FirstOrDefault(
                s => string.Equals(
                    s,
                    appointment.Status.Trim(),
                    StringComparison.OrdinalIgnoreCase));

            if (newStatus == null)
            {
                return BadRequest(new
                {
                    message = "Status deyeri duzgun deyil."
                });
            }

            existingAppointment.Status = newStatus;
        }

        await _context.SaveChangesAsync();

        if (!isPatient &&
            !string.Equals(
                oldStatus,
                existingAppointment.Status,
                StringComparison.OrdinalIgnoreCase))
        {
            await AddAppointmentNotificationAsync(
                existingAppointment.PatientId,
                existingAppointment.Id,
                existingAppointment.Status);
        }

        return Ok(new
        {
            existingAppointment.Id,
            existingAppointment.PatientId,
            existingAppointment.DoctorId,
            existingAppointment.AppointmentDate,
            existingAppointment.Status,
            existingAppointment.Notes,
            existingAppointment.CreatedAt
        });
    }


    // POST: api/appointment/1/complete
    [Authorize(Roles = "Admin,Doctor")]
    [HttpPost("{id}/complete")]
    public async Task<IActionResult> CompleteAppointment(int id)
    {
        var appointment = await _context.Appointments
            .Include(a => a.Doctor)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (appointment == null)
        {
            return NotFound(new
            {
                message = "Qebul tapilmadi."
            });
        }

        if (User.IsInRole("Doctor"))
        {
            var currentUserEmail = User.FindFirstValue(ClaimTypes.Email);

            if (appointment.Doctor?.Email != currentUserEmail)
            {
                return Forbid();
            }
        }

        if (appointment.Status == "Cancelled")
        {
            return BadRequest(new
            {
                message = "Legv edilmis qebul tamamlana bilmez."
            });
        }

        if (appointment.Status == "Completed")
        {
            return BadRequest(new
            {
                message = "Bu qebul artiq tamamlanib."
            });
        }

        var prescriptionExists = await _context.Prescriptions
            .AnyAsync(p =>
                p.PatientId == appointment.PatientId &&
                p.DoctorId == appointment.DoctorId);

        if (!prescriptionExists)
        {
            return BadRequest(new
            {
                message = "Evvel pasiyent ucun resept yazilmalidir."
            });
        }

        appointment.Status = "Completed";
        await _context.SaveChangesAsync();

        await AddAppointmentNotificationAsync(
            appointment.PatientId,
            appointment.Id,
            appointment.Status);

        return Ok(new
        {
            message = "Qebul ugurla tamamlandi.",
            appointment.Id,
            appointment.Status
        });
    }

    // POST: api/appointment/1/cancel
    [Authorize(Roles = "Admin,Doctor,Patient")]
    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelAppointment(int id)
    {
        var appointment = await _context.Appointments
            .Include(a => a.Doctor)
            .Include(a => a.Patient)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (appointment == null)
        {
            return NotFound(new
            {
                message = "Qebul tapilmadi."
            });
        }

        if (User.IsInRole("Doctor"))
        {
            var currentUserEmail = User.FindFirstValue(ClaimTypes.Email);

            if (appointment.Doctor?.Email != currentUserEmail)
            {
                return Forbid();
            }
        }
        else if (User.IsInRole("Patient"))
        {
            var currentUserId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (appointment.Patient?.UserId != currentUserId)
            {
                return Forbid();
            }
        }

        if (appointment.Status == "Completed")
        {
            return BadRequest(new
            {
                message = "Tamamlanmis qebul legv edile bilmez."
            });
        }

        if (appointment.Status == "Cancelled")
        {
            return BadRequest(new
            {
                message = "Bu qebul artiq legv edilib."
            });
        }

        appointment.Status = "Cancelled";
        await _context.SaveChangesAsync();

        await AddAppointmentNotificationAsync(
            appointment.PatientId,
            appointment.Id,
            appointment.Status);

        return Ok(new
        {
            message = "Qebul ugurla legv edildi.",
            appointment.Id,
            appointment.Status
        });
    }

    // DELETE: api/appointment/1
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAppointment(int id)
    {
        var appointment = await _context.Appointments.FindAsync(id);

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
