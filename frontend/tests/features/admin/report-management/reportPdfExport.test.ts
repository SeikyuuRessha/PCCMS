import { describe, expect, it, vi } from "vitest";
import { createReportPdf } from "~/features/admin/report-management/reportPdfExport";
import { ROBOTO_BOLD_B64, ROBOTO_REGULAR_B64 } from "~/features/admin/report-management/fonts/robotoFont";

function expectTrueTypeFont(base64: string): void {
    const signature = Uint8Array.from(atob(base64.slice(0, 8)), (character) => character.charCodeAt(0));

    expect(Array.from(signature.slice(0, 4))).toEqual([0, 1, 0, 0]);
}

describe("report PDF export", () => {
    it("embeds valid TrueType data for every registered Roboto font style", () => {
        expectTrueTypeFont(ROBOTO_REGULAR_B64);
        expectTrueTypeFont(ROBOTO_BOLD_B64);
    });

    it("generates a report without jsPDF font or table errors", () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

        expect(() =>
            createReportPdf({
                records: [],
                summary: {
                    reportType: "REVENUE",
                    periodLabel: "Tháng 6/2026",
                    totalValueLabel: "Doanh thu",
                    totalRevenue: 1_000_000,
                    totalCount: 1,
                },
                fromDate: "2026-06-01",
                toDate: "2026-06-30",
                serviceStats: [
                    {
                        group: "Khám bệnh",
                        count: 1,
                        revenue: 1_000_000,
                        completed: 1,
                        pending: 0,
                        cancelled: 0,
                    },
                ],
            })
        ).not.toThrow();
        expect(consoleError).not.toHaveBeenCalled();

        consoleError.mockRestore();
    });
});
