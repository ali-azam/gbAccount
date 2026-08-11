using GbAccount.Api.Data;
using GbAccount.Api.Interfaces;
using GbAccount.Api.Middleware;
using GbAccount.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Connection string comes from configuration, never from source. In development
// it is read from appsettings.Development.json (gitignored); in production set
// ConnectionStrings__GbAccount as an environment variable.
var connectionString = builder.Configuration.GetConnectionString("GbAccount")
    ?? throw new InvalidOperationException(
        "Connection string 'GbAccount' was not found. Copy " +
        "appsettings.Development.json.example to appsettings.Development.json and fill it in.");

// Copying the example file but not editing it is the easy mistake to make. Say so
// plainly here rather than letting it surface as a SQL login failure at runtime.
if (connectionString.Contains("YOUR_SERVER") ||
    connectionString.Contains("YOUR_USER") ||
    connectionString.Contains("YOUR_PASSWORD"))
{
    throw new InvalidOperationException(
        "Connection string 'GbAccount' still contains the YOUR_SERVER/YOUR_USER/YOUR_PASSWORD " +
        "placeholders. Edit appsettings.Development.json and put in your real SQL Server details.");
}

builder.Services.AddDbContext<GbAccountDbContext>(options =>
    options.UseSqlServer(connectionString));

// Business logic lives in the service layer; controllers only translate HTTP.
// Registering against the interfaces keeps controllers testable with fakes and
// makes the dependency graph explicit.
builder.Services.AddScoped<IAccChartService, AccChartService>();
builder.Services.AddScoped<IAccCategoryService, AccCategoryService>();
builder.Services.AddScoped<IOrganizationService, OrganizationService>();

// PropertyNamingPolicy = null serializes property names exactly as declared on
// the DTOs. The default camelCase policy would emit "accID" and "categoryID",
// which the existing React client does not read — it expects AccID / CategoryID
// (see AccChartRow in src/lib/useAccounts.ts).
builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
        options.JsonSerializerOptions.DictionaryKeyPolicy = null;
    });

builder.Services.AddOpenApi();

// The Next.js UI runs on a different origin, so without this every browser
// fetch fails preflight even though the endpoints themselves work.
const string NextJsCors = "NextJsClient";
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:3000"];

builder.Services.AddCors(options =>
{
    options.AddPolicy(NextJsCors, policy => policy
        .WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
else
{
    // Only redirect to HTTPS outside development. In development the Next.js
    // client calls the plain HTTP port, and a redirect there breaks CORS
    // preflight, which cannot follow redirects.
    app.UseHttpsRedirection();
}

// First in the pipeline: converts any unhandled exception into the standard
// envelope instead of an HTML error page. Logs the detail, hides it from the client.
app.UseExceptionHandlingMiddleware();

app.UseCors(NextJsCors);

app.UseAuthorization();

app.MapControllers();

app.Run();
