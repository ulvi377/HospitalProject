
using Hospital.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hospital.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class EmailTestController : ControllerBase
{
    private readonly IEmailService _emailService;

    public EmailTestController(IEmailService emailService)
    {
        _emailService = emailService;
    }

    [HttpPost]
    public async Task<IActionResult> SendTestEmail(
        [FromQuery] string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new
            {
                message = "Email daxil edilməlidir."
            });
        }

        var subject = "HospitalProject - Test Email";

        var body = """
            <html>
            <body>
                <h2>HospitalProject Email Test</h2>

                <p>Salam!</p>

                <p>
                    Bu email HospitalProject sistemindən
                    uğurla göndərildi.
                </p>

                <p>
                    Gmail SMTP bağlantısı düzgün işləyir.
                </p>

                <p>
                    HospitalProject
                </p>
            </body>
            </html>
            """;

        try
        {
            await _emailService.SendEmailAsync(
                email,
                subject,
                body);

            return Ok(new
            {
                message = "Test email uğurla göndərildi.",
                email
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Email göndərilərkən xəta baş verdi.",
                error = ex.Message
            });
        }
    }
}
