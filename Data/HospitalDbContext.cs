using Hospital.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Data;

public class HospitalDbContext : IdentityDbContext<ApplicationUser>
{
	public HospitalDbContext(DbContextOptions<HospitalDbContext> options)
		: base(options)
	{
	}

	public DbSet<Specialty> Specialties { get; set; }

	public DbSet<Doctor> Doctors { get; set; }

	public DbSet<Patient> Patients { get; set; }
	public DbSet<Appointment> Appointments { get; set; }
	public DbSet<MedicalRecord> MedicalRecords { get; set; }

	public DbSet<Prescription> Prescriptions { get; set; }
	public DbSet<DoctorSchedule> DoctorSchedules { get; set; }
	public DbSet<PainArea> PainAreas { get; set; }
	public DbSet<PainAssessment> PainAssessments { get; set; }
}