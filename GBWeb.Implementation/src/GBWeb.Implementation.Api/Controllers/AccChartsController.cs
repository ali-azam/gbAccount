using GBWeb.Implementation.Infrastructure.Persistence;
using GBWeb.Implementation.Domain.Modules.Account.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace GBWeb.Implementation.Api.Controllers
{
    public class AccChartDto
    {
        public int AccID { get; set; }
        public string? AccCode { get; set; }
        public string? AccName { get; set; }
        public int? AccLevel { get; set; }
        public int? CategoryID { get; set; }
        public string? AccCategoryName { get; set; }
        public int OrgID { get; set; }
        public string? OrganizationName { get; set; }
        public bool? IsActive { get; set; }
    }

    [AllowAnonymous]
    [Tags("Account Charts")]
    [Route("api/[controller]")]
    [ApiController]
    public class AccChartsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AccChartsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/AccCharts (OrderByDescending so newest saves appear on Row #1)
        [HttpGet]
        public async Task<IActionResult> GetAccCharts()
        {
            var accounts = await _context.AccCharts
                .AsNoTracking()
                .OrderByDescending(c => c.AccID)
                .Select(c => new AccChartDto
                {
                    AccID = c.AccID,
                    AccCode = c.AccCode,
                    AccName = c.AccName,
                    AccLevel = c.AccLevel,
                    CategoryID = c.CategoryID,
                    AccCategoryName = c.AccCategory != null ? c.AccCategory.CategoryName : null,
                    OrgID = c.OrgID,
                    OrganizationName = c.Organization != null ? c.Organization.OrganizationName : null,
                    IsActive = c.IsActive
                })
                .ToListAsync();

            return Ok(new { success = true, data = accounts });
        }

        // GET: api/AccCharts/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAccChart(int id)
        {
            var account = await _context.AccCharts
                .AsNoTracking()
                .Where(c => c.AccID == id)
                .Select(c => new AccChartDto
                {
                    AccID = c.AccID,
                    AccCode = c.AccCode,
                    AccName = c.AccName,
                    AccLevel = c.AccLevel,
                    CategoryID = c.CategoryID,
                    AccCategoryName = c.AccCategory != null ? c.AccCategory.CategoryName : null,
                    OrgID = c.OrgID,
                    OrganizationName = c.Organization != null ? c.Organization.OrganizationName : null,
                    IsActive = c.IsActive
                })
                .FirstOrDefaultAsync();

            if (account == null)
            {
                return NotFound(new { success = false, message = "Account chart not found" });
            }

            return Ok(new { success = true, data = account });
        }

        // PUT: api/AccCharts/5 (Updates DB entity safely)
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAccChart(int id, [FromBody] AccChart account)
        {
            var entity = await _context.AccCharts.FirstOrDefaultAsync(x => x.AccID == id);
            if (entity == null)
            {
                return NotFound(new { success = false, message = "Account chart not found" });
            }

            if (!string.IsNullOrWhiteSpace(account.AccCode)) entity.AccCode = account.AccCode;
            entity.AccName = account.AccName;
            entity.AccLevel = account.AccLevel;
            entity.CategoryID = account.CategoryID;
            entity.OfficeLevel = account.OfficeLevel;
            entity.IsTransaction = account.IsTransaction;
            entity.Nature = account.Nature;
            entity.ModuleID = account.ModuleID;
            entity.NoteID = account.NoteID;
            if (account.IsActive.HasValue) entity.IsActive = account.IsActive;

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Account chart updated successfully" });
        }

        // POST: api/AccCharts
        [HttpPost]
        public async Task<IActionResult> PostAccChart([FromBody] AccChart account)
        {
            if (account == null) return BadRequest(new { success = false, message = "Data required" });

            account.CreateUser = "suser_sname()";
            account.CreateDate = System.DateTime.Now;
            account.OrgID = 1;

            _context.AccCharts.Add(account);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAccChart), new { id = account.AccID }, new { success = true, data = account });
        }

        // DELETE: api/AccCharts/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAccChart(int id)
        {
            var account = await _context.AccCharts.FindAsync(id);
            if (account == null)
            {
                return NotFound(new { success = false, message = "Account chart not found" });
            }

            _context.AccCharts.Remove(account);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Account chart deleted successfully" });
        }

        private bool AccChartExists(int id)
        {
            return _context.AccCharts.Any(e => e.AccID == id);
        }
    }
}
