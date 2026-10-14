namespace Hospital.Models;

public class TranslationRequest
{
    public List<string> Texts { get; set; } = new();
    public string TargetLanguage { get; set; } = "en";
}