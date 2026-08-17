using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Dtos;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Queries.GetVoucherReportPdf;

public sealed class GetVoucherReportPdfHandler(
    IApplicationDbContext dbContext,
    IVoucherReportPdfService pdfService)
    : IRequestHandler<GetVoucherReportPdfQuery, byte[]>
{
    public async Task<byte[]> Handle(
        GetVoucherReportPdfQuery request,
        CancellationToken cancellationToken)
    {
        var query =
            from master in dbContext.AccTrxMasters.AsNoTracking()

            join detail in dbContext.AccTrxDetails.AsNoTracking()
                on master.TrxMasterID equals detail.TrxMasterID

            join account in dbContext.AccCharts.AsNoTracking()
                on detail.AccID equals account.AccID

            join office in dbContext.Offices.AsNoTracking()
                on master.OfficeID equals office.OfficeID

            where master.TrxDate >= request.DateFrom
                  && master.TrxDate <= request.DateTo

            select new
            {
                Master = master,
                Detail = detail,
                Account = account,
                Office = office
            };

        // Voucher Type
        if (!string.IsNullOrWhiteSpace(request.VoucherType))
        {
            var voucherType = request.VoucherType.Trim();

            query = query.Where(x =>
                x.Master.VoucherType == voucherType);
        }

        // Voucher Number
        if (!request.ViewAllVoucher &&
            !string.IsNullOrWhiteSpace(request.VoucherNo))
        {
            var voucherNo = request.VoucherNo.Trim();

            query = query.Where(x =>
                x.Master.VoucherNo == voucherNo);
        }

        var vouchers = await query
            .OrderBy(x => x.Master.TrxDate)
            .ThenBy(x => x.Master.TrxMasterID)
            .ThenBy(x => x.Detail.TrxDetailsID)
            .Select(x => new VoucherReportDto(
                x.Master.TrxMasterID,
                x.Detail.TrxDetailsID,
                x.Master.OfficeID,
                x.Master.TrxDate,
                x.Master.VoucherNo,
                x.Master.VoucherDesc,
                x.Master.VoucherType,
                x.Master.Reference,
                x.Detail.AccID,
                x.Account.AccCode,
                x.Account.AccName,
                x.Account.AccLevel,
                x.Detail.Debit,
                x.Detail.Credit,
                x.Detail.Narration,
                x.Office.OfficeName
            ))
            .ToListAsync(cancellationToken);

        if (vouchers.Count == 0)
        {
            throw new InvalidOperationException(
                $"No vouchers found. " +
                $"DateFrom={request.DateFrom:yyyy-MM-dd}, " +
                $"DateTo={request.DateTo:yyyy-MM-dd}, " +
                $"VoucherType={request.VoucherType}, " +
                $"VoucherNo={request.VoucherNo}, " +
                $"ViewAll={request.ViewAllVoucher}");
        }

        return pdfService.Generate(vouchers);
    }
}