using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Domain.Modules.Account.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GBWeb.Implementation.Api.Controllers
{
    public class TargetAchievementDto
    {
        public string Id { get; set; } = string.Empty;
        public string ParticularName { get; set; } = string.Empty;
        public string TargetCurrentYear { get; set; } = string.Empty;
        public string Target { get; set; } = string.Empty;
        public string Achievement { get; set; } = string.Empty;
        public string Balance { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string OfficeId { get; set; } = string.Empty;
    }

    [AllowAnonymous]
    [Tags("Target Achievements")]
    [Route("api/[controller]")]
    [ApiController]
    public class TargetAchievementsController : ControllerBase
    {
        private readonly IApplicationDbContext _context;

        public TargetAchievementsController(IApplicationDbContext context)
        {
            _context = context;
        }

        private static string GetProductNameById(int? productId) => productId switch
        {
            0 or 1 or null => "Microfinance",
            2 => "Agriculture Loan",
            3 => "SME Loan",
            4 => "Member Admission",
            _ => $"Product #{productId}"
        };

        private static int GetProductIdByName(string? productName) => productName?.Trim().ToLower() switch
        {
            "agriculture loan" => 2,
            "sme loan" => 3,
            "member admission" => 4,
            _ => 1
        };

        // GET: api/TargetAchievements
        [HttpGet]
        public async Task<IActionResult> GetTargetAchievements()
        {
            var targets = await _context.TargetAchievements
                .OrderByDescending(t => t.TargetId)
                .ToListAsync();

            var particularIds = targets
                .Where(t => t.BudgetParticularId.HasValue)
                .Select(t => (long)t.BudgetParticularId!.Value)
                .Distinct()
                .ToList();

            var particulars = await _context.BudgetParticulars
                .Where(p => p.IsActive == true && particularIds.Contains(p.BudgetParticularId))
                .ToDictionaryAsync(p => p.BudgetParticularId, p => p.BudgetParticularName);

            var dtos = targets
                .Where(t => t.BudgetParticularId.HasValue && particulars.ContainsKey(t.BudgetParticularId.Value))
                .Select(t => new TargetAchievementDto
                {
                    Id = t.TargetId.ToString(),
                    ParticularName = particulars[t.BudgetParticularId!.Value] ?? string.Empty,
                    TargetCurrentYear = t.TargetCurrentYear?.ToString() ?? "-",
                    Target = t.Target?.ToString() ?? "0",
                    Achievement = t.Achievement?.ToString() ?? "0",
                    Balance = t.Balance?.ToString() ?? "0",
                    Date = t.Date?.ToString("yyyy-MM-dd") ?? "-",
                    ProductName = GetProductNameById(t.ProductID),
                    OfficeId = t.OfficeID?.ToString() ?? string.Empty
                }).ToList();

            return Ok(new { success = true, data = dtos });
        }

        // GET: api/TargetAchievements/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTargetAchievement(int id)
        {
            var target = await _context.TargetAchievements.FirstOrDefaultAsync(x => x.TargetId == id);
            if (target == null) return NotFound(new { success = false, message = "Target achievement record not found" });

            string particularName = "-";
            if (target.BudgetParticularId.HasValue)
            {
                var particular = await _context.BudgetParticulars.FirstOrDefaultAsync(p => p.BudgetParticularId == target.BudgetParticularId.Value && p.IsActive == true);
                if (particular != null) particularName = particular.BudgetParticularName ?? string.Empty;
            }

            var dto = new TargetAchievementDto
            {
                Id = target.TargetId.ToString(),
                ParticularName = particularName,
                TargetCurrentYear = target.TargetCurrentYear?.ToString() ?? "-",
                Target = target.Target?.ToString() ?? "0",
                Achievement = target.Achievement?.ToString() ?? "0",
                Balance = target.Balance?.ToString() ?? "0",
                Date = target.Date?.ToString("yyyy-MM-dd") ?? "-",
                ProductName = GetProductNameById(target.ProductID),
                OfficeId = target.OfficeID?.ToString() ?? string.Empty
            };

            return Ok(new { success = true, data = dto });
        }

        // POST: api/TargetAchievements
        [HttpPost]
        public async Task<IActionResult> PostTargetAchievement([FromBody] TargetAchievementDto dto)
        {
            if (dto == null) return BadRequest(new { success = false, message = "Data required" });

            int? particularId = null;
            if (!string.IsNullOrWhiteSpace(dto.ParticularName))
            {
                if (dto.ParticularName.StartsWith("Particular #") && int.TryParse(dto.ParticularName.Replace("Particular #", ""), out var pid))
                {
                    particularId = pid;
                }
                else
                {
                    var particular = await _context.BudgetParticulars
                        .FirstOrDefaultAsync(p => p.BudgetParticularName == dto.ParticularName && p.IsActive == true);
                    if (particular != null)
                    {
                        particularId = (int)particular.BudgetParticularId;
                    }
                    else
                    {
                        var newParticular = new BudgetParticular
                        {
                            BudgetParticularName = dto.ParticularName,
                            BudgetParticularCode = dto.ParticularName.Replace(" ", "_").ToUpper(),
                            CreateUser = "284",
                            CreateDate = DateTime.Now,
                            IsActive = true
                        };
                        _context.BudgetParticulars.Add(newParticular);
                        await _context.SaveChangesAsync();
                        particularId = (int)newParticular.BudgetParticularId;
                    }
                }
            }

            var entity = new TargetAchievement
            {
                BudgetParticularId = particularId ?? 2,
                TargetCurrentYear = decimal.TryParse(dto.TargetCurrentYear, out var cy) ? cy : 2026,
                Target = decimal.TryParse(dto.Target, out var tg) ? tg : 0,
                Achievement = decimal.TryParse(dto.Achievement, out var ac) ? ac : 0,
                Balance = decimal.TryParse(dto.Balance, out var bl) ? bl : 0,
                Date = DateTime.TryParse(dto.Date, out var dt) ? dt : DateTime.Now,
                ProductID = GetProductIdByName(dto.ProductName),
                OfficeID = int.TryParse(dto.OfficeId, out var off) ? off : 17,
                CreateUser = 284,
                IsActive = true,
                CreateDate = DateTime.Now
            };

            _context.TargetAchievements.Add(entity);
            await _context.SaveChangesAsync();

            dto.Id = entity.TargetId.ToString();
            dto.ProductName = GetProductNameById(entity.ProductID);
            return CreatedAtAction(nameof(GetTargetAchievement), new { id = entity.TargetId }, new { success = true, data = dto });
        }

        // PUT: api/TargetAchievements/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTargetAchievement(int id, [FromBody] TargetAchievementDto dto)
        {
            var entity = await _context.TargetAchievements.FirstOrDefaultAsync(x => x.TargetId == id);
            if (entity == null) return NotFound(new { success = false, message = "Not found" });

            if (!string.IsNullOrWhiteSpace(dto.ParticularName))
            {
                if (dto.ParticularName.StartsWith("Particular #") && int.TryParse(dto.ParticularName.Replace("Particular #", ""), out var pid))
                {
                    entity.BudgetParticularId = pid;
                }
                else
                {
                    var particular = await _context.BudgetParticulars
                        .FirstOrDefaultAsync(p => p.BudgetParticularName == dto.ParticularName && p.IsActive == true);
                    if (particular != null)
                    {
                        entity.BudgetParticularId = (int)particular.BudgetParticularId;
                    }
                }
            }

            if (decimal.TryParse(dto.TargetCurrentYear, out var cy)) entity.TargetCurrentYear = cy;
            if (decimal.TryParse(dto.Target, out var tg)) entity.Target = tg;
            if (decimal.TryParse(dto.Achievement, out var ac)) entity.Achievement = ac;
            if (decimal.TryParse(dto.Balance, out var bl)) entity.Balance = bl;
            if (DateTime.TryParse(dto.Date, out var dt)) entity.Date = dt;
            entity.ProductID = GetProductIdByName(dto.ProductName);

            await _context.SaveChangesAsync();

            dto.Id = entity.TargetId.ToString();
            dto.ProductName = GetProductNameById(entity.ProductID);

            return Ok(new { success = true, message = "Updated successfully", data = dto });
        }

        // DELETE: api/TargetAchievements/5 (Deletes from both dbo.targetachievement AND dbo.BudgetParticular)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTargetAchievement(int id)
        {
            var entity = await _context.TargetAchievements.FirstOrDefaultAsync(x => x.TargetId == id);
            if (entity == null) return NotFound(new { success = false, message = "Not found" });

            var particularId = entity.BudgetParticularId;

            _context.TargetAchievements.Remove(entity);
            await _context.SaveChangesAsync();

            if (particularId.HasValue)
            {
                var particular = await _context.BudgetParticulars.FirstOrDefaultAsync(p => p.BudgetParticularId == particularId.Value);
                if (particular != null)
                {
                    _context.BudgetParticulars.Remove(particular);
                    await _context.SaveChangesAsync();
                }
            }

            return Ok(new { success = true, message = "Deleted successfully from both TargetAchievement and BudgetParticular tables" });
        }
    }
}
