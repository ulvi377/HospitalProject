
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Hospital.Interfaces;
using Hospital.Models;
using Hospital.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Hospital.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;
    private readonly HospitalDbContext _context;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        IConfiguration configuration,
        IEmailService emailService,
        HospitalDbContext context)
    {
        _userManager = userManager;
        _configuration = configuration;
        _emailService = emailService;
        _context = context;
    }

    private async Task EnsurePatientProfileAsync(ApplicationUser user)
    {
        var patientExists = await _context.Patients
            .AnyAsync(p => p.UserId == user.Id);

        if (patientExists)
            return;

        var patient = new Patient
        {
            UserId = user.Id,
            FullName = user.FullName ?? user.Email ?? string.Empty,
            DateOfBirth = null,
            Gender = string.Empty,
            PhoneNumber = string.Empty,
            Address = string.Empty
        };

        _context.Patients.Add(patient);
        await _context.SaveChangesAsync();
    }

    private async Task CleanupCreatedUserAsync(ApplicationUser user)
    {
        try
        {
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.UserId == user.Id);

            if (patient != null)
            {
                _context.Patients.Remove(patient);
                await _context.SaveChangesAsync();
            }

            var existingUser = await _userManager.FindByIdAsync(user.Id);

            if (existingUser != null)
            {
                var result = await _userManager.DeleteAsync(existingUser);

                if (!result.Succeeded)
                {
                    Console.Error.WriteLine(
                        "İstifadəçi silinə bilmədi: " +
                        string.Join("; ",
                            result.Errors.Select(e => e.Description)));
                }
            }
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine(
                $"İstifadəçi məlumatlarını təmizləmək mümkün olmadı: {ex}");
        }
    }

    // POST: api/Auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        if (request == null ||
            string.IsNullOrWhiteSpace(request.FullName) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new
            {
                message = "Ad, email və şifrə daxil edilməlidir."
            });
        }

        var fullName = request.FullName.Trim();
        var email = request.Email.Trim();

        // Eyni email ilə ikinci hesab yaradılmasına icazə vermə.
        var existingUser = await _userManager.FindByEmailAsync(email);

        if (existingUser != null)
        {
            return Conflict(new
            {
                message = "Bu email artıq qeydiyyatdan keçib."
            });
        }

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FullName = fullName,
            EmailConfirmed = false
        };

        var createResult = await _userManager.CreateAsync(
            user,
            request.Password);

        if (!createResult.Succeeded)
        {
            return BadRequest(new
            {
                message = "İstifadəçi yaradıla bilmədi.",
                errors = createResult.Errors.Select(e => e.Description)
            });
        }

        try
        {
            var roleResult = await _userManager.AddToRoleAsync(
                user,
                "Patient");

            if (!roleResult.Succeeded)
            {
                await CleanupCreatedUserAsync(user);

                return BadRequest(new
                {
                    message = "Patient rolu təyin edilə bilmədi.",
                    errors = roleResult.Errors.Select(e => e.Description)
                });
            }

            await EnsurePatientProfileAsync(user);

            var emailSent = await SendConfirmationEmailAsync(user);

            if (!emailSent)
            {
                await CleanupCreatedUserAsync(user);

                return StatusCode(500, new
                {
                    message =
                        "Təsdiq emaili göndərilmədi. " +
                        "Backend terminalındakı xətanı yoxlayın."
                });
            }

            return Ok(new
            {
                message =
                    "Qeydiyyat tamamlandı. Emailinizi yoxlayıb təsdiq linkinə daxil olun.",
                role = "Patient"
            });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine(
                $"Qeydiyyat zamanı xəta baş verdi: {ex}");

            await CleanupCreatedUserAsync(user);

            return StatusCode(500, new
            {
                message =
                    "Qeydiyyat zamanı xəta baş verdi. Backend terminalını yoxlayın."
            });
        }
    }

    // POST: api/Auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        if (request == null ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new
            {
                message = "Email və şifrə daxil edilməlidir."
            });
        }

        var user = await _userManager.FindByEmailAsync(
            request.Email.Trim());

        if (user == null)
        {
            return Unauthorized(new
            {
                message = "Email və ya şifrə yanlışdır."
            });
        }

        var passwordValid = await _userManager.CheckPasswordAsync(
            user,
            request.Password);

        if (!passwordValid)
        {
            return Unauthorized(new
            {
                message = "Email və ya şifrə yanlışdır."
            });
        }

        if (!user.EmailConfirmed)
        {
            return Unauthorized(new
            {
                message =
                    "Emailiniz hələ təsdiqlənməyib. Emailinizə göndərilən linkə daxil olun."
            });
        }

        await EnsurePatientProfileAsync(user);

        var roles = await _userManager.GetRolesAsync(user);

        user.LastLoginAt = DateTime.UtcNow;

        var updateResult = await _userManager.UpdateAsync(user);

        if (!updateResult.Succeeded)
        {
            return StatusCode(500, new
            {
                message = "Son giriş vaxtını yadda saxlamaq olmadı."
            });
        }

        var token = GenerateJwtToken(user, roles);

        return Ok(new
        {
            message = "Giriş uğurludur.",
            role = roles.FirstOrDefault(),
            token,
            lastLoginAt = user.LastLoginAt
        });
    }

    // GET: api/Auth/confirm-email?userId=...&token=...
    [HttpGet("confirm-email")]
    public async Task<IActionResult> ConfirmEmail(
        [FromQuery] string? userId,
        [FromQuery] string? token)
    {
        if (string.IsNullOrWhiteSpace(userId) ||
            string.IsNullOrWhiteSpace(token))
        {
            return BadRequest(new
            {
                message = "Təsdiq linki yanlışdır. User ID və token yoxdur."
            });
        }

        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
        {
            return NotFound(new
            {
                message = "İstifadəçi tapılmadı."
            });
        }

        if (user.EmailConfirmed)
        {
            return Content(
                ConfirmationHtml(
                    "Email artıq təsdiqlənib",
                    "Email ünvanınız əvvəl təsdiq olunub. Sistemə daxil ola bilərsiniz.",
                    false),
                "text/html; charset=utf-8");
        }

        try
        {
            var decodedToken = Encoding.UTF8.GetString(
                WebEncoders.Base64UrlDecode(token));

            var result = await _userManager.ConfirmEmailAsync(
                user,
                decodedToken);

            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    message = "Email təsdiqi uğursuz oldu.",
                    errors = result.Errors.Select(e => e.Description)
                });
            }

            return Content(
                ConfirmationHtml(
                    "Email təsdiq edildi!",
                    "Hesabınız uğurla təsdiqləndi. İndi Hospital hesabınıza daxil ola bilərsiniz.",
                    true),
                "text/html; charset=utf-8");
        }
        catch (FormatException)
        {
            return BadRequest(new
            {
                message = "Təsdiq tokeni yanlışdır."
            });
        }
    }

    private static string ConfirmationHtml(
        string title,
        string message,
        bool success)
    {
        var color = success ? "#16a34a" : "#2563eb";

        return $@"<!DOCTYPE html>
<html lang='az'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Hospital - Email təsdiqi</title>
</head>
<body style='margin:0;background:#f1f5f9;font-family:Arial,sans-serif;'>
    <div style='max-width:500px;margin:70px auto;padding:35px 25px;
                background:#ffffff;border-radius:18px;text-align:center;
                box-shadow:0 15px 45px rgba(15,23,42,.08);'>
        <div style='width:65px;height:65px;margin:0 auto 20px;
                    border-radius:18px;background:{color}18;color:{color};
                    font-size:35px;line-height:65px;'>
            {(success ? "&#10003;" : "&#9432;")}
        </div>
        <h1 style='font-size:25px;color:#0f172a;margin-bottom:12px;'>
            {System.Net.WebUtility.HtmlEncode(title)}
        </h1>
        <p style='font-size:15px;line-height:1.8;color:#64748b;'>
            {System.Net.WebUtility.HtmlEncode(message)}
        </p>
        <a href='http://localhost:5173/login'
           style='display:inline-block;margin-top:20px;padding:13px 25px;
                  background:#2563eb;color:white;text-decoration:none;
                  border-radius:9px;font-weight:bold;'>
            Giriş səhifəsinə keç
        </a>
        <p style='margin-top:30px;color:#94a3b8;font-size:12px;'>
            Hospital - Patient Portal
        </p>
    </div>
</body>
</html>";
    }

    // POST: api/Auth/resend-confirmation
    [HttpPost("resend-confirmation")]
    public async Task<IActionResult> ResendConfirmation(
        ResendConfirmationRequest request)
    {
        if (request == null ||
            string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new
            {
                message = "Email daxil edilməlidir."
            });
        }

        var user = await _userManager.FindByEmailAsync(
            request.Email.Trim());

        if (user == null || user.EmailConfirmed)
        {
            return Ok(new
            {
                message =
                    "Əgər hesab mövcuddursa və təsdiqlənməyibsə, təsdiq emaili göndəriləcək."
            });
        }

        var sent = await SendConfirmationEmailAsync(user);

        if (!sent)
        {
            return StatusCode(500, new
            {
                message = "Təsdiq emaili göndərilə bilmədi."
            });
        }

        return Ok(new
        {
            message = "Təsdiq emaili göndərildi."
        });
    }

    private async Task<bool> SendConfirmationEmailAsync(
        ApplicationUser user)
    {
        if (string.IsNullOrWhiteSpace(user.Email))
            return false;

        try
        {
            var token =
                await _userManager.GenerateEmailConfirmationTokenAsync(user);

            var encodedToken = WebEncoders.Base64UrlEncode(
                Encoding.UTF8.GetBytes(token));

            var backendUrl = "http://localhost:5030";

            var confirmationUrl =
                $"{backendUrl}/api/Auth/confirm-email" +
                $"?userId={Uri.EscapeDataString(user.Id)}" +
                $"&token={Uri.EscapeDataString(encodedToken)}";

            Console.WriteLine("CONFIRMATION URL: " + confirmationUrl);

            var safeName = System.Net.WebUtility.HtmlEncode(
                user.FullName ?? user.Email);

            var safeUrl = System.Net.WebUtility.HtmlEncode(
                confirmationUrl);

            var body = $@"
<!DOCTYPE html>
<html lang='az'>
<head>
    <meta charset='UTF-8'>
</head>
<body style='margin:0;padding:25px;background:#f1f5f9;
             font-family:Arial,sans-serif;color:#1e293b;'>
    <div style='max-width:600px;margin:auto;padding:30px;
                background:#ffffff;border:1px solid #e2e8f0;
                border-radius:16px;'>
        <div style='text-align:center;margin-bottom:25px;'>
            <h1 style='color:#2563eb;margin-bottom:5px;'>Hospital</h1>
            <p style='color:#64748b;margin-top:0;'>Email təsdiqi</p>
        </div>

        <h2>Salam, {safeName}!</h2>

        <p style='line-height:1.8;'>
            Hospital hesabınızın qeydiyyatını tamamlamaq üçün
            email ünvanınızı təsdiq edin.
        </p>

        <div style='text-align:center;margin:30px 0;'>
            <a href='{safeUrl}'
               style='display:inline-block;padding:14px 25px;
                      background:#2563eb;color:#ffffff;
                      text-decoration:none;border-radius:8px;
                      font-weight:bold;'>
                Emaili təsdiq et
            </a>
        </div>

        <p style='font-size:13px;color:#64748b;'>
            Düymə açılmasa, aşağıdakı linki brauzerə kopyalayın:
        </p>

        <p style='font-size:12px;line-height:1.7;word-break:break-all;'>
            <a href='{safeUrl}'>{safeUrl}</a>
        </p>

        <hr style='border:none;border-top:1px solid #e2e8f0;margin:25px 0;'>

        <p style='font-size:12px;color:#94a3b8;'>
            Bu qeydiyyatı siz etməmisinizsə, bu mesajı nəzərə almayın.
        </p>
    </div>
</body>
</html>";

            await _emailService.SendEmailAsync(
                user.Email,
                "Hospital - Email təsdiqi",
                body);

            return true;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine(
                $"Confirmation email send failed: {ex}");

            return false;
        }
    }

    // GET: api/Auth/google
    [HttpGet("google")]
    public IActionResult GoogleLogin()
    {
        var callbackUrl = Url.Action(
            nameof(GoogleCallback),
            "Auth",
            values: null,
            protocol: Request.Scheme);

        var properties = new AuthenticationProperties
        {
            RedirectUri = callbackUrl
        };

        return Challenge(properties, "Google");
    }

    // GET: api/Auth/google-callback
    [HttpGet("google-callback")]
    public async Task<IActionResult> GoogleCallback()
    {
        var authenticateResult =
            await HttpContext.AuthenticateAsync(
                IdentityConstants.ExternalScheme);

        if (!authenticateResult.Succeeded)
        {
            return Unauthorized(new
            {
                message = "Google login uğursuz oldu."
            });
        }

        var claims = authenticateResult.Principal?.Claims;

        if (claims == null)
        {
            return Unauthorized(new
            {
                message = "Google istifadəçi məlumatları tapılmadı."
            });
        }

        var email = claims.FirstOrDefault(
            c => c.Type == ClaimTypes.Email)?.Value;

        var fullName = claims.FirstOrDefault(
            c => c.Type == ClaimTypes.Name)?.Value;

        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new
            {
                message = "Google hesabında email tapılmadı."
            });
        }

        email = email.Trim();

        if (string.IsNullOrWhiteSpace(fullName))
            fullName = email;

        var user = await _userManager.FindByEmailAsync(email);

        if (user == null)
        {
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                FullName = fullName,
                EmailConfirmed = true
            };

            var createResult = await _userManager.CreateAsync(user);

            if (!createResult.Succeeded)
            {
                return BadRequest(new
                {
                    message = "Google istifadəçisi yaradıla bilmədi.",
                    errors = createResult.Errors.Select(e => e.Description)
                });
            }

            var roleResult = await _userManager.AddToRoleAsync(
                user,
                "Patient");

            if (!roleResult.Succeeded)
            {
                await CleanupCreatedUserAsync(user);

                return BadRequest(new
                {
                    message = "Patient rolu təyin edilə bilmədi.",
                    errors = roleResult.Errors.Select(e => e.Description)
                });
            }
        }
        else
        {
            if (string.IsNullOrWhiteSpace(user.FullName))
                user.FullName = fullName;

            if (!user.EmailConfirmed)
                user.EmailConfirmed = true;

            var userUpdate = await _userManager.UpdateAsync(user);

            if (!userUpdate.Succeeded)
            {
                return BadRequest(new
                {
                    message = "Google istifadəçi məlumatları yadda saxlanmadı."
                });
            }

            var existingRoles = await _userManager.GetRolesAsync(user);

            if (existingRoles.Count == 0)
            {
                var roleResult = await _userManager.AddToRoleAsync(
                    user,
                    "Patient");

                if (!roleResult.Succeeded)
                {
                    return BadRequest(new
                    {
                        message = "Patient rolu təyin edilə bilmədi."
                    });
                }
            }
        }

        await EnsurePatientProfileAsync(user);

        var roles = await _userManager.GetRolesAsync(user);

        user.LastLoginAt = DateTime.UtcNow;

        var updateResult = await _userManager.UpdateAsync(user);

        if (!updateResult.Succeeded)
        {
            return StatusCode(500, new
            {
                message = "Son giriş vaxtını yadda saxlamaq olmadı."
            });
        }

        var jwt = GenerateJwtToken(user, roles);

        var frontendUrl = "http://localhost:5173/login";

        return Redirect(
            $"{frontendUrl}?token={Uri.EscapeDataString(jwt)}" +
            $"&role={Uri.EscapeDataString(roles.FirstOrDefault() ?? "Patient")}");
    }

    private string GenerateJwtToken(
        ApplicationUser user,
        IList<string> roles)
    {
        var jwtKey = _configuration["Jwt:Key"];

        if (string.IsNullOrWhiteSpace(jwtKey))
        {
            throw new InvalidOperationException("Jwt:Key tapılmadı.");
        }

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(
                JwtRegisteredClaimNames.Email,
                user.Email ?? string.Empty),
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.FullName ?? string.Empty),
            new Claim(ClaimTypes.Email, user.Email ?? string.Empty)
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey));

        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256);

        var expireMinutes = _configuration.GetValue<int>(
            "Jwt:ExpireMinutes");

        if (expireMinutes <= 0)
            expireMinutes = 60;

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expireMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public class RegisterRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class ResendConfirmationRequest
{
    public string Email { get; set; } = string.Empty;
}
