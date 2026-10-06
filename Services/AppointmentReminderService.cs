using Hospital.Data;
using Hospital.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Services;

public class AppointmentReminderService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AppointmentReminderService> _logger;

    public AppointmentReminderService(
        IServiceScopeFactory scopeFactory,
        ILogger<AppointmentReminderService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            "Appointment Reminder Service basladi.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckAppointmentsAsync(
                    stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Appointment reminder yoxlanilmasi zamani xeta bas verdi.");
            }

            await Task.Delay(
                TimeSpan.FromMinutes(1),
                stoppingToken);
        }
    }

    private async Task CheckAppointmentsAsync(
        CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();

        var context = scope.ServiceProvider
            .GetRequiredService<HospitalDbContext>();

        var emailService = scope.ServiceProvider
            .GetRequiredService<IEmailService>();

        var now = DateTime.Now;

        var reminderStart = now.AddMinutes(59);
        var reminderEnd = now.AddMinutes(61);

        var appointments = await context.Appointments
            .Include(a => a.Patient)
                .ThenInclude(p => p!.User)
            .Include(a => a.Doctor)
            .Where(a =>
                !a.ReminderSent &&
                a.Status != "Cancelled" &&
                a.AppointmentDate >= reminderStart &&
                a.AppointmentDate <= reminderEnd)
            .ToListAsync(cancellationToken);

        foreach (var appointment in appointments)
        {
            var patientEmail = appointment.Patient?
                .User?
                .Email;

            if (string.IsNullOrWhiteSpace(patientEmail))
            {
                _logger.LogWarning(
                    "Appointment {AppointmentId} ucun patient email tapilmadi.",
                    appointment.Id);

                continue;
            }

            var doctorName =
                appointment.Doctor?.FullName
                ?? "Hekim";

            var appointmentDate =
                appointment.AppointmentDate;

            var subject =
                "Hospital - Qebul xatirlatmasi";

            var body = $"""
                <html>
                <body>
                    <h2>Qebul xatirlatmasi</h2>

                    <p>Salam,</p>

                    <p>
                        Sizin hekim qebulunuza texminen
                        <strong>1 saat</strong> qalib.
                    </p>

                    <p>
                        <strong>Hekim:</strong> {doctorName}<br />
                        <strong>Tarix:</strong> {appointmentDate:dd.MM.yyyy}<br />
                        <strong>Saat:</strong> {appointmentDate:HH:mm}
                    </p>

                    <p>
                        Zehmet olmasa qebula vaxtinda gelin.
                    </p>

                    <p>
                        Hospital sistemi
                    </p>
                </body>
                </html>
                """;

            try
            {
                await emailService.SendEmailAsync(
                    patientEmail,
                    subject,
                    body);

                appointment.ReminderSent = true;

                await context.SaveChangesAsync(
                    cancellationToken);

                _logger.LogInformation(
                    "Appointment {AppointmentId} ucun reminder gonderildi.",
                    appointment.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Appointment {AppointmentId} ucun email gonderile bilmedi.",
                    appointment.Id);
            }
        }
    }
}