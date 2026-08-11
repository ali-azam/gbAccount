namespace GbAccount.Api.Services;

/// <summary>
/// Why an operation failed, in domain terms. Controllers translate these into
/// HTTP status codes; services never reference ActionResult, so the business
/// rules stay testable without an HTTP context.
/// </summary>
public enum ServiceErrorKind
{
    None = 0,

    /// <summary>The requested row does not exist. Controllers map this to 404.</summary>
    NotFound,

    /// <summary>A uniqueness rule was violated. Controllers map this to 409.</summary>
    Conflict,

    /// <summary>Input referenced something that does not exist. Controllers map this to 400.</summary>
    Validation,
}

/// <summary>
/// Outcome of a service call: either a value, or a reason it could not be produced.
/// </summary>
public readonly struct ServiceResult<T>
{
    private ServiceResult(T? value, ServiceErrorKind errorKind, string? error)
    {
        Value = value;
        ErrorKind = errorKind;
        Error = error;
    }

    public T? Value { get; }

    public ServiceErrorKind ErrorKind { get; }

    public string? Error { get; }

    public bool Succeeded => ErrorKind == ServiceErrorKind.None;

    public static ServiceResult<T> Success(T value) => new(value, ServiceErrorKind.None, null);

    public static ServiceResult<T> NotFound(string message) =>
        new(default, ServiceErrorKind.NotFound, message);

    public static ServiceResult<T> Conflict(string message) =>
        new(default, ServiceErrorKind.Conflict, message);

    public static ServiceResult<T> Validation(string message) =>
        new(default, ServiceErrorKind.Validation, message);
}
