using GBWeb.Implementation.Infrastructure.Persistence;
using GBWeb.Implementation.Domain.Modules.Account.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GBWeb.Implementation.Api.Controllers
{
    [AllowAnonymous]
    [Tags("Voucher Entries")]
    public class VouchersController : ApiControllerBase
    {
        private readonly ApplicationDbContext _context;

        public VouchersController(ApplicationDbContext context)
        {
            _context = context;
        }

        public class VoucherDto
        {
            public string Id { get; set; } = string.Empty;
            public string VoucherNo { get; set; } = string.Empty;
            public string TrxDate { get; set; } = string.Empty;
            public string TransactionType { get; set; } = string.Empty;
            public string BankAccount { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public string VoucherType { get; set; } = string.Empty;
            public string Account { get; set; } = string.Empty;
            public decimal Debit { get; set; }
            public decimal Credit { get; set; }
            public string Reference { get; set; } = string.Empty;
            public string? AutoVoucher { get; set; }
            public bool? Received { get; set; }
            public string CreatedAt { get; set; } = string.Empty;
            public int? OfficeID { get; set; }
            public string? ZoneCode { get; set; }
        }

        private static string MapTransactionTypeToDb(string type)
        {
            if (string.Equals(type, "Bank", StringComparison.OrdinalIgnoreCase))
                return "BNK";
            if (string.Equals(type, "Cash", StringComparison.OrdinalIgnoreCase))
                return "CSH";
            return type.Length > 3 ? type.Substring(0, 3) : type;
        }

        private static string MapTransactionTypeFromDb(string type)
        {
            if (string.Equals(type, "BNK", StringComparison.OrdinalIgnoreCase))
                return "Bank";
            if (string.Equals(type, "CSH", StringComparison.OrdinalIgnoreCase))
                return "Cash";
            return type;
        }

        private static string Truncate(string? value, int maxLength)
        {
            if (string.IsNullOrEmpty(value)) return string.Empty;
            return value.Length > maxLength ? value.Substring(0, maxLength) : value;
        }

        // GET: api/Vouchers
        [HttpGet]
        public async Task<IActionResult> GetVouchers([FromQuery] string? search, [FromQuery] string? filterBy)
        {
            var query = from detail in _context.AccTrxDetails
                        join master in _context.AccTrxMasters on detail.TrxMasterID equals master.TrxMasterID
                        join office in _context.Offices on master.OfficeID equals office.OfficeID
                        join account in _context.AccCharts on detail.AccID equals account.AccID into accJoin
                        from acc in accJoin.DefaultIfEmpty()
                        select new
                        {
                            Detail = detail,
                            Master = master,
                            Office = office,
                            Account = acc
                        };

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim().ToLower();
                if (filterBy == "Voucher No")
                    query = query.Where(x => x.Master.VoucherNo.ToLower().Contains(search));
                else if (filterBy == "Description")
                    query = query.Where(x => x.Master.VoucherDesc.ToLower().Contains(search));
                else if (filterBy == "Reference")
                    query = query.Where(x => x.Master.Reference.ToLower().Contains(search));
                else if (filterBy == "Type")
                    query = query.Where(x => x.Master.VoucherType.ToLower().Contains(search));
                else
                    query = query.Where(x =>
                        x.Master.VoucherNo.ToLower().Contains(search) ||
                        (x.Master.VoucherDesc != null && x.Master.VoucherDesc.ToLower().Contains(search)) ||
                        (x.Master.Reference != null && x.Master.Reference.ToLower().Contains(search)) ||
                        (x.Master.VoucherType != null && x.Master.VoucherType.ToLower().Contains(search)));
            }

            var results = await query
                .OrderByDescending(x => x.Master.TrxDate)
                .ThenByDescending(x => x.Master.TrxMasterID)
                .ToListAsync();

            var vouchers = results.Select(x => new VoucherDto
            {
                Id = x.Master.TrxMasterID.ToString(), // Map to TrxMasterID
                VoucherNo = x.Master.VoucherNo,
                TrxDate = x.Master.TrxDate.ToString("yyyy-MM-dd"),
                TransactionType = MapTransactionTypeFromDb(x.Master.VoucherType ?? "CSH"),
                BankAccount = x.Master.Reference ?? "",
                Description = x.Master.VoucherDesc ?? "",
                VoucherType = x.Detail.Debit > 0 ? "Debit" : "Credit",
                Account = x.Account != null ? x.Account.AccCode : "",
                Debit = x.Detail.Debit ?? 0,
                Credit = x.Detail.Credit ?? 0,
                Reference = x.Master.Reference ?? "",
                AutoVoucher = x.Master.IsAutoVoucher == true ? "Yes" : "No",
                Received = x.Master.IsReconcileVoucher,
                CreatedAt = x.Master.CreateDate.ToString("yyyy-MM-dd"),
                OfficeID = x.Master.OfficeID,
                ZoneCode = x.Office.SecondLevel ?? ""
            }).ToList();

            return Ok(new { success = true, data = vouchers });
        }

        // GET: api/Vouchers/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetVoucher(long id)
        {
            var result = await (from detail in _context.AccTrxDetails
                               join master in _context.AccTrxMasters on detail.TrxMasterID equals master.TrxMasterID
                               join office in _context.Offices on master.OfficeID equals office.OfficeID
                               join account in _context.AccCharts on detail.AccID equals account.AccID into accJoin
                               from acc in accJoin.DefaultIfEmpty()
                               where master.TrxMasterID == id // Filter by TrxMasterID
                               select new
                               {
                                   Detail = detail,
                                   Master = master,
                                   Office = office,
                                   Account = acc
                               }).FirstOrDefaultAsync();

            if (result == null)
            {
                return NotFound(new { success = false, message = "Voucher master not found" });
            }

            var voucher = new VoucherDto
            {
                Id = result.Master.TrxMasterID.ToString(), // Map to TrxMasterID
                VoucherNo = result.Master.VoucherNo,
                TrxDate = result.Master.TrxDate.ToString("yyyy-MM-dd"),
                TransactionType = MapTransactionTypeFromDb(result.Master.VoucherType ?? "CSH"),
                BankAccount = result.Master.Reference ?? "",
                Description = result.Master.VoucherDesc ?? "",
                VoucherType = result.Detail.Debit > 0 ? "Debit" : "Credit",
                Account = result.Account != null ? result.Account.AccCode : "",
                Debit = result.Detail.Debit ?? 0,
                Credit = result.Detail.Credit ?? 0,
                Reference = result.Master.Reference ?? "",
                AutoVoucher = result.Master.IsAutoVoucher == true ? "Yes" : "No",
                Received = result.Master.IsReconcileVoucher,
                CreatedAt = result.Master.CreateDate.ToString("yyyy-MM-dd"),
                OfficeID = result.Master.OfficeID,
                ZoneCode = result.Office.SecondLevel ?? ""
            };

            return Ok(new { success = true, data = voucher });
        }

        // POST: api/Vouchers
        [HttpPost]
        public async Task<IActionResult> PostVoucher(VoucherDto dto)
        {
            if (dto == null)
            {
                return BadRequest(new { success = false, message = "Voucher data is required" });
            }

            // Resolve Account ID from AccCode or AccName
            int? accId = null;
            if (!string.IsNullOrWhiteSpace(dto.Account))
            {
                // If it is in the format "Code - Name", extract the Code
                var accountCode = dto.Account.Contains(" - ") 
                    ? dto.Account.Split(new[] { " - " }, StringSplitOptions.None)[0].Trim() 
                    : dto.Account.Trim();

                var account = await _context.AccCharts
                    .FirstOrDefaultAsync(a => a.AccCode == accountCode || a.AccName == dto.Account);
                if (account != null)
                {
                    accId = account.AccID;
                }
            }

            // Resolve OrgID and ZoneCode from Office dynamically
            int orgId = 220; // Default fallback
            string zoneCode = "";
            var office = await _context.Offices.FindAsync(dto.OfficeID ?? 2);
            if (office != null)
            {
                orgId = office.OrgID;
                zoneCode = office.SecondLevel ?? "";
            }

            var master = new AccTrxMaster
            {
                OfficeID = dto.OfficeID ?? 2,
                TrxDate = DateTime.TryParse(dto.TrxDate, out var dt) ? dt : DateTime.Today,
                VoucherNo = string.IsNullOrWhiteSpace(dto.VoucherNo) || dto.VoucherNo.StartsWith("VCH-") ? 
                    $"VCH-{new Random().Next(100000, 999999)}" : dto.VoucherNo,
                VoucherDesc = Truncate(dto.Description, 200),
                VoucherType = MapTransactionTypeToDb(dto.TransactionType),
                Reference = Truncate(dto.Reference, 125),
                IsPosted = true,
                IsYearlyClosing = false,
                IsAutoVoucher = dto.AutoVoucher == "Yes",
                IsRectify = false,
                OrgID = orgId,
                IsActive = true,
                CreateUser = "system",
                CreateDate = DateTime.Now,
                IsReconcileVoucher = dto.Received ?? false
            };

            _context.AccTrxMasters.Add(master);
            await _context.SaveChangesAsync();

            var detail = new AccTrxDetail
            {
                TrxMasterID = master.TrxMasterID,
                AccID = accId,
                Debit = dto.Debit,
                Credit = dto.Credit,
                Narration = Truncate(dto.Description, 200),
                IsActive = true,
                CreateUser = "system",
                CreateDate = DateTime.Now
            };

            _context.AccTrxDetails.Add(detail);
            await _context.SaveChangesAsync();

            dto.Id = master.TrxMasterID.ToString(); // Map to TrxMasterID
            dto.VoucherNo = master.VoucherNo;
            dto.CreatedAt = master.CreateDate.ToString("yyyy-MM-dd");
            dto.ZoneCode = zoneCode;

            return CreatedAtAction(nameof(GetVoucher), new { id = master.TrxMasterID }, new { success = true, data = dto });
        }

        // PUT: api/Vouchers/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutVoucher(long id, VoucherDto dto)
        {
            if (dto == null)
            {
                return BadRequest(new { success = false, message = "Voucher data is required" });
            }

            var detail = await _context.AccTrxDetails
                .Include(d => d.TrxMaster)
                .FirstOrDefaultAsync(d => d.TrxMasterID == id); // Filter by TrxMasterID

            if (detail == null)
            {
                return NotFound(new { success = false, message = "Voucher details not found" });
            }

            // Resolve Account ID from AccCode or AccName
            int? accId = null;
            if (!string.IsNullOrWhiteSpace(dto.Account))
            {
                // If it is in the format "Code - Name", extract the Code
                var accountCode = dto.Account.Contains(" - ") 
                    ? dto.Account.Split(new[] { " - " }, StringSplitOptions.None)[0].Trim() 
                    : dto.Account.Trim();

                var account = await _context.AccCharts
                    .FirstOrDefaultAsync(a => a.AccCode == accountCode || a.AccName == dto.Account);
                if (account != null)
                {
                    accId = account.AccID;
                }
            }

            detail.AccID = accId;
            detail.Debit = dto.Debit;
            detail.Credit = dto.Credit;
            detail.Narration = Truncate(dto.Description, 200);

            if (detail.TrxMaster != null)
            {
                detail.TrxMaster.TrxDate = DateTime.TryParse(dto.TrxDate, out var dt) ? dt : DateTime.Today;
                detail.TrxMaster.VoucherDesc = Truncate(dto.Description, 200);
                detail.TrxMaster.VoucherType = MapTransactionTypeToDb(dto.TransactionType);
                detail.TrxMaster.Reference = Truncate(dto.Reference, 125);
                detail.TrxMaster.IsAutoVoucher = dto.AutoVoucher == "Yes";
                detail.TrxMaster.IsReconcileVoucher = dto.Received ?? false;
            }

            _context.Entry(detail).State = EntityState.Modified;
            if (detail.TrxMaster != null)
            {
                _context.Entry(detail.TrxMaster).State = EntityState.Modified;
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Voucher updated successfully" });
        }

        // DELETE: api/Vouchers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVoucher(long id)
        {
            var master = await _context.AccTrxMasters
                .Include(m => m.Details)
                .FirstOrDefaultAsync(m => m.TrxMasterID == id); // Filter by TrxMasterID

            if (master == null)
            {
                return NotFound(new { success = false, message = "Voucher master not found" });
            }

            // Remove all associated details first
            _context.AccTrxDetails.RemoveRange(master.Details);

            // Remove the master
            _context.AccTrxMasters.Remove(master);

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Voucher deleted successfully" });
        }
    }
}

