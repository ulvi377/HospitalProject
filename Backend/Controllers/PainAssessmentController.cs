using System.Security.Claims;
using Hospital.Data;
using Hospital.Models;
using Hospital.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Doctor,Patient")]
public class PainAssessmentController : ControllerBase
{
    private readonly HospitalDbContext _context;
    private readonly GeminiPainAnalysisService _geminiService;

    public PainAssessmentController(
        HospitalDbContext context,
        GeminiPainAnalysisService geminiService)
    {
        _context = context;
        _geminiService = geminiService;
    }

    private string? CurrentUserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier);

    private string? CurrentUserRole =>
        User.FindFirstValue(ClaimTypes.Role);

    private async Task<Patient?> GetCurrentPatientAsync()
    {
        if (string.IsNullOrWhiteSpace(CurrentUserId))
            return null;

        return await _context.Patients
            .FirstOrDefaultAsync(p => p.UserId == CurrentUserId);
    }

    private async Task<bool> CanAccessPatientAsync(int patientId)
    {
        if (CurrentUserRole != "Patient")
            return true;

        var patient = await GetCurrentPatientAsync();

        return patient != null && patient.Id == patientId;
    }

    // GET: api/PainAssessment
    [HttpGet]
    public async Task<IActionResult> GetPainAssessments(
        [FromQuery] int? patientId,
        [FromQuery] int? painAreaId,
        [FromQuery] bool? isEmergency)
    {
        var query = _context.PainAssessments
            .Include(p => p.Patient)
            .Include(p => p.PainArea)
                .ThenInclude(a => a!.RecommendedSpecialty)
            .AsQueryable();

        if (CurrentUserRole == "Patient")
        {
            var patient = await GetCurrentPatientAsync();

            if (patient == null)
                return Forbid();

            query = query.Where(p => p.PatientId == patient.Id);
        }
        else if (patientId.HasValue)
        {
            query = query.Where(p => p.PatientId == patientId.Value);
        }

        if (painAreaId.HasValue)
        {
            query = query.Where(p => p.PainAreaId == painAreaId.Value);
        }

        if (isEmergency.HasValue)
        {
            query = query.Where(p => p.IsEmergency == isEmergency.Value);
        }

        var assessments = await query
            .OrderByDescending(p => p.AssessmentDate)
            .Select(p => new
            {
                p.Id,
                p.PatientId,

                Patient = p.Patient == null
                    ? null
                    : new
                    {
                        p.Patient.Id,
                        p.Patient.FullName
                    },

                p.PainAreaId,

                PainArea = p.PainArea == null
                    ? null
                    : new
                    {
                        p.PainArea.Id,
                        p.PainArea.Name,
                        p.PainArea.BodyPart,

                        RecommendedSpecialty =
                            p.PainArea.RecommendedSpecialty == null
                                ? null
                                : new
                                {
                                    p.PainArea.RecommendedSpecialty.Id,
                                    p.PainArea.RecommendedSpecialty.Name
                                }
                    },

                p.PainLevel,
                p.Symptoms,
                p.Description,
                p.AssessmentDate,
                p.IsEmergency
            })
            .ToListAsync();

        return Ok(assessments);
    }

    // GET: api/PainAssessment/5
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetPainAssessment(int id)
    {
        var assessment = await _context.PainAssessments
            .Include(p => p.Patient)
            .Include(p => p.PainArea)
                .ThenInclude(a => a!.RecommendedSpecialty)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (assessment == null)
        {
            return NotFound(new
            {
                message = "Ağrı qiymətləndirməsi tapılmadı."
            });
        }

        if (!await CanAccessPatientAsync(assessment.PatientId))
            return Forbid();

        return Ok(new
        {
            assessment.Id,
            assessment.PatientId,

            Patient = assessment.Patient == null
                ? null
                : new
                {
                    assessment.Patient.Id,
                    assessment.Patient.FullName
                },

            assessment.PainAreaId,

            PainArea = assessment.PainArea == null
                ? null
                : new
                {
                    assessment.PainArea.Id,
                    assessment.PainArea.Name,
                    assessment.PainArea.BodyPart,

                    RecommendedSpecialty =
                        assessment.PainArea.RecommendedSpecialty == null
                            ? null
                            : new
                            {
                                assessment.PainArea.RecommendedSpecialty.Id,
                                assessment.PainArea.RecommendedSpecialty.Name
                            }
                },

            assessment.PainLevel,
            assessment.Symptoms,
            assessment.Description,
            assessment.AssessmentDate,
            assessment.IsEmergency
        });
    }

    // GET: api/PainAssessment/5/recommendation
    [HttpGet("{id:int}/recommendation")]
    public async Task<IActionResult> GetDoctorRecommendation(int id)
    {
        var assessment = await _context.PainAssessments
            .Include(p => p.PainArea)
                .ThenInclude(a => a!.RecommendedSpecialty)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (assessment == null)
        {
            return NotFound(new
            {
                message = "Ağrı qiymətləndirməsi tapılmadı."
            });
        }

        if (!await CanAccessPatientAsync(assessment.PatientId))
            return Forbid();

        var area = assessment.PainArea;
        var specialty = area?.RecommendedSpecialty;

        if (area == null || specialty == null)
        {
            return BadRequest(new
            {
                message =
                    "Ağrı nahiyəsi üçün tövsiyə olunan ixtisas tapılmadı."
            });
        }

        var doctors = await _context.Doctors
            .Where(d =>
                d.SpecialtyId == area.RecommendedSpecialtyId &&
                d.IsActive)
            .OrderBy(d => d.FullName)
            .Select(d => new
            {
                d.Id,
                d.FullName,
                d.Email,
                d.PhoneNumber,
                d.ImageUrl,

                Specialty = d.Specialty == null
                    ? null
                    : new
                    {
                        d.Specialty.Id,
                        d.Specialty.Name
                    }
            })
            .ToListAsync();

        return Ok(new
        {
            assessmentId = assessment.Id,
            patientId = assessment.PatientId,

            painArea = new
            {
                area.Id,
                area.Name,
                area.BodyPart
            },

            painLevel = assessment.PainLevel,
            isEmergency = assessment.IsEmergency,

            emergencyNotice = assessment.IsEmergency
                ? "Təcili tibbi qiymətləndirmə tələb oluna bilər. Təhlükəli simptomlar varsa, dərhal tibbi yardım alın."
                : null,

            recommendedSpecialty = new
            {
                specialty.Id,
                specialty.Name
            },

            doctors,

            message = doctors.Count > 0
                ? "Uyğun aktiv həkimlər tapıldı."
                : "Bu ixtisas üzrə aktiv həkim tapılmadı."
        });
    }

    // POST: api/PainAssessment
    [HttpPost]
    public async Task<IActionResult> CreatePainAssessment(
        [FromBody] PainAssessment assessment)
    {
        if (assessment == null)
        {
            return BadRequest(new
            {
                message = "Məlumatlar yanlışdır."
            });
        }

        if (CurrentUserRole == "Patient")
        {
            var patient = await GetCurrentPatientAsync();

            if (patient == null)
                return Forbid();

            assessment.PatientId = patient.Id;
        }
        else if (assessment.PatientId <= 0)
        {
            return BadRequest(new
            {
                message = "Pasiyent seçilməlidir."
            });
        }

        var patientExists = await _context.Patients
            .AnyAsync(p => p.Id == assessment.PatientId);

        if (!patientExists)
        {
            return BadRequest(new
            {
                message = "Göstərilən pasiyent mövcud deyil."
            });
        }

        if (assessment.PainLevel < 1 ||
            assessment.PainLevel > 10)
        {
            return BadRequest(new
            {
                message = "Ağrı səviyyəsi 1 ilə 10 arasında olmalıdır."
            });
        }

        var painArea = await _context.PainAreas
            .Include(p => p.RecommendedSpecialty)
            .FirstOrDefaultAsync(p =>
                p.Id == assessment.PainAreaId &&
                p.IsActive);

        if (painArea == null)
        {
            return BadRequest(new
            {
                message =
                    "Göstərilən ağrı nahiyəsi mövcud deyil və ya aktiv deyil."
            });
        }

        assessment.AssessmentDate = DateTime.UtcNow;
        assessment.IsEmergency = assessment.PainLevel >= 8;

        _context.PainAssessments.Add(assessment);
        await _context.SaveChangesAsync();

        var doctors = await _context.Doctors
            .Where(d =>
                d.SpecialtyId == painArea.RecommendedSpecialtyId &&
                d.IsActive)
            .OrderBy(d => d.FullName)
            .Select(d => new
            {
                d.Id,
                d.FullName,
                d.Email,
                d.PhoneNumber,
                d.ImageUrl
            })
            .ToListAsync();

        return CreatedAtAction(
            nameof(GetPainAssessment),
            new { id = assessment.Id },
            new
            {
                assessment.Id,
                assessment.PatientId,
                assessment.PainAreaId,
                assessment.PainLevel,
                assessment.Symptoms,
                assessment.Description,
                assessment.AssessmentDate,
                assessment.IsEmergency,

                RecommendedSpecialty =
                    painArea.RecommendedSpecialty == null
                        ? null
                        : new
                        {
                            painArea.RecommendedSpecialty.Id,
                            painArea.RecommendedSpecialty.Name
                        },

                RecommendedDoctors = doctors
            });
    }

    // POST: api/PainAssessment/analyze
    [HttpPost("analyze")]
    public async Task<IActionResult> AnalyzePain(
        [FromBody] PainAnalysisRequest request,
        CancellationToken cancellationToken)
    {
        if (request == null ||
            string.IsNullOrWhiteSpace(request.BodyPart) ||
            request.PainLevel < 1 ||
            request.PainLevel > 10)
        {
            return BadRequest(new
            {
                message =
                    "Bədən nahiyəsi və 1-10 arası ağrı səviyyəsi daxil edilməlidir."
            });
        }

        if (request.BodyPart.Length > 100 ||
            (request.Symptoms?.Length ?? 0) > 2000 ||
            (request.Description?.Length ?? 0) > 2000 ||
            (request.Duration?.Length ?? 0) > 100)
        {
            return BadRequest(new
            {
                message = "Göndərilən məlumatlar çox uzundur."
            });
        }

        var allSymptoms =
            $"{request.Symptoms} {request.Description}";

        var emergencyKeywords = new[]
        {
            "sinə ağrısı",
            "sinəmdə ağrı",
            "nəfəs darlığı",
            "nəfəs ala bilmirəm",
            "huşunu itirmə",
            "huşumu itirdim",
            "qəfil zəiflik",
            "danışıq pozulması",
            "dayanmayan qanaxma",
            "güclü qanaxma",
            "üzün bir tərəfinin sallanması",
            "sudden weakness",
            "chest pain",
            "difficulty breathing",
            "shortness of breath"
        };

        var urgentWarning =
            request.PainLevel >= 8 ||
            emergencyKeywords.Any(keyword =>
                allSymptoms.Contains(
                    keyword,
                    StringComparison.OrdinalIgnoreCase));

        try
        {
            var language = string.Equals(
    request.Language,
    "en",
    StringComparison.OrdinalIgnoreCase)
        ? "en"
        : "az";

            var analysis = await _geminiService.AnalyzeAsync(
                request.BodyPart.Trim(),
                request.PainLevel,
                request.Symptoms,
                request.Description,
                request.Duration,
                cancellationToken,
                language);

            return Ok(new
            {
                analysis,

                isEmergencyWarning = urgentWarning,

                emergencyMessage = urgentWarning
                    ? "Xəbərdarlıq: bildirilən ağrı səviyyəsi və ya simptomlar təcili qiymətləndirmə tələb edə bilər. Sinə ağrısı, nəfəs darlığı, huşun itməsi və ya qəfil nevroloji əlamətlər varsa, dərhal yerli təcili tibbi yardıma müraciət et."
                    : null,

                disclaimer =
                    "Bu cavab Gemini AI tərəfindən yaradılan məlumatlandırıcı mətndir, tibbi diaqnoz deyil və həkim müayinəsini əvəz etmir."
            });
        }
        catch (HttpRequestException ex)
        {
            // Səbəbi backend terminalında göstəririk.
            Console.Error.WriteLine($"GEMINI HTTP ERROR: {ex}");

            return StatusCode(503, new
            {
                message =
                    "Gemini API sorğusu uğursuz oldu. Backend terminalındakı xətanı yoxla."
            });
        }
        catch (InvalidOperationException ex)
        {
            Console.Error.WriteLine($"GEMINI CONFIG ERROR: {ex}");

            return StatusCode(503, new
            {
                message =
                    "Gemini analiz xidməti hazır deyil. Backend terminalındakı xətanı yoxla."
            });
        }
        catch (OperationCanceledException)
        {
            return StatusCode(504, new
            {
                message =
                    "Gemini sorğusu vaxtında cavab vermədi. Bir az sonra yenidən yoxla."
            });
        }
    }
}

public class PainAnalysisRequest
{
    public string BodyPart { get; set; } = string.Empty;

    public int PainLevel { get; set; }

    public string? Symptoms { get; set; }

    public string? Description { get; set; }

    public string? Duration { get; set; }
    public string? Language { get; set; } = "az";
}