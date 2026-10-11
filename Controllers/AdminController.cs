
using Hospital.Data;
using Hospital.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly HospitalDbContext _context;

    public AdminController(
        UserManager<ApplicationUser> userManager,
        HospitalDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    // GET: api/Admin/users
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _userManager.Users
            .AsNoTracking()
            .ToListAsync();

        var result = new List<object>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);

            result.Add(new
            {
                id = user.Id,
                fullName = user.FullName,
                email = user.Email,
                userName = user.UserName,
                roles
            });
        }

        return Ok(result);
    }

    // PUT: api/Admin/users/{id}/password
    [HttpPut("users/{id}/password")]
    public async Task<IActionResult> ChangeUserPassword(
        string id,
        [FromBody] ChangeUserPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            return BadRequest(new
            {
                message = "İstifadəçi ID-si boş ola bilməz."
            });
        }

        if (request == null ||
            string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest(new
            {
                message = "Yeni şifrə daxil edilməlidir."
            });
        }

        var user = await _userManager.FindByIdAsync(id);

        if (user == null)
        {
            return NotFound(new
            {
                message = "İstifadəçi tapılmadı."
            });
        }

        var token = await _userManager
            .GeneratePasswordResetTokenAsync(user);

        var result = await _userManager.ResetPasswordAsync(
            user,
            token,
            request.NewPassword);

        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                message = "Şifrə dəyişdirilə bilmədi.",
                errors = result.Errors.Select(e => e.Description)
            });
        }

        return Ok(new
        {
            success = true,
            message = "İstifadəçinin şifrəsi uğurla dəyişdirildi."
        });
    }

    // POST: api/Admin/assign-role
    [HttpPost("assign-role")]
    public async Task<IActionResult> AssignRole(
        [FromBody] AssignRoleRequest request)
    {
        if (request == null ||
            string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new
            {
                message = "Email boş ola bilməz."
            });
        }

        if (string.IsNullOrWhiteSpace(request.Role))
        {
            return BadRequest(new
            {
                message = "Rol boş ola bilməz."
            });
        }

        var allowedRoles = new[]
        {
            "Admin",
            "Doctor",
            "Patient"
        };

        var requestedRole = request.Role.Trim();

        var normalizedRole = allowedRoles.FirstOrDefault(
            role => role.Equals(
                requestedRole,
                StringComparison.OrdinalIgnoreCase));

        if (normalizedRole == null)
        {
            return BadRequest(new
            {
                message =
                    "Yalnız Admin, Doctor və Patient rolları mümkündür."
            });
        }

        var user = await _userManager.FindByEmailAsync(
            request.Email.Trim());

        if (user == null)
        {
            return NotFound(new
            {
                message = "Bu email ilə istifadəçi tapılmadı."
            });
        }

        var currentRoles = await _userManager.GetRolesAsync(user);

        var defaultSpecialty = await _context.Specialties
            .OrderBy(s => s.Id)
            .FirstOrDefaultAsync();

        if (normalizedRole == "Doctor" && defaultSpecialty == null)
        {
            return BadRequest(new
            {
                message =
                    "Əvvəlcə ən azı bir ixtisas yaradılmalıdır. " +
                    "Həkim profili üçün ixtisas tələb olunur."
            });
        }

        if (currentRoles.Contains(
            normalizedRole,
            StringComparer.OrdinalIgnoreCase))
        {
            if (normalizedRole == "Doctor")
            {
                try
                {
                    await EnsureDoctorProfile(
                        user,
                        defaultSpecialty!.Id);
                }
                catch (Exception ex)
                {
                    return StatusCode(500, new
                    {
                        message = "Həkim profili yoxlanıla bilmədi.",
                        error = ex.Message
                    });
                }
            }

            return Ok(new
            {
                message = normalizedRole == "Doctor"
                    ? "Doctor rolu artıq mövcuddur. Həkim profili yoxlanıldı."
                    : $"İstifadəçinin artıq {normalizedRole} rolu var.",
                email = user.Email,
                role = normalizedRole
            });
        }

        if (currentRoles.Count > 0)
        {
            var removeResult = await _userManager
                .RemoveFromRolesAsync(user, currentRoles);

            if (!removeResult.Succeeded)
            {
                return BadRequest(new
                {
                    message = "Mövcud rolları silmək mümkün olmadı.",
                    errors = removeResult.Errors.Select(
                        e => e.Description)
                });
            }
        }

        var addResult = await _userManager.AddToRoleAsync(
            user,
            normalizedRole);

        if (!addResult.Succeeded)
        {
            if (currentRoles.Count > 0)
            {
                await _userManager.AddToRolesAsync(
                    user,
                    currentRoles);
            }

            return BadRequest(new
            {
                message = "Yeni rolu təyin etmək mümkün olmadı.",
                errors = addResult.Errors.Select(
                    e => e.Description)
            });
        }

        if (normalizedRole == "Doctor")
        {
            try
            {
                await EnsureDoctorProfile(
                    user,
                    defaultSpecialty!.Id);
            }
            catch (Exception ex)
            {
                await _userManager.RemoveFromRoleAsync(
                    user,
                    normalizedRole);

                if (currentRoles.Count > 0)
                {
                    await _userManager.AddToRolesAsync(
                        user,
                        currentRoles);
                }

                return StatusCode(500, new
                {
                    message =
                        "Doctor rolu verildi, amma həkim profili yaradıla bilmədi.",
                    error = ex.Message
                });
            }
        }

        return Ok(new
        {
            message = normalizedRole == "Doctor"
                ? "Doctor rolu verildi və həkim profili yoxlanıldı."
                : "İstifadəçinin rolu uğurla dəyişdirildi.",
            email = user.Email,
            role = normalizedRole
        });
    }

    // İstifadəçi ilə həkim profilini əlaqələndir.
    private async Task EnsureDoctorProfile(
        ApplicationUser user,
        int specialtyId)
    {
        var doctor = await _context.Doctors
            .FirstOrDefaultAsync(d =>
                d.ApplicationUserId == user.Id ||
                (user.Email != null && d.Email == user.Email));

        if (doctor == null)
        {
            doctor = new Doctor
            {
                FullName = user.FullName,
                Email = user.Email ?? string.Empty,
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                ImageUrl = string.Empty,
                SpecialtyId = specialtyId,
                IsActive = true,
                ApplicationUserId = user.Id
            };

            _context.Doctors.Add(doctor);
        }
        else
        {
            doctor.ApplicationUserId = user.Id;

            if (string.IsNullOrWhiteSpace(doctor.FullName))
                doctor.FullName = user.FullName;

            if (string.IsNullOrWhiteSpace(doctor.Email))
                doctor.Email = user.Email ?? string.Empty;

            if (string.IsNullOrWhiteSpace(doctor.PhoneNumber))
                doctor.PhoneNumber = user.PhoneNumber ?? string.Empty;
        }

        await _context.SaveChangesAsync();
    }

    // GET: api/Admin/user-roles?email=...
    [HttpGet("user-roles")]
    public async Task<IActionResult> GetUserRoles(
        [FromQuery] string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new
            {
                message = "Email daxil edilməlidir."
            });
        }

        var user = await _userManager.FindByEmailAsync(
            email.Trim());

        if (user == null)
        {
            return NotFound(new
            {
                message = "İstifadəçi tapılmadı."
            });
        }

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new
        {
            userId = user.Id,
            fullName = user.FullName,
            email = user.Email,
            roles
        });
    }

    // DELETE: api/Admin/users/{id}
    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            return BadRequest(new
            {
                message = "İstifadəçi ID-si boş ola bilməz."
            });
        }

        var user = await _userManager.FindByIdAsync(id);

        if (user == null)
        {
            return NotFound(new
            {
                message = "İstifadəçi Identity sistemində tapılmadı."
            });
        }

        var email = user.Email;
        var currentUser = await _userManager.GetUserAsync(User);

        if (currentUser != null && currentUser.Id == user.Id)
        {
            return BadRequest(new
            {
                message = "Öz hesabını bu bölmədən silə bilməzsən."
            });
        }

        var roles = await _userManager.GetRolesAsync(user);

        if (roles.Contains(
            "Admin",
            StringComparer.OrdinalIgnoreCase))
        {
            var admins = await _userManager.GetUsersInRoleAsync("Admin");

            if (admins.Count <= 1)
            {
                return BadRequest(new
                {
                    message = "Sistemdə ən azı bir admin qalmalıdır."
                });
            }
        }

        // Əlaqəli həkim profilini tap.
        var doctor = await _context.Doctors
            .FirstOrDefaultAsync(d =>
                d.ApplicationUserId == user.Id ||
                (user.Email != null && d.Email == user.Email));

        // Həkim profilinin başqa qeydlərlə əlaqəsi varsa,
        // bazanın qaytardığı xətanı göstər.
        if (doctor != null)
        {
            _context.Doctors.Remove(doctor);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                return Conflict(new
                {
                    message =
                        "Həkim profili başqa qeydlərlə əlaqəli olduğuna görə silinə bilmədi.",
                    error = ex.InnerException?.Message ?? ex.Message
                });
            }
        }

        var deleteResult = await _userManager.DeleteAsync(user);

        if (!deleteResult.Succeeded)
        {
            return BadRequest(new
            {
                message = "Identity istifadəçisini silmək mümkün olmadı.",
                errors = deleteResult.Errors.Select(e => e.Description)
            });
        }

        // Identity hesabının artıq tapılmadığını yoxla.
        if (!string.IsNullOrWhiteSpace(email))
        {
            var remainingUser =
                await _userManager.FindByEmailAsync(email);

            if (remainingUser != null)
            {
                return Conflict(new
                {
                    message =
                        "İstifadəçi silinib, lakin email Identity sistemində " +
                        "hələ də tapılır. Verilənlər bazası bağlantısını yoxla."
                });
            }
        }

        return Ok(new
        {
            success = true,
            email,
            message =
                "Identity hesabı uğurla silindi. Email yenidən qeydiyyat üçün istifadə oluna bilər."
        });
    }
}

public class ChangeUserPasswordRequest
{
    public string NewPassword { get; set; } = string.Empty;
}

public class AssignRoleRequest
{
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
