
using Hospital.Models;
using Hospital.Services;
using Microsoft.AspNetCore.Mvc;

namespace Hospital.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TranslationController : ControllerBase
{
    private readonly LiveTranslationService _translationService;

    public TranslationController(
        LiveTranslationService translationService)
    {
        _translationService = translationService;
    }

    [HttpPost]
    public async Task<IActionResult> Translate(
        [FromBody] TranslationRequest request,
        CancellationToken cancellationToken)
    {
        if (request.Texts == null || request.Texts.Count == 0)
            return BadRequest(new { message = "Mətn göndərilməyib." });

        if (request.Texts.Any(string.IsNullOrWhiteSpace))
            return BadRequest(new { message = "Boş mətn göndərilib." });

        if (request.Texts.Any(text => text.Length > 1000))
            return BadRequest(new { message = "Mətn maksimum 1000 simvol ola bilər." });

        try
        {
            var translated = await _translationService.TranslateAsync(
                request.Texts,
                request.TargetLanguage,
                cancellationToken);

            return Ok(new { translations = translated });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (HttpRequestException)
        {
            return StatusCode(502, new
            {
                message = "AI tərcümə xidməti hazırda cavab vermir."
            });
        }
        catch (OperationCanceledException)
            when (!cancellationToken.IsCancellationRequested)
        {
            return StatusCode(504, new
            {
                message = "Tərcümə sorğusu vaxtı keçdi."
            });
        }
    }
}