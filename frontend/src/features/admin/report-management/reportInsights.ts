import type { InventoryStats, PaymentStats, RoomStats, ServiceStats, StaffStats } from "./types";

export interface ReportRecommendation {
    priority: "Cao" | "Trung bình" | "Thấp";
    action: string;
    expectedImpact: string;
}

interface ReportInsightInput {
    totalCount: number;
    totalRevenue: number;
    serviceStats: ServiceStats[];
    paymentStats: PaymentStats[];
    roomStats: RoomStats[];
    staffStats: StaffStats[];
    inventoryStats: InventoryStats[];
}

export interface ReportInsights {
    serviceAssessmentByGroup: Record<string, string>;
    serviceHighlights: string[];
    paymentAssessmentByGroup: Record<string, string>;
    financialHighlights: string[];
    roomHighlights: string[];
    workforceHighlights: string[];
    recommendations: ReportRecommendation[];
    executiveSummary: string[];
}

function formatPercent(value: number): string {
    return `${value.toLocaleString("vi-VN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function formatVnd(value: number): string {
    return `${value.toLocaleString("vi-VN")} ₫`;
}

function ratio(part: number, total: number): number {
    return total > 0 ? (part / total) * 100 : 0;
}

function occupancyValue(room: RoomStats): number {
    const parsed = Number.parseFloat(room.occupancyRate.replace("%", "").replace(",", "."));
    if (Number.isFinite(parsed)) return parsed;
    return ratio(room.usedDays, room.availableDays);
}

export function buildReportInsights(input: ReportInsightInput): ReportInsights {
    const serviceAssessmentByGroup: Record<string, string> = {};
    const paymentAssessmentByGroup: Record<string, string> = {};
    const serviceHighlights: string[] = [];
    const financialHighlights: string[] = [];
    const roomHighlights: string[] = [];
    const workforceHighlights: string[] = [];
    const recommendations: ReportRecommendation[] = [];

    const topService = [...input.serviceStats].sort((a, b) => b.count - a.count)[0];
    const hasServiceStatus = input.serviceStats.some(
        (item) => item.completed !== undefined || item.pending !== undefined || item.cancelled !== undefined
    );

    for (const service of input.serviceStats) {
        const notes = [`Chiếm ${formatPercent(ratio(service.count, input.totalCount))} tổng lượt`];
        if (service.completed !== undefined) {
            notes.push(`tỷ lệ hoàn tất ${formatPercent(ratio(service.completed, service.count))}`);
        }
        if ((service.pending ?? 0) > 0) notes.push(`còn ${service.pending} lượt cần theo dõi`);
        if ((service.cancelled ?? 0) > 0) notes.push(`${service.cancelled} lượt bị hủy`);
        serviceAssessmentByGroup[service.group] = `${notes.join("; ")}.`;
    }

    if (topService) {
        serviceHighlights.push(
            `${topService.group} có khối lượng lớn nhất với ${topService.count.toLocaleString("vi-VN")} lượt, chiếm ${formatPercent(ratio(topService.count, input.totalCount))} tổng lượt.`
        );
    }
    if (hasServiceStatus) {
        const mostPending = [...input.serviceStats].sort((a, b) => (b.pending ?? 0) - (a.pending ?? 0))[0];
        if (mostPending && (mostPending.pending ?? 0) > 0) {
            serviceHighlights.push(`${mostPending.group} còn ${mostPending.pending} lượt chờ/đang xử lý, cần ưu tiên rà soát.`);
        } else {
            serviceHighlights.push("Không ghi nhận lượt chờ/đang xử lý trong dữ liệu của kỳ báo cáo.");
        }
    } else {
        serviceHighlights.push("Chưa đủ dữ liệu trạng thái để đánh giá tỷ lệ hoàn tất, tồn đọng và hủy dịch vụ.");
    }

    const topRevenue = [...input.paymentStats].sort((a, b) => b.revenue - a.revenue)[0];
    const hasPaymentStatus = input.paymentStats.some(
        (item) => item.collected !== undefined || item.outstanding !== undefined
    );
    for (const payment of input.paymentStats) {
        const notes = [
            payment === topRevenue
                ? "Đóng góp doanh thu cao nhất"
                : `Chiếm ${formatPercent(ratio(payment.revenue, input.totalRevenue))} doanh thu`,
        ];
        if (payment.collected !== undefined) {
            notes.push(`tỷ lệ thu ${formatPercent(ratio(payment.collected, payment.revenue))}`);
        }
        if ((payment.outstanding ?? 0) > 0) notes.push("cần đối soát công nợ");
        paymentAssessmentByGroup[payment.group] = `${notes.join("; ")}.`;
    }

    const totalCollected = input.paymentStats.reduce((sum, item) => sum + (item.collected ?? 0), 0);
    const totalOutstanding = input.paymentStats.reduce((sum, item) => sum + (item.outstanding ?? 0), 0);
    if (hasPaymentStatus) {
        financialHighlights.push(
            `Đã thu ${formatVnd(totalCollected)}, đạt ${formatPercent(ratio(totalCollected, input.totalRevenue))}; còn phải thu ${formatVnd(totalOutstanding)}.`
        );
        if (totalOutstanding > 0) {
            recommendations.push({
                priority: "Cao",
                action: `Đối soát và nhắc thanh toán khoản còn phải thu ${formatVnd(totalOutstanding)}.`,
                expectedImpact: "Giảm công nợ và cải thiện dòng tiền thực thu.",
            });
        }
    } else {
        financialHighlights.push("Chưa đủ dữ liệu thanh toán để phân biệt doanh thu ghi nhận, số tiền đã thu và công nợ.");
    }

    const totalPending = input.serviceStats.reduce((sum, item) => sum + (item.pending ?? 0), 0);
    if (hasServiceStatus && totalPending > 0) {
        recommendations.push({
            priority: "Cao",
            action: `Rà soát và phân công xử lý ${totalPending.toLocaleString("vi-VN")} lượt còn chờ/đang xử lý.`,
            expectedImpact: "Giảm nguy cơ bỏ sót khách hàng và tồn đọng dịch vụ.",
        });
    }

    if (input.roomStats.length > 0) {
        const sortedRooms = [...input.roomStats].sort((a, b) => occupancyValue(b) - occupancyValue(a));
        const highest = sortedRooms[0];
        const lowest = sortedRooms.at(-1);
        if (highest) roomHighlights.push(`${highest.roomName} có công suất cao nhất (${highest.occupancyRate}).`);
        if (lowest && lowest !== highest) roomHighlights.push(`${lowest.roomName} có công suất thấp nhất (${lowest.occupancyRate}).`);
        if (highest && occupancyValue(highest) >= 85) {
            recommendations.push({
                priority: "Trung bình",
                action: `Theo dõi khả năng đáp ứng của phòng ${highest.roomName} đang ở mức ${highest.occupancyRate}.`,
                expectedImpact: "Giảm nguy cơ quá tải và chủ động điều phối phòng lưu trú.",
            });
        }
    } else {
        roomHighlights.push("Chưa có dữ liệu công suất phòng để đánh giá hiệu quả khai thác lưu trú.");
    }

    if (input.staffStats.length > 0) {
        const busiest = [...input.staffStats].sort((a, b) => b.handledCount - a.handledCount)[0];
        if (busiest) {
            workforceHighlights.push(
                `${busiest.staffName} có khối lượng xử lý cao nhất (${busiest.handledCount.toLocaleString("vi-VN")} lượt); cần theo dõi phân bổ tải giữa các nhân sự.`
            );
        }
    } else {
        workforceHighlights.push("Chưa có dữ liệu nhân sự và ca trực để đánh giá tải công việc.");
    }

    const warningItems = input.inventoryStats.filter((item) => item.stock <= item.warningThreshold);
    if (warningItems.length > 0) {
        recommendations.push({
            priority: "Cao",
            action: `Kiểm tra kế hoạch bổ sung tồn kho cho ${warningItems.map((item) => item.itemCode).join(", ")}.`,
            expectedImpact: "Giảm nguy cơ thiếu thuốc hoặc vật tư trong kỳ tiếp theo.",
        });
    }

    if (recommendations.length === 0) {
        recommendations.push({
            priority: "Thấp",
            action: "Tiếp tục theo dõi các chỉ số hiện có và hoàn thiện ghi nhận trạng thái vận hành.",
            expectedImpact: "Tạo đủ cơ sở cho quyết định quản trị ở kỳ tiếp theo.",
        });
    }

    const executiveSummary = [
        topService
            ? `Trung tâm ghi nhận ${input.totalCount.toLocaleString("vi-VN")} lượt dịch vụ; ${topService.group} là nhóm có khối lượng lớn nhất.`
            : `Trung tâm ghi nhận ${input.totalCount.toLocaleString("vi-VN")} lượt dịch vụ trong kỳ.`,
        hasPaymentStatus
            ? `Doanh thu ghi nhận ${formatVnd(input.totalRevenue)}; còn phải thu ${formatVnd(totalOutstanding)}.`
            : `Doanh thu ghi nhận ${formatVnd(input.totalRevenue)}; chưa đủ dữ liệu để kết luận về tiền đã thu và công nợ.`,
        roomHighlights[0],
        warningItems.length > 0
            ? `${warningItems.length} mặt hàng đã chạm hoặc thấp hơn ngưỡng cảnh báo tồn kho.`
            : input.inventoryStats.length > 0
              ? "Không có mặt hàng nào chạm ngưỡng cảnh báo tồn kho."
              : "Chưa có dữ liệu tồn kho để đánh giá mức độ sẵn sàng vật tư.",
    ].filter((item): item is string => Boolean(item));

    return {
        serviceAssessmentByGroup,
        serviceHighlights,
        paymentAssessmentByGroup,
        financialHighlights,
        roomHighlights,
        workforceHighlights,
        recommendations,
        executiveSummary,
    };
}
