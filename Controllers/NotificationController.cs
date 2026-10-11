
using System.Security.Claims;
using Hospital.Data;
using Hospital.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Patient")]
public class NotificationController : ControllerBase
{
	private readonly HospitalDbContext _context;

	public NotificationController(HospitalDbContext context)
	{
		_context = context;
	}

	private async Task<int?> GetCurrentPatientId()
	{
		var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

		if (string.IsNullOrWhiteSpace(userId))
			return null;

		var patient = await _context.Patients
			.Where(p => p.UserId == userId)
			.Select(p => new { p.Id })
			.FirstOrDefaultAsync();

		return patient?.Id;
	}

	// GET: api/notification
	[HttpGet]
	public async Task<IActionResult> GetMyNotifications()
	{
		var patientId = await GetCurrentPatientId();

		if (patientId == null)
			return NotFound(new { message = "Pasiyent profili tapilmadi." });

		var notifications = await _context.Notifications
			.Where(n => n.PatientId == patientId.Value)
			.OrderByDescending(n => n.CreatedAt)
			.Select(n => new
			{
				n.Id,
				n.Title,
				n.Message,
				n.Type,
				n.IsRead,
				n.CreatedAt,
				n.AppointmentId
			})
			.ToListAsync();

		var unreadCount = notifications.Count(n => !n.IsRead);

		return Ok(new
		{
			notifications,
			unreadCount
		});
	}

	// PUT: api/notification/5/read
	[HttpPut("{id}/read")]
	public async Task<IActionResult> MarkAsRead(int id)
	{
		var patientId = await GetCurrentPatientId();

		if (patientId == null)
			return NotFound(new { message = "Pasiyent profili tapilmadi." });

		var notification = await _context.Notifications
			.FirstOrDefaultAsync(n =>
				n.Id == id && n.PatientId == patientId.Value);

		if (notification == null)
			return NotFound(new { message = "Bildiris tapilmadi." });

		notification.IsRead = true;

		await _context.SaveChangesAsync();

		return Ok(new { message = "Bildiris oxunmus kimi qeyd edildi." });
	}

	// PUT: api/notification/read-all
	[HttpPut("read-all")]
	public async Task<IActionResult> MarkAllAsRead()
	{
		var patientId = await GetCurrentPatientId();

		if (patientId == null)
			return NotFound(new { message = "Pasiyent profili tapilmadi." });

		var notifications = await _context.Notifications
			.Where(n =>
				n.PatientId == patientId.Value &&
				!n.IsRead)
			.ToListAsync();

		foreach (var notification in notifications)
		{
			notification.IsRead = true;
		}

		await _context.SaveChangesAsync();

		return Ok(new
		{
			message = "Butun bildirisler oxunmus kimi qeyd edildi."
		});
	}
}
