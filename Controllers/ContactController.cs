
using System.Net;
using Hospital.Interfaces;
using Hospital.Models;
using Microsoft.AspNetCore.Mvc;

namespace Hospital.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly IEmailService _emailService;
    private readonly ILogger<ContactController> _logger;

    public ContactController(
        IEmailService emailService,
        ILogger<ContactController> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> Send(
        [FromBody] ContactMessageDto contact)
    {
        try
        {
            var fullName =
                WebUtility.HtmlEncode(contact.FullName);

            var email =
                WebUtility.HtmlEncode(contact.Email);

            var subject =
                WebUtility.HtmlEncode(contact.Subject);

            var message =
                WebUtility.HtmlEncode(contact.Message)
                    .Replace("\r\n", "<br>")
                    .Replace("\n", "<br>");

            var body = $"""
                <html>
                <body>
                    <h2>HospitalProject - Yeni əlaqə mesajı</h2>

                    <p>
                        <strong>Ad:</strong> {fullName}
                    </p>

                    <p>
                        <strong>E-poçt:</strong> {email}
                    </p>

                    <p>
                        <strong>Mövzu:</strong> {subject}
                    </p>

                    <hr />

                    <p>
                        <strong>Mesaj:</strong>
                    </p>

                    <p>{message}</p>
                </body>
                </html>
                """;

            await _emailService.SendEmailAsync(
                "ulviehmedli8500@gmail.com",
                $"HospitalProject: {contact.Subject}",
                body);

            return Ok(new
            {
                success = true,
                message = "Mesajınız uğurla göndərildi."
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Contact mesajı göndərilərkən xəta baş verdi.");

            return StatusCode(500, new
            {
                success = false,
                message = "Mesaj göndərilmədi. Bir az sonra yenidən cəhd edin."
            });
        }
    }
}
