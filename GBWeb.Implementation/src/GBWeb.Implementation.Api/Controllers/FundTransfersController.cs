using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Domain.Modules.Account.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GBWeb.Implementation.Api.Controllers
{
    public class FundTransferDto
    {
        public string Id { get; set; } = string.Empty;
        public string ReceiverOfficeId { get; set; } = string.Empty;
        public string ReceiverOfficeName { get; set; } = string.Empty;
        public string TrxDate { get; set; } = string.Empty;
        public string ReffNo { get; set; } = string.Empty;
        public string SndrVoucherNo { get; set; } = string.Empty;
        public string RecVoucherNo { get; set; } = string.Empty;
        public string HoVoucherNo { get; set; } = string.Empty;
        public decimal Debit { get; set; }
        public decimal Credit { get; set; }
        public string Description { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = string.Empty;
    }

    [AllowAnonymous]
    [Tags("Fund Transfers")]
    [Route("api/[controller]")]
    [ApiController]
    public class FundTransfersController : ControllerBase
    {
        private readonly IApplicationDbContext _context;

        public FundTransfersController(IApplicationDbContext context)
        {
            _context = context;
        }

        private static string ResolveOfficeName(int? gracePeriod) => gracePeriod switch
        {
            1 => "Head Office",
            2 => "Verc",
            3 => "Branch Office",
            _ => "Verc"
        };

        // GET: api/FundTransfers
        [HttpGet]
        public async Task<IActionResult> GetFundTransfers()
        {
            var loans = await _context.PKSFFundLoans
                .OrderByDescending(l => l.FundLoanID)
                .ToListAsync();

            var dtos = loans.Select(l => new FundTransferDto
            {
                Id = l.FundLoanID.ToString(),
                ReceiverOfficeId = l.GracePeriod?.ToString() ?? "2",
                ReceiverOfficeName = ResolveOfficeName(l.GracePeriod),
                TrxDate = l.InstallmentDate?.ToString("yyyy-MM-dd") ?? DateTime.Now.ToString("yyyy-MM-dd"),
                ReffNo = l.FundLoanCode ?? string.Empty,
                SndrVoucherNo = l.LoanSanctionNo?.ToString() ?? "-",
                RecVoucherNo = l.LoanSanctionTerm?.ToString() ?? "-",
                HoVoucherNo = l.NoOfInstallment?.ToString() ?? "-",
                Debit = l.LoanInstallmentAmount ?? l.PrincipalAmount ?? 0,
                Credit = l.ServiceCharge ?? 0,
                Description = $"PKSF Fund Loan #{l.FundLoanCode}",
                CreatedAt = l.LoanDisbursementDate?.ToString("yyyy-MM-dd") ?? DateTime.Now.ToString("yyyy-MM-dd")
            }).ToList();

            return Ok(new { success = true, data = dtos });
        }

        // GET: api/FundTransfers/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetFundTransfer(int id)
        {
            var loan = await _context.PKSFFundLoans.FirstOrDefaultAsync(x => x.FundLoanID == id);
            if (loan == null)
            {
                return NotFound(new { success = false, message = "Fund transfer record not found" });
            }

            var dto = new FundTransferDto
            {
                Id = loan.FundLoanID.ToString(),
                ReceiverOfficeId = loan.GracePeriod?.ToString() ?? "2",
                ReceiverOfficeName = ResolveOfficeName(loan.GracePeriod),
                TrxDate = loan.InstallmentDate?.ToString("yyyy-MM-dd") ?? DateTime.Now.ToString("yyyy-MM-dd"),
                ReffNo = loan.FundLoanCode ?? string.Empty,
                SndrVoucherNo = loan.LoanSanctionNo?.ToString() ?? "-",
                RecVoucherNo = loan.LoanSanctionTerm?.ToString() ?? "-",
                HoVoucherNo = loan.NoOfInstallment?.ToString() ?? "-",
                Debit = loan.LoanInstallmentAmount ?? loan.PrincipalAmount ?? 0,
                Credit = loan.ServiceCharge ?? 0,
                Description = $"PKSF Fund Loan #{loan.FundLoanCode}",
                CreatedAt = loan.LoanDisbursementDate?.ToString("yyyy-MM-dd") ?? DateTime.Now.ToString("yyyy-MM-dd")
            };

            return Ok(new { success = true, data = dto });
        }

        // POST: api/FundTransfers
        [HttpPost]
        public async Task<IActionResult> PostFundTransfer([FromBody] FundTransferDto dto)
        {
            if (dto == null) return BadRequest(new { success = false, message = "Data required" });

            int gracePeriod = 2; // Verc
            if (dto.ReceiverOfficeName?.Trim().ToLower() == "head office") gracePeriod = 1;
            else if (dto.ReceiverOfficeName?.Trim().ToLower() == "branch office") gracePeriod = 3;

            var entity = new PKSFFundLoan
            {
                FundLoanCode = dto.ReffNo,
                LoanInstallmentAmount = dto.Debit,
                PrincipalAmount = dto.Debit,
                ServiceCharge = dto.Credit,
                LoanSanctionNo = int.TryParse(dto.SndrVoucherNo, out var s) ? s : 1,
                LoanSanctionTerm = int.TryParse(dto.RecVoucherNo, out var r) ? r : 1,
                NoOfInstallment = int.TryParse(dto.HoVoucherNo, out var h) ? h : 0,
                GracePeriod = gracePeriod,
                InstallmentDate = DateTime.TryParse(dto.TrxDate, out var dt) ? dt : DateTime.Now,
                LoanDisbursementDate = DateTime.Now
            };

            _context.PKSFFundLoans.Add(entity);
            await _context.SaveChangesAsync();

            dto.Id = entity.FundLoanID.ToString();
            dto.ReceiverOfficeName = ResolveOfficeName(entity.GracePeriod);
            dto.CreatedAt = DateTime.Now.ToString("yyyy-MM-dd");

            return CreatedAtAction(nameof(GetFundTransfer), new { id = entity.FundLoanID }, new { success = true, data = dto });
        }

        // PUT: api/FundTransfers/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutFundTransfer(int id, [FromBody] FundTransferDto dto)
        {
            var entity = await _context.PKSFFundLoans.FirstOrDefaultAsync(x => x.FundLoanID == id);
            if (entity == null) return NotFound(new { success = false, message = "Not found" });

            entity.FundLoanCode = dto.ReffNo;
            entity.LoanInstallmentAmount = dto.Debit;
            entity.PrincipalAmount = dto.Debit;
            entity.ServiceCharge = dto.Credit;
            if (int.TryParse(dto.SndrVoucherNo, out var s)) entity.LoanSanctionNo = s;
            if (int.TryParse(dto.RecVoucherNo, out var r)) entity.LoanSanctionTerm = r;
            if (int.TryParse(dto.HoVoucherNo, out var h)) entity.NoOfInstallment = h;
            if (DateTime.TryParse(dto.TrxDate, out var dt)) entity.InstallmentDate = dt;

            await _context.SaveChangesAsync();

            dto.Id = entity.FundLoanID.ToString();
            dto.ReceiverOfficeName = ResolveOfficeName(entity.GracePeriod);
            return Ok(new { success = true, message = "Updated successfully", data = dto });
        }

        // DELETE: api/FundTransfers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFundTransfer(int id)
        {
            var entity = await _context.PKSFFundLoans.FirstOrDefaultAsync(x => x.FundLoanID == id);
            if (entity == null) return NotFound(new { success = false, message = "Not found" });

            _context.PKSFFundLoans.Remove(entity);
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Deleted successfully" });
        }
    }
}
