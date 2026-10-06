using Hospital.Data;
using Hospital.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PainAssessmentController : ControllerBase
{
	private readonly HospitalDbContext _context;

	public PainAssessmentController(HospitalDbContext context)
	{
		_context = context;
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
				.ThenInclude(p => p.RecommendedSpecialty)
			.AsQueryable();

		if (patientId.HasValue)
		{
			query = query.Where(p =>
				p.PatientId == patientId.Value);
		}

		if (painAreaId.HasValue)
		{
			query = query.Where(p =>
				p.PainAreaId == painAreaId.Value);
		}

		if (isEmergency.HasValue)
		{
			query = query.Where(p =>
				p.IsEmergency == isEmergency.Value);
		}

		var assessments = await query
			.OrderByDescending(p => p.AssessmentDate)
			.Select(p => new
			{
				p.Id,
				p.PatientId,

				Patient = new
				{
					p.Patient!.Id,
					p.Patient.FullName
				},

				p.PainAreaId,

				PainArea = new
				{
					p.PainArea!.Id,
					p.PainArea.Name,
					p.PainArea.BodyPart,

					RecommendedSpecialty =
						new
						{
							p.PainArea.RecommendedSpecialty!.Id,
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

	// GET: api/PainAssessment/1
	[HttpGet("{id}")]
	public async Task<IActionResult> GetPainAssessment(int id)
	{
		var assessment = await _context.PainAssessments
			.Include(p => p.Patient)
			.Include(p => p.PainArea)
				.ThenInclude(p => p.RecommendedSpecialty)
			.Where(p => p.Id == id)
			.Select(p => new
			{
				p.Id,
				p.PatientId,

				Patient = new
				{
					p.Patient!.Id,
					p.Patient.FullName
				},

				p.PainAreaId,

				PainArea = new
				{
					p.PainArea!.Id,
					p.PainArea.Name,
					p.PainArea.BodyPart,

					RecommendedSpecialty =
						new
						{
							p.PainArea.RecommendedSpecialty!.Id,
							p.PainArea.RecommendedSpecialty.Name
						}
				},

				p.PainLevel,
				p.Symptoms,
				p.Description,
				p.AssessmentDate,
				p.IsEmergency
			})
			.FirstOrDefaultAsync();

		if (assessment == null)
		{
			return NotFound(new
			{
				message = "Agri qiymetlendirmesi tapilmadi."
			});
		}

		return Ok(assessment);
	}

	// GET: api/PainAssessment/1/recommendation
	[HttpGet("{id}/recommendation")]
	public async Task<IActionResult> GetDoctorRecommendation(int id)
	{
		var assessment = await _context.PainAssessments
			.Include(p => p.PainArea)
				.ThenInclude(p => p.RecommendedSpecialty)
			.FirstOrDefaultAsync(p => p.Id == id);

		if (assessment == null)
		{
			return NotFound(new
			{
				message = "Agri qiymetlendirmesi tapilmadi."
			});
		}

		if (assessment.PainArea == null ||
			assessment.PainArea.RecommendedSpecialty == null)
		{
			return BadRequest(new
			{
				message =
					"Agri nahiyesi ucun tavsiye olunan ixtisas tapilmadi."
			});
		}

		var specialtyId =
			assessment.PainArea.RecommendedSpecialtyId;

		var doctors = await _context.Doctors
			.Include(d => d.Specialty)
			.Where(d =>
				d.SpecialtyId == specialtyId &&
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

		var emergencyNotice = assessment.IsEmergency
			? "Bu qiymetlendirme tecili kimi qeyd olunub. Tibbi yardim ucun tecili tibbi xidmete muraciet edilmelidir."
			: null;

		return Ok(new
		{
			assessmentId = assessment.Id,

			patientId = assessment.PatientId,

			painArea = new
			{
				assessment.PainArea.Id,
				assessment.PainArea.Name,
				assessment.PainArea.BodyPart
			},

			painLevel = assessment.PainLevel,

			isEmergency = assessment.IsEmergency,

			emergencyNotice,

			recommendedSpecialty = new
			{
				assessment.PainArea.RecommendedSpecialty.Id,
				assessment.PainArea.RecommendedSpecialty.Name
			},

			doctors,

			message = doctors.Count > 0
				? "Agri qiymetlendirmesine uygun aktiv hekimler tapildi."
				: "Bu ixtisas uzre aktiv hekim tapilmadi."
		});
	}

	// POST: api/PainAssessment
	[HttpPost]
	public async Task<IActionResult> CreatePainAssessment(
		PainAssessment assessment)
	{
		// Patient yoxlanışı
		var patientExists = await _context.Patients
			.AnyAsync(p => p.Id == assessment.PatientId);

		if (!patientExists)
		{
			return BadRequest(new
			{
				message = "Gosterilen pasiyent movcud deyil."
			});
		}

		// PainArea yoxlanışı
		var painAreaExists = await _context.PainAreas
			.AnyAsync(p => p.Id == assessment.PainAreaId);

		if (!painAreaExists)
		{
			return BadRequest(new
			{
				message = "Gosterilen agri nahiyesi movcud deyil."
			});
		}

		// PainLevel yoxlanışı
		if (assessment.PainLevel < 1 ||
			assessment.PainLevel > 10)
		{
			return BadRequest(new
			{
				message =
					"Agri seviyesi 1 ile 10 arasinda olmalidir."
			});
		}

		// Tarixi server özü təyin edir
		assessment.AssessmentDate = DateTime.UtcNow;

		_context.PainAssessments.Add(assessment);

		await _context.SaveChangesAsync();

		// Tövsiyə olunan specialty
		var recommendation = await _context.PainAreas
			.Include(p => p.RecommendedSpecialty)
			.Where(p => p.Id == assessment.PainAreaId)
			.Select(p => new
			{
				SpecialtyId = p.RecommendedSpecialty!.Id,
				SpecialtyName = p.RecommendedSpecialty.Name
			})
			.FirstAsync();

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

				RecommendedSpecialty = recommendation
			}
		);
	}
}