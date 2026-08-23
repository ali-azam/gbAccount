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
    [Tags("Account Notes")]
    public class AccNotesController : ApiControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AccNotesController(ApplicationDbContext context)
        {
            _context = context;
        }

        public class AccNoteDto
        {
            public string Id { get; set; } = string.Empty;
            public string NoteNo { get; set; } = string.Empty;
            public string NoteName { get; set; } = string.Empty;
            public bool IsActive { get; set; }
            public string CreatedAt { get; set; } = string.Empty;
        }

        // GET: api/AccNotes
        [HttpGet]
        public async Task<IActionResult> GetAccNotes()
        {
            var results = await _context.AccNotes
                .OrderBy(x => x.NoteNo)
                .ToListAsync();

            var dtos = results.Select(x => new AccNoteDto
            {
                Id = x.NoteID.ToString(),
                NoteNo = x.NoteNo.ToString(),
                NoteName = x.NoteName ?? string.Empty,
                IsActive = x.IsActive ?? false,
                CreatedAt = x.CreateDate.ToString("yyyy-MM-dd")
            }).ToList();

            return Ok(new { success = true, data = dtos });
        }

        // GET: api/AccNotes/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAccNote(int id)
        {
            var entity = await _context.AccNotes.FindAsync(id);
            if (entity == null)
            {
                return NotFound(new { success = false, message = "Account note not found" });
            }

            var dto = new AccNoteDto
            {
                Id = entity.NoteID.ToString(),
                NoteNo = entity.NoteNo.ToString(),
                NoteName = entity.NoteName ?? string.Empty,
                IsActive = entity.IsActive ?? false,
                CreatedAt = entity.CreateDate.ToString("yyyy-MM-dd")
            };

            return Ok(new { success = true, data = dto });
        }

        // POST: api/AccNotes
        [HttpPost]
        public async Task<IActionResult> PostAccNote(AccNoteDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.NoteName) || string.IsNullOrWhiteSpace(dto.NoteNo))
            {
                return BadRequest(new { success = false, message = "Note number and name are required" });
            }

            if (!int.TryParse(dto.NoteNo, out int noteNoVal))
            {
                return BadRequest(new { success = false, message = "Note number must be a valid integer" });
            }

            // Check if note no already exists and is active
            if (await _context.AccNotes.AnyAsync(x => x.NoteNo == noteNoVal && x.IsActive == true))
            {
                return BadRequest(new { success = false, message = $"Note number {noteNoVal} already exists" });
            }

            var entity = new AccNote
            {
                NoteNo = noteNoVal,
                NoteName = dto.NoteName.Trim(),
                OrgID = 1,
                IsActive = true,
                CreateUser = "system",
                CreateDate = DateTime.Now
            };

            _context.AccNotes.Add(entity);
            await _context.SaveChangesAsync();

            dto.Id = entity.NoteID.ToString();
            dto.IsActive = true;
            dto.CreatedAt = entity.CreateDate.ToString("yyyy-MM-dd");

            return CreatedAtAction(nameof(GetAccNote), new { id = entity.NoteID }, new { success = true, data = dto });
        }

        // PUT: api/AccNotes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAccNote(int id, AccNoteDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.NoteName) || string.IsNullOrWhiteSpace(dto.NoteNo))
            {
                return BadRequest(new { success = false, message = "Note number and name are required" });
            }

            if (!int.TryParse(dto.NoteNo, out int noteNoVal))
            {
                return BadRequest(new { success = false, message = "Note number must be a valid integer" });
            }

            var entity = await _context.AccNotes.FindAsync(id);
            if (entity == null)
            {
                return NotFound(new { success = false, message = "Account note not found" });
            }

            // Check uniqueness of note number if changed
            if (entity.NoteNo != noteNoVal && await _context.AccNotes.AnyAsync(x => x.NoteNo == noteNoVal && x.IsActive == true))
            {
                return BadRequest(new { success = false, message = $"Note number {noteNoVal} already exists" });
            }

            entity.NoteNo = noteNoVal;
            entity.NoteName = dto.NoteName.Trim();
            entity.IsActive = dto.IsActive;
            if (!dto.IsActive)
            {
                entity.InActiveDate = DateTime.Now;
            }
            else
            {
                entity.InActiveDate = null;
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Account note updated successfully" });
        }

        // DELETE: api/AccNotes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAccNote(int id)
        {
            var entity = await _context.AccNotes.FindAsync(id);
            if (entity == null)
            {
                return NotFound(new { success = false, message = "Account note not found" });
            }

            _context.AccNotes.Remove(entity);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Account note deleted successfully" });
        }
    }
}
