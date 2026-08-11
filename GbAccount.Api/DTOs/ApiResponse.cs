using System.Text.Json.Serialization;

namespace GbAccount.Api.DTOs;

/// <summary>
/// Envelope matching the shape the Next.js UI already expects:
/// { "success": true, "data": ... } or { "success": false, "message": "..." }.
///
/// The envelope keys are lowercase while the payload rows keep their original
/// database casing (AccID, CategoryID). Global camelCase serialization is
/// therefore disabled in Program.cs, and these three names are pinned here so
/// both halves of the contract hold.
/// </summary>
public class ApiResponse<T>
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("data")]
    public T? Data { get; set; }

    [JsonPropertyName("message")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Message { get; set; }

    public static ApiResponse<T> Ok(T data) => new() { Success = true, Data = data };

    public static ApiResponse<T> Fail(string message) => new() { Success = false, Message = message };
}
