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
    [Tags("Budget Entries")]
    public class BudgetsController : ApiControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BudgetsController(ApplicationDbContext context)
        {
            _context = context;
        }

        public class BudgetDto
        {
            public string Id { get; set; } = string.Empty;
            public string BudgetType { get; set; } = string.Empty; // "Financial" | "Program"
            public string BudgetYear { get; set; } = string.Empty;
            public string Date { get; set; } = string.Empty;
            public string AccountCode { get; set; } = string.Empty;
            public decimal Amount { get; set; }
            public string CreatedAt { get; set; } = string.Empty;
        }

        // GET: api/Budgets
        [HttpGet]
        public async Task<IActionResult> GetBudgets()
        {
            var query = from budget in _context.Budgets
                        join account in _context.AccCharts on budget.AccID equals account.AccID into accJoin
                        from acc in accJoin.DefaultIfEmpty()
                        where budget.IsActive == true
                        select new
                        {
                            Budget = budget,
                            Account = acc
                        };

            var results = await query
                .OrderByDescending(x => x.Budget.CreateDate)
                .ToListAsync();

            var dtos = results.Select(x => new BudgetDto
            {
                Id = x.Budget.BudgetID.ToString(),
                BudgetType = x.Budget.IsFinancial == true ? "Financial" : "Program",
                BudgetYear = x.Budget.BudgetYear?.ToString() ?? string.Empty,
                Date = x.Budget.TrxDate?.ToString("yyyy-MM-dd") ?? string.Empty,
                AccountCode = x.Account != null ? x.Account.AccCode : string.Empty,
                Amount = x.Budget.BudgetAmount,
                CreatedAt = x.Budget.CreateDate.ToString("yyyy-MM-dd")
            }).ToList();

            return Ok(new { success = true, data = dtos });
        }

        // GET: api/Budgets/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBudget(int id)
        {
            var query = from budget in _context.Budgets
                        join account in _context.AccCharts on budget.AccID equals account.AccID into accJoin
                        from acc in accJoin.DefaultIfEmpty()
                        where budget.BudgetID == id && budget.IsActive == true
                        select new
                        {
                            Budget = budget,
                            Account = acc
                        };

            var result = await query.FirstOrDefaultAsync();
            if (result == null)
            {
                return NotFound(new { success = false, message = "Budget not found" });
            }

            var dto = new BudgetDto
            {
                Id = result.Budget.BudgetID.ToString(),
                BudgetType = result.Budget.IsFinancial == true ? "Financial" : "Program",
                BudgetYear = result.Budget.BudgetYear?.ToString() ?? string.Empty,
                Date = result.Budget.TrxDate?.ToString("yyyy-MM-dd") ?? string.Empty,
                AccountCode = result.Account != null ? result.Account.AccCode : string.Empty,
                Amount = result.Budget.BudgetAmount,
                CreatedAt = result.Budget.CreateDate.ToString("yyyy-MM-dd")
            };

            return Ok(new { success = true, data = dto });
        }

        // POST: api/Budgets
        [HttpPost]
        public async Task<IActionResult> PostBudget(BudgetDto dto)
        {
            if (dto == null)
            {
                return BadRequest(new { success = false, message = "Budget data is required" });
            }

            // Resolve Account ID from AccCode or AccName
            int? accId = null;
            string? resolvedAccCode = null;
            if (!string.IsNullOrWhiteSpace(dto.AccountCode))
            {
                // Extract code if format is "Code - Name"
                var accountCode = dto.AccountCode.Contains(" - ")
                    ? dto.AccountCode.Split(new[] { " - " }, StringSplitOptions.None)[0].Trim()
                    : dto.AccountCode.Trim();

                var account = await _context.AccCharts
                    .FirstOrDefaultAsync(a => a.AccCode == accountCode || a.AccName == dto.AccountCode);
                if (account != null)
                {
                    accId = account.AccID;
                    resolvedAccCode = account.AccCode;
                }
            }

            if (accId == null)
            {
                return BadRequest(new { success = false, message = "Valid account is required" });
            }

            // Map Date
            DateTime? trxDate = null;
            if (DateTime.TryParse(dto.Date, out var dt))
            {
                trxDate = dt;
            }

            // Resolve OrgID and OfficeID from default office
            int orgId = 220;
            int officeId = 2; // Default Magura office
            var office = await _context.Offices.FindAsync(officeId);
            if (office != null)
            {
                orgId = office.OrgID;
            }

            var isFinancial = string.Equals(dto.BudgetType, "Financial", StringComparison.OrdinalIgnoreCase);

            var entity = new Budget
            {
                OrgID = orgId,
                OfficeID = officeId,
                TrxDate = trxDate,
                BudgetYear = int.TryParse(dto.BudgetYear, out var by) ? by : (int?)null,
                AccID = accId.Value,
                AccCode = resolvedAccCode,
                BudgetAmount = dto.Amount,
                BudgetType = isFinancial ? 1 : 2, // Map to Type integer
                IsActive = true,
                CreateUser = "system",
                CreateDate = DateTime.Now,
                IsFinancial = isFinancial
            };

            _context.Budgets.Add(entity);
            await _context.SaveChangesAsync();

            dto.Id = entity.BudgetID.ToString();
            dto.CreatedAt = entity.CreateDate.ToString("yyyy-MM-dd");

            return CreatedAtAction(nameof(GetBudget), new { id = entity.BudgetID }, new { success = true, data = dto });
        }

        // PUT: api/Budgets/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBudget(int id, BudgetDto dto)
        {
            if (dto == null)
            {
                return BadRequest(new { success = false, message = "Budget data is required" });
            }

            var entity = await _context.Budgets.FindAsync(id);
            if (entity == null || entity.IsActive == false)
            {
                return NotFound(new { success = false, message = "Budget not found" });
            }

            // Resolve Account ID from AccCode or AccName
            int? accId = null;
            string? resolvedAccCode = null;
            if (!string.IsNullOrWhiteSpace(dto.AccountCode))
            {
                var accountCode = dto.AccountCode.Contains(" - ")
                    ? dto.AccountCode.Split(new[] { " - " }, StringSplitOptions.None)[0].Trim()
                    : dto.AccountCode.Trim();

                var account = await _context.AccCharts
                    .FirstOrDefaultAsync(a => a.AccCode == accountCode || a.AccName == dto.AccountCode);
                if (account != null)
                {
                    accId = account.AccID;
                    resolvedAccCode = account.AccCode;
                }
            }

            if (accId != null)
            {
                entity.AccID = accId.Value;
                entity.AccCode = resolvedAccCode;
            }

            if (DateTime.TryParse(dto.Date, out var dt))
            {
                entity.TrxDate = dt;
            }

            if (int.TryParse(dto.BudgetYear, out var by))
            {
                entity.BudgetYear = by;
            }

            entity.BudgetAmount = dto.Amount;
            var isFinancial = string.Equals(dto.BudgetType, "Financial", StringComparison.OrdinalIgnoreCase);
            entity.IsFinancial = isFinancial;
            entity.BudgetType = isFinancial ? 1 : 2;

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Budget updated successfully" });
        }

        // DELETE: api/Budgets/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBudget(int id)
        {
            var entity = await _context.Budgets.FindAsync(id);
            if (entity == null)
            {
                return NotFound(new { success = false, message = "Budget not found" });
            }

            _context.Budgets.Remove(entity);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Budget deleted successfully" });
        }
    }
}
