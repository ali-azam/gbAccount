using System;

namespace GBWeb.Implementation.Domain.Modules.Account.Entities
{
    public class GbAccount
    {
        public Guid Id { get; set; }

        public required string AccCode { get; set; }

        public required string AccName { get; set; }
    }
}
