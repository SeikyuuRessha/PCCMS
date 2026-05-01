import { mockReports } from "./mockReports";
import type { ReportGroup, ReportRecord, ReportSearchParams, ReportSummary } from "./types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const dateToTime = (value: string) => {
    const [day, month, year] = value.split("/").map(Number);
    return new Date(year, month - 1, day).getTime();
};

const formatCurrency = (value: number) => `${value.toLocaleString("vi-VN")} đ`;

const cloneRecord = (record: ReportRecord): ReportRecord => ({ ...record });

export const filterReportRecords = (params: ReportSearchParams): ReportRecord[] => {
    const from = dateToTime(params.fromDate);
    const to = dateToTime(params.toDate);

    return mockReports.filter((record) => {
        const recordTime = dateToTime(record.date);
        const matchesDate = recordTime >= from && recordTime <= to;
        const matchesType = !params.reportType || record.reportType === params.reportType;
        const matchesGroup = params.group === "Tất cả" || record.group === params.group;
        return matchesDate && matchesType && matchesGroup;
    }).map(cloneRecord);
};

export const buildReportSummary = (records: ReportRecord[], params: ReportSearchParams): ReportSummary => {
    const totalCount = records.reduce((sum, record) => sum + record.count, 0);
    const totalRevenue = records.reduce((sum, record) => sum + record.revenue, 0);
    return {
        reportType: params.reportType || "Doanh thu",
        periodLabel: `${params.fromDate} - ${params.toDate}`,
        totalCount,
        totalRevenue,
        totalValueLabel: formatCurrency(totalRevenue),
    };
};

export const getReportData = async (params: ReportSearchParams) => {
    await delay(350);
    return filterReportRecords(params);
};

export const getGroupBreakdown = (records: ReportRecord[]) => {
    const groups = records.reduce<Record<string, { count: number; revenue: number }>>((acc, record) => {
        if (!acc[record.group]) {
            acc[record.group] = { count: 0, revenue: 0 };
        }
        acc[record.group].count += record.count;
        acc[record.group].revenue += record.revenue;
        return acc;
    }, {});

    return Object.entries(groups).map(([group, value]) => ({ group, ...value }));
};
