using GBWeb.Implementation.Infrastructure.Persistence;
using GBWeb.Implementation.Domain.Modules.Account.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace GBWeb.Implementation.Api.Controllers
{
    [AllowAnonymous]
    public class AccChartsController : ApiControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AccChartsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/AccCharts
        [HttpGet]
        public async Task<IActionResult> GetAccCharts()
        {
            var accounts = await _context.AccCharts
                .Include(c => c.AccCategory)
                .Include(c => c.Organization)
                .OrderBy(c => c.AccCode)
                .ToListAsync();

            return Ok(new { success = true, data = accounts });
        }

        // GET: api/AccCharts/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAccChart(int id)
        {
            var account = await _context.AccCharts
                .Include(c => c.AccCategory)
                .Include(c => c.Organization)
                .FirstOrDefaultAsync(c => c.AccID == id);

            if (account == null)
            {
                return NotFound(new { success = false, message = "Account chart not found" });
            }

            return Ok(new { success = true, data = account });
        }

        // PUT: api/AccCharts/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAccChart(int id, AccChart account)
        {
            if (id != account.AccID)
            {
                return BadRequest(new { success = false, message = "ID mismatch" });
            }

            _context.Entry(account).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AccChartExists(id))
                {
                    return NotFound(new { success = false, message = "Account chart not found" });
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { success = true, message = "Account chart updated successfully" });
        }

        // POST: api/AccCharts
        [HttpPost]
        public async Task<IActionResult> PostAccChart(AccChart account)
        {
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
