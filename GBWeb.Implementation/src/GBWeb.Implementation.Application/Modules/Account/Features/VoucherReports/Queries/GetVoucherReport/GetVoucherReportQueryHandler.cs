using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Dtos;
using GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Queries.GetVoucherReport;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Handlers;

public sealed class GetVoucherReportQueryHandler
    : IRequestHandler<GetVoucherReportQuery, IReadOnlyList<VoucherReportDto>>
{
    private readonly IApplicationDbContext _dbContext;

    public GetVoucherReportQueryHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<VoucherReportDto>> Handle(
        GetVoucherReportQuery request,
        CancellationToken cancellationToken)
    {
        var query =
            from master in _dbContext.AccTrxMasters.AsNoTracking()

            join detail in _dbContext.AccTrxDetails.AsNoTracking()
                on master.TrxMasterID equals detail.TrxMasterID

            join account in _dbContext.AccCharts.AsNoTracking()
                on detail.AccID equals account.AccID
            join office in _dbContext.Offices.AsNoTracking()
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

        // Filter by Voucher Type when selected.
        if (!string.IsNullOrWhiteSpace(request.VoucherType))
        {
            query = query.Where(x =>
                x.Master.VoucherType == request.VoucherType);
        }

        // If "View All Voucher" is NOT checked,
        // filter by the selected Voucher No when supplied.
        if (!request.ViewAllVoucher &&
            !string.IsNullOrWhiteSpace(request.VoucherNo))
        {
            query = query.Where(x =>
                x.Master.VoucherNo == request.VoucherNo);
        }

        return await query
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
    }
}