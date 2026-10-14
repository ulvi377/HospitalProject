
using System.Globalization;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace Hospital.Services;

public class GeminiPainAnalysisService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public GeminiPainAnalysisService(
        HttpClient httpClient,
        IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<string> AnalyzeAsync(
        string bodyPart,
        int painLevel,
        string? symptoms,
        string? description,
        string? duration,
        CancellationToken cancellationToken = default)
    {
        var apiKey = _configuration["Gemini:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException(
                "Gemini API acari tapilmadi. User Secrets konfiqurasiyasini yoxla.");
        }

        var prompt = $"""
        Sen tibbi melumatlandirma ucun nezerde tutulmus AI komekchisisən.
        Azerbaycan dilinde aydin, duzgun ve tam cavab ver.

        Bedən nahiyesi: {bodyPart}
        Agri seviyesi: {painLevel}/10
        Simptomlar: {symptoms ?? "Qeyd edilmeyib"}
        Elave tesvir: {description ?? "Qeyd edilmeyib"}
        Agrinin muddeti: {duration ?? "Qeyd edilmeyib"}

        Cavabi bu bolmelerle hazirla:
        1. Melumatlarin qisa xulasesi.
        2. Mumkun sebebler ve qeyri-mueyyenlikler.
        3. Novbeti tehlukesiz addimlar.
        4. Hansi hallarda hekimə muraciet etmek lazimdir.

        Qaydalar:
        - Azerbaycan dilinde tam cumlelerle cavab ver.
        - Butun dord bolmeni tamamla.
        - Qeti diaqnoz qoyma.
        - Derman ve doza teyin etme.
        - Melumat chatismirse, bunu bildir.
        - Tehlukeli simptomlarda tecili tibbi yardim tovsiye et.
        - Sinə agrisi, nefes darligi, huşun itmesi ve ya qəfil
          zeiflik kimi tehlukeli simptomlari ciddi qiymetlendir.
        - Hekim muayinesini evez etmediyini qeyd et.
        - Cavabi lazimsiz tekrarlardan uzaq, lakin etrafli yaz.
        """;

        var url =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent";

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
                temperature = 0.3,
                maxOutputTokens = 3000
            }
        };

        var retryableStatusCodes = new[]
        {
            HttpStatusCode.TooManyRequests,
            HttpStatusCode.InternalServerError,
            HttpStatusCode.BadGateway,
            HttpStatusCode.ServiceUnavailable,
            HttpStatusCode.GatewayTimeout
        };

        const int maxAttempts = 3;

        for (var attempt = 1; attempt <= maxAttempts; attempt++)
        {
            cancellationToken.ThrowIfCancellationRequested();

            using var request = new HttpRequestMessage(
                HttpMethod.Post,
                url);

            request.Headers.Add("x-goog-api-key", apiKey);
            request.Content = JsonContent.Create(requestBody);

            using var response = await _httpClient.SendAsync(
                request,
                cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync(
                    cancellationToken);

                Console.Error.WriteLine(
                    $"Gemini xetasi: HTTP {(int)response.StatusCode}. " +
                    $"Cehd: {attempt}/{maxAttempts}. " +
                    $"Cavab: {errorBody}");

                if (attempt < maxAttempts &&
                    retryableStatusCodes.Contains(response.StatusCode))
                {
                    var delaySeconds = GetRetryDelaySeconds(
                        response.StatusCode,
                        errorBody,
                        attempt);

                    Console.WriteLine(
                        $"Gemini yeniden yoxlanacaq. " +
                        $"Gozleme: {delaySeconds} saniye.");

                    await Task.Delay(
                        TimeSpan.FromSeconds(delaySeconds),
                        cancellationToken);

                    continue;
                }

                throw new HttpRequestException(
                    $"Gemini API xetasi: HTTP {(int)response.StatusCode}. " +
                    "Backend terminalindaki xeta melumatini yoxla.",
                    null,
                    response.StatusCode);
            }

            using var stream = await response.Content.ReadAsStreamAsync(
                cancellationToken);

            using var json = await JsonDocument.ParseAsync(
                stream,
                cancellationToken: cancellationToken);

            var root = json.RootElement;

            if (!root.TryGetProperty("candidates", out var candidates) ||
                candidates.ValueKind != JsonValueKind.Array ||
                candidates.GetArrayLength() == 0)
            {
                throw new InvalidOperationException(
                    "Gemini cavab qaytarmadi.");
            }

            var candidate = candidates[0];

            var finishReason = candidate.TryGetProperty(
                "finishReason", out var finishElement)
                ? finishElement.GetString()
                : "UNKNOWN";

            Console.WriteLine(
                $"Gemini finishReason: {finishReason}");

            if (!candidate.TryGetProperty("content", out var content) ||
                !content.TryGetProperty("parts", out var parts))
            {
                throw new InvalidOperationException(
                    "Gemini cavabinin metn hissesi tapilmadi.");
            }

            var answer = string.Join(
                "\n",
                parts.EnumerateArray()
                    .Where(part => part.TryGetProperty("text", out _))
                    .Select(part => part.GetProperty("text").GetString())
                    .Where(text => !string.IsNullOrWhiteSpace(text)));

            if (string.IsNullOrWhiteSpace(answer))
            {
                throw new InvalidOperationException(
                    "Gemini bos cavab qaytardi.");
            }

            if (finishReason == "MAX_TOKENS")
            {
                Console.Error.WriteLine(
                    "XEBERDARLIQ: Gemini cavabi token limitine gore yarimciq qala biler.");
            }

            return answer;
        }

        throw new InvalidOperationException(
            "Gemini sorgusu ugursuz oldu.");
    }

    private static int GetRetryDelaySeconds(
        HttpStatusCode statusCode,
        string errorBody,
        int attempt)
    {
        // Google cavabinda retryDelay: "13s" olarsa,
        // hemin muddetden istifade et.
        var retryDelayMatch = Regex.Match(
            errorBody,
            @"""retryDelay""\s*:\s*""(?<seconds>\d+(?:\.\d+)?)s""",
            RegexOptions.IgnoreCase);

        // Bəzi xətalarda "Please retry in 13.08s" yazıla bilər.
        if (!retryDelayMatch.Success)
        {
            retryDelayMatch = Regex.Match(
                errorBody,
                @"retry\s+in\s+(?<seconds>\d+(?:\.\d+)?)\s*s",
                RegexOptions.IgnoreCase);
        }

        if (retryDelayMatch.Success &&
            double.TryParse(
                retryDelayMatch.Groups["seconds"].Value,
                NumberStyles.Any,
                CultureInfo.InvariantCulture,
                out var retrySeconds))
        {
            return Math.Clamp(
                (int)Math.Ceiling(retrySeconds) + 1,
                1,
                120);
        }

        // 429 zamanı server müddət bildirməyibsə, daha uzun gözlə.
        if (statusCode == HttpStatusCode.TooManyRequests)
        {
            return 20 * attempt;
        }

        // 503 və digər müvəqqəti server xətaları üçün artan fasilə.
        return 3 * attempt;
    }
}
