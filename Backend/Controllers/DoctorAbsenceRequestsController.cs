using System.Security.Claims;
using System.Net;
using Hospital.Data;
using Hospital.Models;
using Hospital.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Controllers;

[ApiController]
[Route("api/DoctorAbsenceRequests")]
[Authorize]
public class DoctorAbsenceRequestsController : ControllerBase
{
    private readonly HospitalDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ICloudinaryService _cloudinaryService;

    public DoctorAbsenceRequestsController(
        HospitalDbContext context,
        IEmailService emailService,
        ICloudinaryService cloudinaryService)
    {
        _context = context;
        _emailService = emailService;
        _cloudinaryService = cloudinaryService;
    }

    private async Task<Doctor?> GetCurrentDoctorAsync()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = User.FindFirstValue(ClaimTypes.Email);

        if (!string.IsNullOrWhiteSpace(userId))
        {
            var doctor = await _context.Doctors
                .FirstOrDefaultAsync(d => d.ApplicationUserId == userId);

            if (doctor != null)
                return doctor;
        }

        if (!string.IsNullOrWhiteSpace(email))
        {
            return await _context.Doctors
                .FirstOrDefaultAsync(d => d.Email == email);
        }

        return null;
    }

    // GET: api/DoctorAbsenceRequests/my
    [HttpGet("my")]
    [Authorize(Roles = "Doctor")]
    public async Task<IActionResult> GetMyRequests()
    {
        var doctor = await GetCurrentDoctorAsync();

        if (doctor == null)
            return NotFound(new { message = "Hekim profili tapilmadi." });

        var requests = await _context.DoctorAbsenceRequests
            .Where(r => r.DoctorId == doctor.Id)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.DoctorId,
                DoctorName = doctor.FullName,
                r.AbsenceDate,
                r.Reason,
                r.Note,
                r.ImageUrl,
                r.Status,
                r.AdminNote,
                r.CreatedAt,
                r.ReviewedAt
            })
            .ToListAsync();

        return Ok(requests);
    }

    // POST: api/DoctorAbsenceRequests
    [HttpPost]
    [Authorize(Roles = "Doctor")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> CreateRequest(
        [FromForm] CreateDoctorAbsenceRequestDto dto)
    {
        var doctor = await GetCurrentDoctorAsync();

        if (doctor == null)
            return NotFound(new { message = "Hekim profili tapilmadi." });

        if (dto.AbsenceDate.Date <= DateTime.Today)
        {
            return BadRequest(new
            {
                message = "Tarix sabahdan ve ya daha sonrakı gunlerden biri olmalidir."
            });
        }

        if (string.IsNullOrWhiteSpace(dto.Reason))
        {
            return BadRequest(new
            {
                message = "Sebeb qeyd edilmelidir."
            });
        }

        var dateStart = dto.AbsenceDate.Date;
        var dateEnd = dateStart.AddDays(1);

        var duplicate = await _context.DoctorAbsenceRequests
            .AnyAsync(r =>
                r.DoctorId == doctor.Id &&
                r.AbsenceDate >= dateStart &&
                r.AbsenceDate < dateEnd &&
                (r.Status == "Pending" || r.Status == "Approved"));

        if (duplicate)
        {
            return BadRequest(new
            {
                message = "Bu tarix ucun gozleyen ve ya tesdiqlenmis sorqu artiq movcuddur."
            });
        }

        // Şəkil varsa, yoxla və Cloudinary-yə yüklə.
        string? imageUrl = null;

        if (dto.Image != null)
        {
            if (dto.Image.Length == 0)
            {
                return BadRequest(new
                {
                    message = "Seçilmiş şəkil boşdur."
                });
            }

            var allowedContentTypes = new[]
            {
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/gif"
            };

            if (!allowedContentTypes.Contains(
                    dto.Image.ContentType,
                    StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message = "Yalnız JPG, PNG, WEBP və GIF formatlı şəkillər qəbul edilir."
                });
            }

            if (dto.Image.Length > 5 * 1024 * 1024)
            {
                return BadRequest(new
                {
                    message = "Şəkilin ölçüsü maksimum 5 MB ola bilər."
                });
            }

            try
            {
                imageUrl = await _cloudinaryService.UploadImageAsync(dto.Image);
            }
            catch (Exception)
            {
                return StatusCode(500, new
                {
                    message = "Şəkil Cloudinary-yə yüklənə bilmədi. Yenidən cəhd edin."
                });
            }
        }

        var request = new DoctorAbsenceRequest
        {
            DoctorId = doctor.Id,
            AbsenceDate = dateStart,
            Reason = dto.Reason.Trim(),
            Note = dto.Note?.Trim(),
            ImageUrl = imageUrl,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.DoctorAbsenceRequests.Add(request);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Sorqu ugurla yaradildi.",
            request.Id,
            request.DoctorId,
            request.AbsenceDate,
            request.Reason,
            request.Note,
            request.ImageUrl,
            request.Status,
            request.CreatedAt
        });
    }

    // GET: api/DoctorAbsenceRequests
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllRequests(
        [FromQuery] string? status)
    {
        var query = _context.DoctorAbsenceRequests
            .Include(r => r.Doctor)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) &&
            !string.Equals(status, "All", StringComparison.OrdinalIgnoreCase))
        {
            var normalizedStatus = status.Trim();
            query = query.Where(r => r.Status == normalizedStatus);
        }

        var requests = await query
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.DoctorId,
                DoctorName = r.Doctor == null ? "" : r.Doctor.FullName,
                DoctorEmail = r.Doctor == null ? "" : r.Doctor.Email,
                r.AbsenceDate,
                r.Reason,
                r.Note,
                r.ImageUrl,
                r.Status,
                r.AdminNote,
                r.CreatedAt,
                r.ReviewedAt
            })
            .ToListAsync();

        return Ok(requests);
    }

    // PUT: api/DoctorAbsenceRequests/1/review
    [HttpPut("{id}/review")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ReviewRequest(
        int id,
        [FromBody] ReviewDoctorAbsenceRequestDto dto)
    {
        var request = await _context.DoctorAbsenceRequests
            .Include(r => r.Doctor)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (request == null)
            return NotFound(new { message = "Sorqu tapilmadi." });

        if (request.Status != "Pending")
        {
            return BadRequest(new
            {
                message = "Bu sorqu artiq nezərden kecirilib."
            });
        }

        var decision = dto.Status?.Trim();

        if (!string.Equals(decision, "Approved", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(decision, "Rejected", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message = "Status Approved ve ya Rejected olmalidir."
            });
        }

        decision = string.Equals(
            decision,
            "Approved",
            StringComparison.OrdinalIgnoreCase)
                ? "Approved"
                : "Rejected";

        var cancelledAppointments = new List<Appointment>();

        if (decision == "Approved")
        {
            var dateStart = request.AbsenceDate.Date;
            var dateEnd = dateStart.AddDays(1);

            // Bu həkimin məzuniyyət tarixinə düşən aktiv rezervləri tap.
            cancelledAppointments = await _context.Appointments
                .Include(a => a.Patient)
                    .ThenInclude(p => p!.User)
                .Where(a =>
                    a.DoctorId == request.DoctorId &&
                    a.AppointmentDate >= dateStart &&
                    a.AppointmentDate < dateEnd &&
                    a.Status != "Cancelled")
                .ToListAsync();

            // Rezervləri avtomatik ləğv et.
            foreach (var appointment in cancelledAppointments)
            {
                appointment.Status = "Cancelled";
            }
        }

        request.Status = decision;
        request.AdminNote = dto.AdminNote?.Trim();
        request.ReviewedAt = DateTime.UtcNow;

        // Ləğvləri və qərarı email göndərməzdən əvvəl bazada saxla.
        await _context.SaveChangesAsync();

        var patientEmailsSent = 0;
        var patientEmailsFailed = 0;
        var patientEmailErrors = new List<string>();

        // Hər ləğv edilmiş rezerv üçün pasiyentə email göndər.
        foreach (var appointment in cancelledAppointments)
        {
            var patient = appointment.Patient;
            var patientEmail = patient?.User?.Email;

            if (string.IsNullOrWhiteSpace(patientEmail))
            {
                patientEmailsFailed++;
                patientEmailErrors.Add(
                    $"Rezerv #{appointment.Id}: pasiyentin email ünvanı tapılmadı.");
                continue;
            }

            var patientName = WebUtility.HtmlEncode(
                patient?.FullName ?? "Pasiyent");

            var doctorName = WebUtility.HtmlEncode(
                request.Doctor?.FullName ?? "Həkim");

            var appointmentDate = appointment.AppointmentDate
                .ToString("dd.MM.yyyy HH:mm");

            var safeDate = WebUtility.HtmlEncode(appointmentDate);

            var patientSubject =
                $"HospitalProject - Rezerviniz ləğv edildi ({appointmentDate})";

            var patientHtml = $@"
                <div style='font-family:Arial,sans-serif;max-width:600px;
                            margin:auto;padding:28px;color:#1e293b;
                            border:1px solid #e5eaf1;border-radius:14px;'>
                    <h2 style='color:#10213b;margin-top:0;'>
                        HospitalProject
                    </h2>
                    <div style='background:#fff7df;border:1px solid #f5d783;
                                padding:16px;border-radius:10px;'>
                        <h3 style='color:#946200;margin-top:0;'>
                            Rezerviniz ləğv edildi
                        </h3>
                        <p>Hörmətli {patientName},</p>
                        <p>
                            Təəssüf ki, həkimin məzuniyyətinə görə
                            aşağıdakı qəbul rezerviniz ləğv olunub.
                        </p>
                        <p><strong>Həkim:</strong> {doctorName}</p>
                        <p><strong>Qəbul tarixi:</strong> {safeDate}</p>
                        <p>
                            Yeni qəbul vaxtı seçmək üçün xəstəxananın
                            saytından yenidən rezerv yarada bilərsiniz.
                        </p>
                    </div>
                    <p style='color:#64748b;font-size:13px;margin-top:22px;'>
                        Hörmətlə,<br/>HospitalProject komandası
                    </p>
                </div>";

            try
            {
                await _emailService.SendEmailAsync(
                    patientEmail,
                    patientSubject,
                    patientHtml);

                patientEmailsSent++;
            }
            catch (Exception ex)
            {
                patientEmailsFailed++;
                patientEmailErrors.Add(
                    $"Rezerv #{appointment.Id}: {ex.Message}");
            }
        }

        // Həkimə qərar barədə email göndər.
        var doctorEmailSent = false;
        string? doctorEmailError = null;

        if (!string.IsNullOrWhiteSpace(request.Doctor?.Email))
        {
            var doctorName = WebUtility.HtmlEncode(request.Doctor.FullName);
            var reason = WebUtility.HtmlEncode(request.Reason);

            var adminNote = string.IsNullOrWhiteSpace(request.AdminNote)
                ? "Admin əlavə qeyd yazmayıb."
                : WebUtility.HtmlEncode(request.AdminNote);

            var absenceDate = request.AbsenceDate.ToString("dd.MM.yyyy");
            var approved = decision == "Approved";

            var subject = approved
                ? $"HospitalProject - Sorğu təsdiqləndi ({absenceDate})"
                : $"HospitalProject - Sorğu rədd edildi ({absenceDate})";

            var statusText = approved ? "TƏSDİQLƏNDİ" : "RƏDD EDİLDİ";
            var statusColor = approved ? "#15803d" : "#dc2626";

            var htmlBody = $@"
                <div style='font-family:Arial,sans-serif;max-width:600px;
                            margin:auto;padding:24px;color:#1e293b;'>
                    <h2 style='color:#0f172a;'>HospitalProject</h2>
                    <p>Hörmətli {doctorName},</p>
                    <p>İşə gələ bilməmə sorğunuz nəzərdən keçirildi.</p>
                    <div style='padding:16px;background:#f8fafc;
                                border-radius:8px;margin:20px 0;'>
                        <p><strong>Qərar:</strong>
                            <span style='color:{statusColor};font-weight:bold;'>
                                {statusText}
                            </span>
                        </p>
                        <p><strong>Tarix:</strong>
                            {WebUtility.HtmlEncode(absenceDate)}</p>
                        <p><strong>Səbəb:</strong> {reason}</p>
                        <p><strong>Admin qeydi:</strong> {adminNote}</p>
                    </div>
                    <p>Hörmətlə,<br/>HospitalProject Admin komandası</p>
                </div>";

            try
            {
                await _emailService.SendEmailAsync(
                    request.Doctor.Email,
                    subject,
                    htmlBody);

                doctorEmailSent = true;
            }
            catch (Exception ex)
            {
                doctorEmailError = ex.Message;
            }
        }
        else
        {
            doctorEmailError = "Həkimin e-poçt ünvanı tapılmadı.";
        }

        var message = decision == "Approved"
            ? $"Məzuniyyət təsdiqləndi. {cancelledAppointments.Count} rezerv ləğv edildi."
            : "Sorğu rədd edildi.";

        return Ok(new
        {
            message,
            request.Id,
            request.DoctorId,
            DoctorName = request.Doctor?.FullName,
            request.AbsenceDate,
            request.ImageUrl,
            request.Status,
            request.AdminNote,
            request.ReviewedAt,

            appointmentsCancelled = cancelledAppointments.Count,
            patientEmailsSent,
            patientEmailsFailed,
            patientEmailErrors,

            doctorEmailSent,
            doctorEmailError
        });
    }
}

public class CreateDoctorAbsenceRequestDto
{
    public DateTime AbsenceDate { get; set; }

    public string Reason { get; set; } = string.Empty;

    public string? Note { get; set; }

    public IFormFile? Image { get; set; }
}

public class ReviewDoctorAbsenceRequestDto
{
    public string Status { get; set; } = string.Empty;

    public string? AdminNote { get; set; }
}