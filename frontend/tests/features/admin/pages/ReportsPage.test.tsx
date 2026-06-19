import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReportsPage } from "~/features/admin/pages/ReportsPage";
import { exportReportToPdf } from "~/features/admin/report-management/reportPdfExport";
import { getReportData } from "~/features/admin/report-management/reportService";

vi.mock("~/features/admin/report-management/reportService", () => ({
    getDefaultReportFilters: vi.fn(() => ({
        fromDate: "2023-01-01",
        toDate: "2023-12-31",
        reportType: "REVENUE",
        group: "ALL",
        serviceId: "",
    })),
    getGroupBreakdown: vi.fn(() => []),
    getReportData: vi.fn(),
}));

vi.mock("~/features/admin/report-management/reportPdfExport", () => ({
    exportReportToPdf: vi.fn(),
}));

describe("ReportsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render Export PDF button and export the loaded report when clicked", async () => {
        vi.mocked(getReportData).mockResolvedValue({
            records: [
                {
                    id: "rec-1",
                    reportType: "REVENUE",
                    date: "2023-01-01",
                    revenue: 1000000,
                    count: 10,
                    group: "MEDICAL",
                    serviceName: "Khám",
                    note: "",
                },
            ],
            summary: {
                reportType: "REVENUE",
                periodLabel: "2023",
                totalValueLabel: "Doanh thu",
                totalRevenue: 1000000,
                totalCount: 10,
            },
            serviceStats: [{ group: "MEDICAL", count: 10, revenue: 1000000 }],
            paymentStats: [{ group: "MEDICAL", count: 10, revenue: 1000000 }],
        });

        render(<ReportsPage />);

        // Wait for data to load
        await waitFor(() => {
            expect(screen.getByText(/1\.000\.000/)).toBeInTheDocument();
        });

        const exportBtn = screen.getByRole("button", { name: /Xuất Báo Cáo PDF/i });
        expect(exportBtn).toBeInTheDocument();
        expect(exportBtn).not.toBeDisabled();

        await userEvent.click(exportBtn);

        expect(exportReportToPdf).toHaveBeenCalledTimes(1);
    });

    it("should disable Export PDF button when there are no records", async () => {
        vi.mocked(getReportData).mockResolvedValue({
            records: [],
            summary: {
                reportType: "REVENUE",
                periodLabel: "2023",
                totalValueLabel: "Doanh thu",
                totalRevenue: 0,
                totalCount: 0,
            },
            serviceStats: [],
            paymentStats: [],
        });

        render(<ReportsPage />);

        await waitFor(() => {
            expect(screen.getByText("Không có dữ liệu trong khoảng thời gian đã chọn")).toBeInTheDocument();
        });

        const exportBtn = screen.getByRole("button", { name: /Xuất Báo Cáo PDF/i });
        expect(exportBtn).toBeInTheDocument();
        expect(exportBtn).toBeDisabled();
    });
});
