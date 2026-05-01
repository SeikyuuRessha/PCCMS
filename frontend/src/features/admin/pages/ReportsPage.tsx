import { useEffect, useMemo, useState } from "react";
import { Button, Input, Select } from "~/components/atoms";
import { Card } from "~/components/molecules";
import { ReportBarChart } from "../report-management/components/ReportBarChart";
import { ReportEmptyState } from "../report-management/components/ReportEmptyState";
import { ReportPieChart } from "../report-management/components/ReportPieChart";
import { ReportSummaryCards } from "../report-management/components/ReportSummaryCards";
import { ReportTable } from "../report-management/components/ReportTable";
import { buildReportSummary, getGroupBreakdown, getReportData } from "../report-management/reportService";
import { mockReports, reportGroups, reportTypes } from "../report-management/mockReports";
import type { ReportRecord, ReportSearchParams, ReportSummary } from "../report-management/types";

const defaultSummaryFilters: ReportSearchParams = {
    fromDate: "01/04/2026",
    toDate: "07/04/2026",
    reportType: "Doanh thu",
    group: "Tất cả",
};

const emptyFilters: ReportSearchParams = {
    fromDate: "",
    toDate: "",
    reportType: "",
    group: "Tất cả",
};

export function ReportsPage() {
    const [filters, setFilters] = useState<ReportSearchParams>(defaultSummaryFilters);
    const [records, setRecords] = useState<ReportRecord[]>([]);
    const [summary, setSummary] = useState<ReportSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [emptyMessage, setEmptyMessage] = useState("");

    const chartData = useMemo(
        () => records.slice(0, 7).map((record) => ({ label: record.date, value: record.revenue || record.count })),
        [records]
    );

    const pieData = useMemo(() => {
        const groups = getGroupBreakdown(records);
        const total = groups.reduce((sum, item) => sum + item.revenue, 0) || 1;
        return groups.map((item) => ({
            label: item.group,
            value: item.revenue,
            percent: Math.round((item.revenue / total) * 100),
        }));
    }, [records]);

    const loadDefaultReport = async () => {
        setLoading(true);
        setError("");
        setEmptyMessage("");
        try {
            const data = await getReportData(defaultSummaryFilters);
            setRecords(data);
            setSummary(buildReportSummary(data, defaultSummaryFilters));
        } catch {
            setError("Không thể tổng hợp dữ liệu từ hệ thống");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadDefaultReport();
    }, []);

    const onSearch = async () => {
        if (!filters.fromDate || !filters.toDate || !filters.reportType) {
            setError("Vui lòng chọn đầy đủ khoảng thời gian và loại báo cáo");
            return;
        }
        if (filters.toDate < filters.fromDate) {
            setError("Đến ngày phải lớn hơn hoặc bằng Từ ngày");
            return;
        }
        setError("");
        setEmptyMessage("");
        setLoading(true);
        try {
            const data = await getReportData(filters);
            if (data.length === 0) {
                setRecords([]);
                setSummary(null);
                setEmptyMessage("Không có dữ liệu thống kê trong khoảng thời gian được chọn");
            } else {
                setRecords(data);
                setSummary(buildReportSummary(data, filters));
            }
        } catch {
            setError("Không thể tổng hợp dữ liệu từ hệ thống");
        } finally {
            setLoading(false);
        }
    };

    const onReset = () => {
        setFilters(emptyFilters);
        setRecords([]);
        setSummary(null);
        setError("");
        setEmptyMessage("");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold text-slate-900">Báo cáo thống kê</h1>
                <p className="text-sm text-slate-500">Tổng hợp dữ liệu vận hành, dịch vụ và doanh thu theo tiêu chí thống kê.</p>
            </div>

            <Card title="Tiêu chí thống kê" subtitle="Chọn khoảng thời gian, loại báo cáo và nhóm lọc để xem báo cáo mock">
                <div className="grid gap-4 lg:grid-cols-4">
                    <Input
                        label="Từ ngày"
                        type="date"
                        value={filters.fromDate}
                        onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                    />
                    <Input
                        label="Đến ngày"
                        type="date"
                        value={filters.toDate}
                        onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                    />
                    <Select
                        label="Loại báo cáo"
                        value={filters.reportType}
                        onChange={(e) => setFilters({ ...filters, reportType: e.target.value as ReportSearchParams["reportType"] })}
                        options={reportTypes.map((item) => item)}
                    />
                    <Select
                        label="Nhóm lọc"
                        value={filters.group}
                        onChange={(e) => setFilters({ ...filters, group: e.target.value as ReportSearchParams["group"] })}
                        options={reportGroups.map((item) => item)}
                    />
                </div>
                {error && <p className="mt-3 text-sm font-medium text-error-600">{error}</p>}
                <div className="mt-5 flex flex-wrap gap-3">
                    <Button onClick={onSearch} disabled={loading}>
                        {loading ? "Đang tổng hợp..." : "Xem báo cáo"}
                    </Button>
                    <Button variant="outline" onClick={onReset} disabled={loading}>
                        Làm mới
                    </Button>
                </div>
            </Card>

            <ReportSummaryCards summary={summary} />

            {emptyMessage ? (
                <ReportEmptyState />
            ) : (
                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <ReportBarChart data={chartData} />
                    <ReportPieChart items={pieData} />
                </div>
            )}

            {records.length > 0 && <ReportTable items={records} />}
        </div>
    );
}
