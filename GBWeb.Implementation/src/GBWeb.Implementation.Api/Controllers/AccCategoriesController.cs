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
    public class AccCategoriesController : ApiControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AccCategoriesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/AccCategories
        [HttpGet]
        public async Task<IActionResult> GetAccCategories()
        {
            var categories = await _context.AccCategories
                .OrderBy(c => c.CategoryID)
                .ToListAsync();

            return Ok(new { success = true, data = categories });
        }

        // GET: api/AccCategories/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAccCategory(int id)
        {
            var category = await _context.AccCategories.FindAsync(id);

            if (category == null)
            {
                return NotFound(new { success = false, message = "Category not found" });
            }

            return Ok(new { success = true, data = category });
        }

        // PUT: api/AccCategories/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAccCategory(int id, AccCategory category)
        {
            if (id != category.CategoryID)
            {
                return BadRequest(new { success = false, message = "ID mismatch" });
            }

            _context.Entry(category).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AccCategoryExists(id))
                {
                    return NotFound(new { success = false, message = "Category not found" });
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { success = true, message = "Category updated successfully" });
        }

        // POST: api/AccCategories
        [HttpPost]
        public async Task<IActionResult> PostAccCategory(AccCategory category)
        {
            _context.AccCategories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAccCategory), new { id = category.CategoryID }, new { success = true, data = category });
        }

        // DELETE: api/AccCategories/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAccCategory(int id)
        {
            var category = await _context.AccCategories.FindAsync(id);
            if (category == null)
            {
                return NotFound(new { success = false, message = "Category not found" });
            }

            _context.AccCategories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Category deleted successfully" });
        }

        private bool AccCategoryExists(int id)
        {
            return _context.AccCategories.Any(e => e.CategoryID == id);
        }
    }
}
