
using System.Net;
using System.Net.Mail;
using Hospital.Interfaces;

namespace Hospital.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(
        string to,
        string subject,
        string body)
    {
        var smtpHost = _configuration["Email:SmtpHost"];
        var smtpPort = _configuration.GetValue<int>(
            "Email:SmtpPort");

        var username = _configuration["Email:Username"];
        var password = _configuration["Email:Password"];

        if (string.IsNullOrWhiteSpace(smtpHost) ||
            string.IsNullOrWhiteSpace(username) ||
            string.IsNullOrWhiteSpace(password))
        {
            throw new InvalidOperationException(
                "Email SMTP ayarlari tam doldurulmayib.");
        }

        using var message = new MailMessage();

        message.From = new MailAddress(username);
        message.To.Add(to);
        message.Subject = subject;
        message.Body = body;
        message.IsBodyHtml = true;

        using var smtpClient = new SmtpClient(
            smtpHost,
            smtpPort);

        smtpClient.EnableSsl = true;
        smtpClient.Credentials = new NetworkCredential(
            username,
            password);

        await smtpClient.SendMailAsync(message);
    }
}
