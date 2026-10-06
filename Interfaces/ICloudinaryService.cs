
using Microsoft.AspNetCore.Http;

namespace Hospital.Interfaces;

public interface ICloudinaryService
{
    Task<string> UploadImageAsync(IFormFile file);
}