import { describe, expect, it } from "vitest";
import { buildReportInsights } from "~/features/admin/report-management/reportInsights";

describe("buildReportInsights", () => {
    it("turns report figures into traceable management findings and priorities", () => {
        const insights = buildReportInsights({
            totalCount: 10,
            totalRevenue: 10_000_000,
            serviceStats: [
                { group: "Khám bệnh", count: 6, revenue: 6_000_000, completed: 5, pending: 1, cancelled: 0 },
                { group: "Lưu trú", count: 4, revenue: 4_000_000, completed: 2, pending: 2, cancelled: 0 },
            ],
            paymentStats: [
                { group: "Khám bệnh", count: 6, revenue: 6_000_000, collected: 4_800_000, outstanding: 1_200_000 },
                { group: "Lưu trú", count: 4, revenue: 4_000_000, collected: 3_800_000, outstanding: 200_000 },
            ],
            roomStats: [
                { roomName: "VIP-01", roomType: "VIP", availableDays: 30, usedDays: 27, occupancyRate: "90%", note: "" },
            ],
            staffStats: [],
            inventoryStats: [
                { itemCode: "MED-01", itemName: "Thuốc A", stock: 12, warningThreshold: 15, unitPrice: "10.000 ₫", status: "Sắp chạm ngưỡng" },
            ],
        });

        expect(insights.serviceAssessmentByGroup["Khám bệnh"]).toContain("Chiếm 60,0% tổng lượt");
        expect(insights.serviceHighlights.join(" ")).toContain("Lưu trú còn 2 lượt chờ/đang xử lý");
        expect(insights.paymentAssessmentByGroup["Khám bệnh"]).toContain("Đóng góp doanh thu cao nhất");
        expect(insights.financialHighlights.join(" ")).toContain("1.400.000 ₫");
        expect(insights.recommendations[0]).toMatchObject({ priority: "Cao" });
        expect(insights.recommendations.map((item) => item.action).join(" ")).toContain("MED-01");
        expect(insights.executiveSummary.join(" ")).not.toContain("tăng");
    });

    it("states evidence gaps instead of inventing operational conclusions", () => {
        const insights = buildReportInsights({
            totalCount: 3,
            totalRevenue: 900_000,
            serviceStats: [{ group: "Khám bệnh", count: 3, revenue: 900_000 }],
            paymentStats: [{ group: "Khám bệnh", count: 3, revenue: 900_000 }],
            roomStats: [],
            staffStats: [],
            inventoryStats: [],
        });

        expect(insights.serviceHighlights.join(" ")).toContain("Chưa đủ dữ liệu trạng thái");
        expect(insights.financialHighlights.join(" ")).toContain("Chưa đủ dữ liệu thanh toán");
        expect(insights.executiveSummary.join(" ")).not.toMatch(/tăng|giảm|ổn định/i);
    });
});
