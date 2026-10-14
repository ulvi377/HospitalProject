using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;

namespace Hospital.Services;

public class LiveTranslationService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly IMemoryCache _cache;

    public LiveTranslationService(
        HttpClient httpClient,
        IConfiguration configuration,
        IMemoryCache cache)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _cache = cache;
    }

    public async Task<List<string>> TranslateAsync(
        List<string> texts,
        string targetLanguage,
        CancellationToken cancellationToken = default)
    {
        if (texts.Count == 0)
            return new List<string>();

        if (texts.Count > 50)
            throw new ArgumentException(
                "Bir sorğuda maksimum 50 mətn göndərilə bilər.");

        targetLanguage = targetLanguage.ToLowerInvariant();

        if (targetLanguage != "az" && targetLanguage != "en")
            throw new ArgumentException(
                "Dil yalnız az və ya en ola bilər.");

        var apiKey = _configuration["Gemini:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey))
            throw new InvalidOperationException(
                "Gemini:ApiKey konfiqurasiyası tapılmadı.");

        var results = new List<string>();
        var missingTexts = new List<string>();
        var missingIndexes = new List<int>();

        for (int i = 0; i < texts.Count; i++)
        {
            var original = texts[i] ?? string.Empty;
            var cacheKey = $"translation:{targetLanguage}:{original}";

            if (_cache.TryGetValue(cacheKey, out string? cached))
            {
                results.Add(cached ?? original);
            }
            else
            {
                results.Add(string.Empty);
                missingTexts.Add(original);
                missingIndexes.Add(i);
            }
        }

        if (missingTexts.Count == 0)
            return results;

        var languageName = targetLanguage == "en"
            ? "English"
            : "Azerbaijani";

        var prompt =
            $"Translate each supplied UI text into {languageName}. " +
            "Preserve meaning, placeholders, punctuation and order. " +
            "Return only a JSON array of translated strings. " +
            "Do not add explanations. Input JSON:\n" +
            JsonSerializer.Serialize(missingTexts);

        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            },
            generationConfig = new
            {
                responseMimeType = "application/json",
                responseSchema = new
                {
                    type = "ARRAY",
                    items = new { type = "STRING" }
                }
            }
        };

        using var response = await _httpClient.PostAsJsonAsync(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=" +
            Uri.EscapeDataString(apiKey),
            requestBody,
            cancellationToken);

        response.EnsureSuccessStatusCode();

        using var document = JsonDocument.Parse(
            await response.Content.ReadAsStringAsync(cancellationToken));

        var generatedText = document.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        if (string.IsNullOrWhiteSpace(generatedText))
            throw new InvalidOperationException(
                "Gemini tərcümə nəticəsi qaytarmadı.");

        var translated = JsonSerializer.Deserialize<List<string>>(
            generatedText);

        if (translated == null || translated.Count != missingTexts.Count)
            throw new InvalidOperationException(
                "Tərcümə nəticələrinin sayı uyğun gəlmir.");

        for (int i = 0; i < missingIndexes.Count; i++)
        {
            var translatedText = translated[i] ?? missingTexts[i];
            var originalText = missingTexts[i];

            results[missingIndexes[i]] = translatedText;

            _cache.Set(
                $"translation:{targetLanguage}:{originalText}",
                translatedText,
                TimeSpan.FromHours(12));
        }

        return results;
    }
}