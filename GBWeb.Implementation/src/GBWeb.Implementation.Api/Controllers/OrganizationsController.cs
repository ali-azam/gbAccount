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
    public class OrganizationsController : ApiControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrganizationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Organizations
        [HttpGet]
        public async Task<IActionResult> GetOrganizations()
        {
            var organizations = await _context.Organizations
                .OrderBy(o => o.OrgID)
                .ToListAsync();

            return Ok(new { success = true, data = organizations });
        }

        // GET: api/Organizations/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrganization(int id)
        {
            var organization = await _context.Organizations.FindAsync(id);

            if (organization == null)
            {
                return NotFound(new { success = false, message = "Organization not found" });
            }

            return Ok(new { success = true, data = organization });
        }

        // PUT: api/Organizations/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrganization(int id, Organization organization)
        {
            if (id != organization.OrgID)
            {
                return BadRequest(new { success = false, message = "ID mismatch" });
            }

            _context.Entry(organization).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrganizationExists(id))
                {
                    return NotFound(new { success = false, message = "Organization not found" });
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { success = true, message = "Organization updated successfully" });
        }

        // POST: api/Organizations
        [HttpPost]
        public async Task<IActionResult> PostOrganization(Organization organization)
        {
            _context.Organizations.Add(organization);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (OrganizationExists(organization.OrgID))
                {
                    return Conflict(new { success = false, message = "Organization with this ID already exists" });
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction(nameof(GetOrganization), new { id = organization.OrgID }, new { success = true, data = organization });
        }

        // DELETE: api/Organizations/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrganization(int id)
        {
            var organization = await _context.Organizations.FindAsync(id);
            if (organization == null)
            {
                return NotFound(new { success = false, message = "Organization not found" });
            }

            _context.Organizations.Remove(organization);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Organization deleted successfully" });
        }

        private bool OrganizationExists(int id)
        {
            return _context.Organizations.Any(e => e.OrgID == id);
        }
    }
}
