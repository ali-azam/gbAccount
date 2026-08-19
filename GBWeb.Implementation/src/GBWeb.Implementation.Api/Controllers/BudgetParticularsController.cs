using GBWeb.Implementation.Infrastructure.Persistence;
using GBWeb.Implementation.Domain.Modules.Account.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace GBWeb.Implementation.Api.Controllers
{
    [AllowAnonymous]
    [Tags("Budget Particulars")]
    public class BudgetParticularsController : ApiControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BudgetParticularsController(ApplicationDbContext context)
        {
            _context = context;
        }

        public class BudgetParticularDto
        {
            public string Id { get; set; } = string.Empty;
            public string ParticularName { get; set; } = string.Empty;
        }

        // GET: api/BudgetParticulars
        [HttpGet]
        public async Task<IActionResult> GetBudgetParticulars()
        {
            var results = await _context.BudgetParticulars
                .Where(x => x.IsActive == true)
                .OrderBy(x => x.BudgetParticularName)
                .ToListAsync();

            var dtos = results.Select(x => new BudgetParticularDto
            {
                Id = x.BudgetParticularId.ToString(),
                ParticularName = x.BudgetParticularName ?? string.Empty
            }).ToList();

            return Ok(new { success = true, data = dtos });
        }

        // GET: api/BudgetParticulars/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBudgetParticular(long id)
        {
            var entity = await _context.BudgetParticulars.FindAsync(id);
            if (entity == null || entity.IsActive == false)
            {
                return NotFound(new { success = false, message = "Particular not found" });
            }

            var dto = new BudgetParticularDto
            {
                Id = entity.BudgetParticularId.ToString(),
                ParticularName = entity.BudgetParticularName ?? string.Empty
            };

            return Ok(new { success = true, data = dto });
        }

        // POST: api/BudgetParticulars
        [HttpPost]
        public async Task<IActionResult> PostBudgetParticular(BudgetParticularDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.ParticularName))
            {
                return BadRequest(new { success = false, message = "Particular name is required" });
            }

            // Generate sequential code (e.g. max + 1)
            string code = "0001";
            var maxCode = await _context.BudgetParticulars
                .OrderByDescending(x => x.BudgetParticularCode)
                .Select(x => x.BudgetParticularCode)
                .FirstOrDefaultAsync();

            if (maxCode != null && int.TryParse(maxCode, out var val))
            {
                code = (val + 1).ToString("D4");
            }

            var entity = new BudgetParticular
            {
                BudgetParticularCode = code,
                BudgetParticularName = dto.ParticularName.Trim(),
                GroupId = 4, // Default Group ID
                IsActive = true,
                CreateUser = "system",
                CreateDate = DateTime.Now
            };

            _context.BudgetParticulars.Add(entity);
            await _context.SaveChangesAsync();

            dto.Id = entity.BudgetParticularId.ToString();

            return CreatedAtAction(nameof(GetBudgetParticular), new { id = entity.BudgetParticularId }, new { success = true, data = dto });
        }

        // PUT: api/BudgetParticulars/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBudgetParticular(long id, BudgetParticularDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.ParticularName))
            {
                return BadRequest(new { success = false, message = "Particular name is required" });
            }

            var entity = await _context.BudgetParticulars.FindAsync(id);
            if (entity == null || entity.IsActive == false)
            {
                return NotFound(new { success = false, message = "Particular not found" });
            }

            entity.BudgetParticularName = dto.ParticularName.Trim();
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Particular updated successfully" });
        }

        // DELETE: api/BudgetParticulars/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBudgetParticular(long id)
        {
            var entity = await _context.BudgetParticulars.FindAsync(id);
            if (entity == null)
            {
                return NotFound(new { success = false, message = "Particular not found" });
            }

            _context.BudgetParticulars.Remove(entity);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Particular deleted successfully" });
        }
    }
}
