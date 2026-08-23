using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GBWeb.Implementation.Domain.Modules.Account.Entities
{
    [Table("AccMappingForFundTransfer", Schema = "dbo")]
    public sealed class AccMappingForFundTransfer
    {
        [Key]
        public int ID { get; set; }
        public string? EntryType { get; set; }
        public string? VoucherType { get; set; }
        public string? HOFundAccCode { get; set; }
        public string? HOVoucherType { get; set; }
        public int? HOAccLevel { get; set; }
        public string? SenderBrFundAccCode { get; set; }
        public int? SenderBrAccLevel { get; set; }
        public string? ReceiverBrFundAccCode { get; set; }
        public int? ReceiverBrAccLevel { get; set; }
        public bool? IsActive { get; set; }
        public int? CreateBy { get; set; }
        public DateTime? CreateDate { get; set; }
        public int? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
    }
}
