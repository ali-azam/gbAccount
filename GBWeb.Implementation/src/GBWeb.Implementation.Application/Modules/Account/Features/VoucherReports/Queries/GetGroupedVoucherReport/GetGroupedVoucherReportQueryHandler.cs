using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Dtos;
using GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Queries.GetGroupedVoucherReport;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Queries.GetGroupedVoucherReport;

public sealed class GetGroupedVoucherReportQueryHandler
    : IRequestHandler<GetGroupedVoucherReportQuery, IReadOnlyList<GroupedVoucherReportDto>>
{
    private readonly IApplicationDbContext _dbContext;

    public GetGroupedVoucherReportQueryHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<GroupedVoucherReportDto>> Handle(
        GetGroupedVoucherReportQuery request,
        CancellationToken cancellationToken)
    {
        var query =
            from master in _dbContext.AccTrxMasters.AsNoTracking()

            join detail in _dbContext.AccTrxDetails.AsNoTracking()
                on master.TrxMasterID equals detail.TrxMasterID

            join account in _dbContext.AccCharts.AsNoTracking()
                on detail.AccID equals account.AccID

            where master.TrxDate >= request.DateFrom
                  && master.TrxDate <= request.DateTo

            select new
            {
                Master = master,
                Detail = detail,
                Account = account
            };

        if (!string.IsNullOrWhiteSpace(request.VoucherType))
        {
            query = query.Where(x =>
                x.Master.VoucherType == request.VoucherType);
        }

        if (!request.ViewAllVoucher &&
            !string.IsNullOrWhiteSpace(request.VoucherNo))
        {
            query = query.Where(x =>
                x.Master.VoucherNo == request.VoucherNo);
        }

        var rows = await query
            .OrderBy(x => x.Master.TrxDate)
            .ThenBy(x => x.Master.TrxMasterID)
            .ThenBy(x => x.Detail.TrxDetailsID)
            .Select(x => new
            {
                x.Master.TrxMasterID,
                x.Master.OfficeID,
                x.Master.TrxDate,
                x.Master.VoucherNo,
                x.Master.VoucherDesc,
                x.Master.VoucherType,
                x.Master.Reference,

                Detail = new VoucherReportDetailDto(
                    x.Detail.TrxDetailsID,
                    x.Detail.AccID,
                    x.Account.AccCode,
                    x.Account.AccName,
                    x.Account.AccLevel,
                    x.Detail.Debit,
                    x.Detail.Credit,
                    x.Detail.Narration
                )
            })
            .ToListAsync(cancellationToken);

        return rows
            .GroupBy(x => x.TrxMasterID)
            .Select(group =>
            {
                var first = group.First();

                return new GroupedVoucherReportDto(
                    first.TrxMasterID,
                    first.OfficeID,
                    first.TrxDate,
                    first.VoucherNo,
                    first.VoucherDesc,
                    first.VoucherType,
                    first.Reference,
                    group
                        .Select(x => x.Detail)
                        .ToList()
                );
            })
            .ToList();
    }
}