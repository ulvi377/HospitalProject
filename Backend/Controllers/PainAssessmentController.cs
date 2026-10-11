using System.Security.Claims;
using Hospital.Data;
using Hospital.Models;
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

    public PainAssessmentController(HospitalDbContext context)
    {
        _context = context;
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
            query = query.Where(
                p => p.PatientId == patientId.Value);
        }

        if (painAreaId.HasValue)
        {
            query = query.Where(
                p => p.PainAreaId == painAreaId.Value);
        }

        if (isEmergency.HasValue)
        {
            query = query.Where(
                p => p.IsEmergency == isEmergency.Value);
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
    // Ödənişsiz, qayda əsaslı ilkin məlumat sistemi.
    // Bu sistem tibbi diaqnoz qoymur.
    [HttpPost("analyze")]
    public IActionResult AnalyzePain(
        [FromBody] PainAnalysisRequest request)
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

        var bodyPart = request.BodyPart.ToLowerInvariant();

        var symptoms =
            $"{request.Symptoms} {request.Description}"
            .ToLowerInvariant();

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
            emergencyKeywords.Any(x => symptoms.Contains(x));

        string possibleCauses;
        string nextSteps;

        if (bodyPart.Contains("head") ||
            bodyPart.Contains("baş"))
        {
            possibleCauses =
                "Baş ağrısı gərginlik, miqren və ya başqa sağlamlıq " +
                "problemləri ilə əlaqəli ola bilər. Təkcə bu məlumatla " +
                "səbəbi müəyyən etmək mümkün deyil.";

            nextSteps =
                "Dincəl və vəziyyətini izlə. Qəfil başlayan çox güclü " +
                "baş ağrısı, huş dəyişikliyi və ya qəfil nevroloji " +
                "əlamətlər varsa, dərhal təcili tibbi yardım al.";
        }
        else if (bodyPart.Contains("chest") ||
                 bodyPart.Contains("sinə"))
        {
            possibleCauses =
                "Sinə ağrısının müxtəlif səbəbləri ola bilər. " +
                "Bəziləri əzələ ilə əlaqəli olsa da, ürək və ağciyər " +
                "problemləri də mümkündür. Bu sistem səbəbi müəyyən etmir.";

            nextSteps =
                "Yeni başlayan, davam edən və ya səbəbi bilinməyən " +
                "sinə ağrısını təcili qiymətləndirmək lazımdır. " +
                "Xüsusilə nəfəs darlığı, soyuq tər və ya huşsuzluq " +
                "varsa, dərhal təcili yardıma müraciət et.";
        }
        else if (bodyPart.Contains("back") ||
                 bodyPart.Contains("bel") ||
                 bodyPart.Contains("spine") ||
                 bodyPart.Contains("kürək"))
        {
            possibleCauses =
                "Bel və kürək ağrısı əzələ gərginliyi və ya digər " +
                "onurğa problemləri ilə əlaqəli ola bilər. Dəqiq " +
                "səbəb müayinə olmadan bilinmir.";

            nextSteps =
                "Ağrını artıran hərəkətlərdən çəkin. Ayaqlarda yeni " +
                "zəiflik, qasıq nahiyəsində keyimə və ya sidik-nəcisə " +
                "nəzarətin itməsi olarsa, təcili tibbi yardım al.";
        }
        else if (bodyPart.Contains("stomach") ||
                 bodyPart.Contains("abdomen") ||
                 bodyPart.Contains("qarın"))
        {
            possibleCauses =
                "Qarın ağrısı həzm problemləri və başqa müxtəlif " +
                "səbəblərlə bağlı ola bilər. Ağrının yeri, müddəti " +
                "və əlavə simptomlar qiymətləndirmə üçün vacibdir.";

            nextSteps =
                "Ağrı güclüdürsə və ya artırsa, yaxud qarın sərtləşməsi, " +
                "davamlı qusma, qanaxma və ya huşsuzluq varsa, " +
                "təcili tibbi yardım al.";
        }
        else if (bodyPart.Contains("arm") ||
                 bodyPart.Contains("leg") ||
                 bodyPart.Contains("hand") ||
                 bodyPart.Contains("foot") ||
                 bodyPart.Contains("qol") ||
                 bodyPart.Contains("ayaq") ||
                 bodyPart.Contains("əl"))
        {
            possibleCauses =
                "Qol, əl və ya ayaq ağrısı əzələ gərginliyi, zədə " +
                "və ya digər səbəblərlə əlaqəli ola bilər. Bu məlumat " +
                "dəqiq səbəbi təsdiqləmir.";

            nextSteps =
                "Nahiyəni əlavə zədədən qoru. Güclü şişkinlik, " +
                "deformasiya, keyimə, hərəkət edə bilməmə və ya " +
                "qəfil zəiflik varsa, tibbi yardım al.";
        }
        else
        {
            possibleCauses =
                "Ağrı müxtəlif səbəblərlə əlaqəli ola bilər. " +
                "Mövcud məlumatlar konkret səbəbi müəyyən etmək " +
                "və ya diaqnoz qoymaq üçün kifayət deyil.";

            nextSteps =
                "Ağrı davam edərsə, təkrarlanarsa və ya gündəlik " +
                "fəaliyyətinə mane olarsa, həkimə müraciət et.";
        }

        var severityText = request.PainLevel switch
        {
            <= 3 => "Aşağı ağrı səviyyəsi bildirilib.",
            <= 6 => "Orta səviyyəli ağrı bildirilib.",
            <= 7 => "Yüksək səviyyəli ağrı bildirilib.",
            _ => "Çox yüksək ağrı səviyyəsi bildirilib."
        };

        var durationText =
            string.IsNullOrWhiteSpace(request.Duration)
                ? "Ağrının müddəti qeyd edilməyib."
                : $"Bildirilən müddət: {request.Duration.Trim()}.";

        var symptomsText =
            string.IsNullOrWhiteSpace(request.Symptoms)
                ? "Əlavə simptomlar qeyd edilməyib."
                : $"Bildirilən simptomlar: {request.Symptoms.Trim()}.";

        var analysis =
            $"İlkin məlumat\n\n" +
            $"Bədən nahiyəsi: {request.BodyPart.Trim()}\n" +
            $"Ağrı səviyyəsi: {request.PainLevel}/10\n" +
            $"{severityText}\n" +
            $"{durationText}\n\n" +
            $"Mümkün izahlar:\n{possibleCauses}\n\n" +
            $"Növbəti addımlar:\n{nextSteps}\n\n" +
            $"{symptomsText}\n\n" +
            "Bu nəticə əvvəlcədən müəyyən edilmiş qaydalara əsaslanır; " +
            "süni intellekt tərəfindən yaradılmır və tibbi diaqnoz deyil.";

        return Ok(new
        {
            analysis,
            isEmergencyWarning = urgentWarning,
            emergencyMessage = urgentWarning
                ? "Xəbərdarlıq: bildirilən ağrı səviyyəsi və ya simptomlar təcili qiymətləndirmə tələb edə bilər. Sinə ağrısı, nəfəs darlığı, huşun itməsi və ya qəfil nevroloji əlamətlər varsa, dərhal yerli təcili tibbi yardıma müraciət et."
                : null,
            disclaimer =
                "Bu məlumat tibbi diaqnoz deyil və həkim müayinəsini əvəz etmir."
        });
    }
}

public class PainAnalysisRequest
{
    public string BodyPart { get; set; } = string.Empty;

    public int PainLevel { get; set; }

    public string? Symptoms { get; set; }

    public string? Description { get; set; }

    public string? Duration { get; set; }
}