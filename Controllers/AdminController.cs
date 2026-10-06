using Hospital.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Hospital.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;

    public AdminController(
        UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    // POST: api/Admin/assign-role
    [HttpPost("assign-role")]
    public async Task<IActionResult> AssignRole(
        AssignRoleRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new
            {
                message = "Email bos ola bilmez."
            });
        }

        if (string.IsNullOrWhiteSpace(request.Role))
        {
            return BadRequest(new
            {
                message = "Role bos ola bilmez."
            });
        }

        var allowedRoles = new[]
        {
            "Admin",
            "Doctor",
            "Patient"
        };

        var role = request.Role.Trim();

        if (!allowedRoles.Contains(
                role,
                StringComparer.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message =
                    "Yalniz Admin, Doctor ve Patient rollari istifade oluna biler."
            });
        }

        var user = await _userManager.FindByEmailAsync(
            request.Email.Trim());

        if (user == null)
        {
            return NotFound(new
            {
                message = "Bu email ile istifadeci tapilmadi."
            });
        }

        var normalizedRole = allowedRoles.First(
            r => r.Equals(
                role,
                StringComparison.OrdinalIgnoreCase));

        var currentRoles = await _userManager.GetRolesAsync(user);

        if (currentRoles.Contains(normalizedRole))
        {
            return BadRequest(new
            {
                message =
                    $"Istifadecinin artiq {normalizedRole} rolu var."
            });
        }

        if (currentRoles.Count > 0)
        {
            var removeResult = await _userManager.RemoveFromRolesAsync(
                user,
                currentRoles);

            if (!removeResult.Succeeded)
            {
                return BadRequest(new
                {
                    message = "Movcud role siline bilmedi.",
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
            return BadRequest(new
            {
                message = "Yeni role teyin edile bilmedi.",
                errors = addResult.Errors.Select(
                    e => e.Description)
            });
        }

        return Ok(new
        {
            message = "Istifadecinin rolu ugurla deyisdirildi.",
            email = user.Email,
            role = normalizedRole
        });
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
                message = "Email daxil edilmelidir."
            });
        }

        var user = await _userManager.FindByEmailAsync(
            email.Trim());

        if (user == null)
        {
            return NotFound(new
            {
                message = "Istifadeci tapilmadi."
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
}

public class AssignRoleRequest
{
    public string Email { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;
}