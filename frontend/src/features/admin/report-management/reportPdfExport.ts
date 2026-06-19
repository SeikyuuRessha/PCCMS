import jsPDF from "jspdf";
import autoTable from "jspdf-autotable/es";
import { ROBOTO_BOLD_B64, ROBOTO_REGULAR_B64 } from "./fonts/robotoFont";
import type {
    ReportRecord,
    ReportSummary,
    ServiceStats,
    PaymentStats,
    RoomStats,
    StaffStats,
    InventoryStats,
} from "./types";
import { formatCurrency } from "./reportService";
import { buildReportInsights } from "./reportInsights";

// ─── Constants ───────────────────────────────────────────────────────────────

const FONT_NAME = "Roboto";
const FONT_FILE = "Roboto-Regular.ttf";
const FONT_BOLD_FILE = "Roboto-Bold.ttf";

const PAGE_MARGIN = 15; // mm
const LINE_HEIGHT = 6; // mm
const SECTION_GAP = 8; // mm between sections

const COLORS = {
    primary: [30, 90, 50] as [number, number, number], // dark green header
    header: [240, 247, 242] as [number, number, number], // light green row
    alt: [249, 251, 249] as [number, number, number], // zebra stripe
    text: [30, 30, 30] as [number, number, number],
    muted: [100, 100, 100] as [number, number, number],
    border: [200, 210, 205] as [number, number, number],
    alert: [255, 247, 230] as [number, number, number], // amber notice bg
    info: [240, 248, 255] as [number, number, number], // light blue for missing data notice
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface JsPdfWithAutoTable extends jsPDF {
    lastAutoTable?: { finalY: number };
}

// ─── Font Setup ───────────────────────────────────────────────────────────────

function registerFont(doc: jsPDF): void {
    doc.addFileToVFS(FONT_FILE, ROBOTO_REGULAR_B64);
    doc.addFileToVFS(FONT_BOLD_FILE, ROBOTO_BOLD_B64);
    doc.addFont(FONT_FILE, FONT_NAME, "normal");
    doc.addFont(FONT_BOLD_FILE, FONT_NAME, "bold");
    doc.setFont(FONT_NAME);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function currentY(doc: jsPDF): number {
    return (doc as JsPdfWithAutoTable).lastAutoTable?.finalY ?? PAGE_MARGIN;
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y + needed > pageHeight - PAGE_MARGIN) {
        doc.addPage();
        return PAGE_MARGIN;
    }
    return y;
}

function sectionTitle(doc: jsPDF, title: string, y: number): number {
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.primary);
    doc.setFont(FONT_NAME, "bold");
    doc.text(title, PAGE_MARGIN, y);
    doc.setFont(FONT_NAME, "normal");
    doc.setTextColor(...COLORS.text);
    doc.setFontSize(10);
    return y + LINE_HEIGHT + 2;
}

function paragraph(doc: jsPDF, text: string, y: number, indent = 0): number {
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - PAGE_MARGIN * 2 - indent;
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    doc.text(lines, PAGE_MARGIN + indent, y);
    return y + lines.length * LINE_HEIGHT;
}

function noticeBox(doc: jsPDF, lines: string[], y: number, bgColor = COLORS.alert): number {
    const pageWidth = doc.internal.pageSize.getWidth();
    const boxW = pageWidth - PAGE_MARGIN * 2;
    const boxH = lines.length * LINE_HEIGHT + 8;

    doc.setFillColor(...bgColor);
    doc.roundedRect(PAGE_MARGIN, y, boxW, boxH, 2, 2, "F");

    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.text);
    lines.forEach((line, i) => {
        doc.text(line, PAGE_MARGIN + 5, y + 6 + i * LINE_HEIGHT);
    });
    return y + boxH + 4;
}

function managementBox(doc: jsPDF, title: string, items: string[], y: number): number {
    const pageWidth = doc.internal.pageSize.getWidth();
    const boxWidth = pageWidth - PAGE_MARGIN * 2;
    const contentWidth = boxWidth - 10;
    const wrappedItems = items.flatMap(
        (item) => doc.splitTextToSize(`• ${item}`, contentWidth) as string[]
    );
    const boxHeight = 11 + wrappedItems.length * 5;
    const boxY = ensureSpace(doc, y, boxHeight);

    doc.setFillColor(...COLORS.header);
    doc.setDrawColor(...COLORS.border);
    doc.roundedRect(PAGE_MARGIN, boxY, boxWidth, boxHeight, 2, 2, "FD");
    doc.setFont(FONT_NAME, "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.primary);
    doc.text(title, PAGE_MARGIN + 5, boxY + 6);
    doc.setFont(FONT_NAME, "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text);
    wrappedItems.forEach((line, index) => doc.text(line, PAGE_MARGIN + 5, boxY + 12 + index * 5));

    return boxY + boxHeight + 4;
}

function formatPct(num: number, den: number): string {
    if (den === 0) return "—";
    return `${((num / den) * 100).toLocaleString("vi-VN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

// ─── Main Export Function ─────────────────────────────────────────────────────

export interface PdfReportInput {
    records: ReportRecord[];
    summary: ReportSummary;
    fromDate: string;
    toDate: string;
    serviceStats?: ServiceStats[];
    paymentStats?: PaymentStats[];
    roomStats?: RoomStats[];
    staffStats?: StaffStats[];
    inventoryStats?: InventoryStats[];
}

export function createReportPdf({
    summary,
    fromDate,
    toDate,
    serviceStats,
    paymentStats,
    roomStats,
    staffStats,
    inventoryStats,
}: PdfReportInput): jsPDF {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        putOnlyUsedFonts: true,
    });

    registerFont(doc);

    const pageWidth = doc.internal.pageSize.getWidth();

    // ── Cover Header ───────────────────────────────────────────────────────────
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, pageWidth, 36, "F");

    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.setFont(FONT_NAME, "bold");
    doc.text("Pawluna — Báo cáo thống kê hoạt động trung tâm", PAGE_MARGIN, 12);

    doc.setFontSize(10);
    doc.setFont(FONT_NAME, "normal");
    doc.text(`Kỳ báo cáo: ${fromDate} — ${toDate}`, PAGE_MARGIN, 22);
    doc.setTextColor(...COLORS.text);
    let y = 43;

    // Intro sentence
    y = paragraph(
        doc,
        "Báo cáo này tổng hợp tình hình dịch vụ, doanh thu, lưu trú, nhân sự và tồn kho trong kỳ, " +
            "nhằm hỗ trợ quản trị viên đánh giá hoạt động và đưa ra quyết định vận hành.",
        y
    );
    y += 4;

    const totalRevenue = summary.totalRevenue;
    const totalCount = summary.totalCount;
    const insights = buildReportInsights({
        totalCount,
        totalRevenue,
        serviceStats: serviceStats ?? [],
        paymentStats: paymentStats ?? [],
        roomStats: roomStats ?? [],
        staffStats: staffStats ?? [],
        inventoryStats: inventoryStats ?? [],
    });

    // ── Section 2: Kết quả vận hành dịch vụ ──────────────────────────────────
    y = sectionTitle(doc, "1. Kết quả vận hành dịch vụ", y);

    y = paragraph(
        doc,
        `Trong kỳ báo cáo, tổng lượt dịch vụ đạt ${totalCount.toLocaleString("vi-VN")} lượt. ` +
            "Đánh giá tiến độ xử lý và khối lượng công việc của trung tâm.",
        y
    );
    y += 3;

    let hasServiceStatus = false;
    let totalCompleted = 0;
    let totalPending = 0;
    let totalCancelled = 0;

    for (const service of serviceStats ?? []) {
        if (
            service.completed !== undefined ||
            service.pending !== undefined ||
            service.cancelled !== undefined
        ) {
            hasServiceStatus = true;
        }
        totalCompleted += service.completed ?? 0;
        totalPending += service.pending ?? 0;
        totalCancelled += service.cancelled ?? 0;
    }

    autoTable(doc, {
        startY: y,
        head: [["Chỉ số tổng quan", "Giá trị", "Ý nghĩa quản trị"]],
        body: [
            [
                "Tổng lượt dịch vụ",
                totalCount.toLocaleString("vi-VN"),
                "Khối lượng dịch vụ phát sinh trong kỳ",
            ],
            [
                "Hoàn tất",
                hasServiceStatus ? totalCompleted.toLocaleString("vi-VN") : "—",
                "Lượt đã được xử lý xong",
            ],
            [
                "Chờ / đang xử lý",
                hasServiceStatus ? totalPending.toLocaleString("vi-VN") : "—",
                "Lượt cần tiếp tục theo dõi",
            ],
            [
                "Hủy",
                hasServiceStatus ? totalCancelled.toLocaleString("vi-VN") : "—",
                "Lượt dịch vụ bị hủy trong kỳ",
            ],
        ],
        styles: { font: FONT_NAME, fontSize: 9, cellPadding: 2.5, textColor: COLORS.text },
        headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: "bold" },
        columnStyles: {
            0: { cellWidth: 45 },
            1: { cellWidth: 25, halign: "right" },
            2: { cellWidth: 110 },
        },
        margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    });
    y = currentY(doc) + 5;

    const serviceRows = (serviceStats || []).map((s) => {
        return [
            s.group,
            s.count.toLocaleString("vi-VN"),
            s.completed !== undefined ? s.completed.toLocaleString("vi-VN") : "—",
            s.pending !== undefined ? s.pending.toLocaleString("vi-VN") : "—",
            s.cancelled !== undefined ? s.cancelled.toLocaleString("vi-VN") : "—",
            s.completed !== undefined ? formatPct(s.completed, s.count) : "—",
            insights.serviceAssessmentByGroup[s.group] ?? "Chưa đủ dữ liệu để nhận định.",
        ];
    });

    autoTable(doc, {
        startY: y,
        head: [
            [
                "Nhóm dịch vụ",
                "Số lượt",
                "Hoàn tất",
                "Chờ / xử lý",
                "Hủy",
                "Tỷ lệ HT",
                "Nhận định quản trị",
            ],
        ],
        body: [
            ...serviceRows,
            [
                { content: "Tổng", styles: { fontStyle: "bold" } },
                { content: totalCount.toLocaleString("vi-VN"), styles: { fontStyle: "bold" } },
                {
                    content: hasServiceStatus ? totalCompleted.toLocaleString("vi-VN") : "—",
                    styles: { fontStyle: "bold" },
                },
                {
                    content: hasServiceStatus ? totalPending.toLocaleString("vi-VN") : "—",
                    styles: { fontStyle: "bold" },
                },
                {
                    content: hasServiceStatus ? totalCancelled.toLocaleString("vi-VN") : "—",
                    styles: { fontStyle: "bold" },
                },
                {
                    content: hasServiceStatus ? formatPct(totalCompleted, totalCount) : "—",
                    styles: { fontStyle: "bold" },
                },
                { content: "Căn cứ tổng hợp toàn kỳ.", styles: { fontStyle: "bold" } },
            ],
        ],
        styles: {
            font: FONT_NAME,
            fontSize: 7.8,
            cellPadding: 2.2,
            textColor: COLORS.text,
            overflow: "linebreak",
        },
        headStyles: {
            fillColor: COLORS.primary,
            textColor: [255, 255, 255],
            fontStyle: "bold",
            halign: "center",
        },
        alternateRowStyles: { fillColor: COLORS.alt },
        columnStyles: {
            0: { cellWidth: 28 },
            1: { halign: "right", cellWidth: 17 },
            2: { halign: "right", cellWidth: 19 },
            3: { halign: "right", cellWidth: 22 },
            4: { halign: "right", cellWidth: 15 },
            5: { halign: "right", cellWidth: 20 },
            6: { cellWidth: 59 },
        },
        margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    });

    y = currentY(doc) + 4;

    if (!hasServiceStatus) {
        y = noticeBox(
            doc,
            [
                "Lưu ý: Dữ liệu trạng thái chi tiết (Hoàn tất, Đang xử lý, Hủy) hiện chưa có sẵn từ hệ thống.",
            ],
            y,
            COLORS.info
        );
    }

    y = managementBox(doc, "Nhận định dành cho quản trị viên", insights.serviceHighlights, y);

    y += SECTION_GAP;
    y = ensureSpace(doc, y, 60);

    // ── Section 3: Doanh thu và thanh toán ───────────────────────────────────
    y = sectionTitle(doc, "2. Doanh thu và thanh toán", y);

    y = paragraph(
        doc,
        "Theo dõi tình hình tài chính trong kỳ: doanh thu ghi nhận, số tiền đã thu, và khoản còn phải thu.",
        y
    );
    y += 3;

    let hasPaymentStatus = false;
    let totalCollected = 0;
    let totalOutstanding = 0;

    const paymentRows = (paymentStats || []).map((p) => {
        if (p.collected !== undefined || p.outstanding !== undefined) hasPaymentStatus = true;
        totalCollected += p.collected ?? 0;
        totalOutstanding += p.outstanding ?? 0;

        return [
            p.group,
            p.count.toLocaleString("vi-VN"),
            formatCurrency(p.revenue),
            p.collected !== undefined ? formatCurrency(p.collected) : "—",
            p.outstanding !== undefined ? formatCurrency(p.outstanding) : "—",
            p.collected !== undefined ? formatPct(p.collected, p.revenue) : "—",
            insights.paymentAssessmentByGroup[p.group] ?? "Chưa đủ dữ liệu để nhận định.",
        ];
    });

    autoTable(doc, {
        startY: y,
        head: [
            ["Khoản mục", "Số HĐ", "Doanh thu", "Đã thu", "Còn phải thu", "Tỷ lệ thu", "Nhận định"],
        ],
        body: [
            ...paymentRows,
            [
                { content: "Tổng", styles: { fontStyle: "bold" } },
                { content: totalCount.toLocaleString("vi-VN"), styles: { fontStyle: "bold" } },
                { content: formatCurrency(totalRevenue), styles: { fontStyle: "bold" } },
                {
                    content: hasPaymentStatus ? formatCurrency(totalCollected) : "—",
                    styles: { fontStyle: "bold" },
                },
                {
                    content: hasPaymentStatus ? formatCurrency(totalOutstanding) : "—",
                    styles: { fontStyle: "bold" },
                },
                {
                    content: hasPaymentStatus ? formatPct(totalCollected, totalRevenue) : "—",
                    styles: { fontStyle: "bold" },
                },
                { content: "Căn cứ tổng hợp toàn kỳ.", styles: { fontStyle: "bold" } },
            ],
        ],
        styles: {
            font: FONT_NAME,
            fontSize: 7.5,
            cellPadding: 2.1,
            textColor: COLORS.text,
            overflow: "linebreak",
        },
        headStyles: {
            fillColor: COLORS.primary,
            textColor: [255, 255, 255],
            fontStyle: "bold",
            halign: "center",
        },
        alternateRowStyles: { fillColor: COLORS.alt },
        columnStyles: {
            0: { cellWidth: 28 },
            1: { halign: "right", cellWidth: 14 },
            2: { halign: "right", cellWidth: 25 },
            3: { halign: "right", cellWidth: 25 },
            4: { halign: "right", cellWidth: 25 },
            5: { halign: "right", cellWidth: 18 },
            6: { cellWidth: 45 },
        },
        margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    });

    y = currentY(doc) + 4;

    if (!hasPaymentStatus) {
        y = noticeBox(
            doc,
            ["Lưu ý: Dữ liệu công nợ và số tiền đã thu hiện chưa có sẵn từ hệ thống."],
            y,
            COLORS.info
        );
    }

    y = managementBox(doc, "Kết luận tài chính trong kỳ", insights.financialHighlights, y);

    y += SECTION_GAP;
    y = ensureSpace(doc, y, 70);

    // ── Section 4: Lưu trú, phòng và ca trực ─────────────────────────────────
    y = sectionTitle(doc, "3. Lưu trú, phòng và ca trực", y);

    y = paragraph(
        doc,
        "Theo dõi công suất sử dụng phòng và phân bổ tải công việc theo từng ca làm việc.",
        y
    );
    y += 3;

    if (!roomStats || roomStats.length === 0) {
        y = paragraph(
            doc,
            "Chưa có dữ liệu công suất phòng để đánh giá hiệu quả khai thác lưu trú.",
            y
        );
    } else {
        autoTable(doc, {
            startY: y,
            head: [
                ["Phòng", "Loại phòng", "Ngày khả dụng", "Ngày đã dùng", "Công suất", "Nhận xét"],
            ],
            body: roomStats.map((r) => [
                r.roomName,
                r.roomType,
                String(r.availableDays),
                String(r.usedDays),
                r.occupancyRate,
                r.note,
            ]),
            styles: { font: FONT_NAME, fontSize: 9, cellPadding: 3, textColor: COLORS.text },
            headStyles: {
                fillColor: COLORS.primary,
                textColor: [255, 255, 255],
                fontStyle: "bold",
            },
            alternateRowStyles: { fillColor: COLORS.alt },
            margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
        });
        y = currentY(doc) + 5;
    }

    y = managementBox(
        doc,
        "Nhận định về lưu trú và ca trực",
        [
            ...insights.roomHighlights,
            "Chưa có dữ liệu tải công việc theo ca để xác định khung giờ cần điều phối thêm nhân sự.",
        ],
        y
    );

    y += SECTION_GAP;
    y = ensureSpace(doc, y, 60);

    // ── Section 5: Nhân sự, tồn kho và khuyến nghị ───────────────────────────
    y = sectionTitle(doc, "4. Nhân sự, tồn kho và khuyến nghị quản trị", y);
    y = paragraph(
        doc,
        "Mục này hỗ trợ đánh giá tải công việc của nhân sự, mức độ sẵn sàng của tồn kho và các việc cần ưu tiên trong kỳ tiếp theo.",
        y
    );
    y += 3;

    if (
        (!staffStats || staffStats.length === 0) &&
        (!inventoryStats || inventoryStats.length === 0)
    ) {
        y = paragraph(doc, "Chưa có dữ liệu từ hệ thống về hiệu suất nhân sự và tồn kho.", y);
    } else {
        if (staffStats && staffStats.length > 0) {
            doc.setFontSize(11);
            doc.setFont(FONT_NAME, "bold");
            doc.text("Đánh giá năng lực nhân sự", PAGE_MARGIN, y);
            doc.setFont(FONT_NAME, "normal");
            y += 5;

            autoTable(doc, {
                startY: y,
                head: [["Nhân sự", "Vai trò", "Ca làm", "Lượt xử lý", "Hoàn tất", "Nhận xét"]],
                body: staffStats.map((s) => [
                    s.staffName,
                    s.role,
                    String(s.shifts),
                    String(s.handledCount),
                    String(s.completedCount),
                    s.note,
                ]),
                styles: { font: FONT_NAME, fontSize: 9, cellPadding: 3, textColor: COLORS.text },
                headStyles: {
                    fillColor: COLORS.primary,
                    textColor: [255, 255, 255],
                    fontStyle: "bold",
                },
                alternateRowStyles: { fillColor: COLORS.alt },
                margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
            });
            y = currentY(doc) + 5;
            y = ensureSpace(doc, y, 40);
        }

        if (inventoryStats && inventoryStats.length > 0) {
            doc.setFontSize(11);
            doc.setFont(FONT_NAME, "bold");
            doc.text("Theo dõi tồn kho", PAGE_MARGIN, y);
            doc.setFont(FONT_NAME, "normal");
            y += 5;

            autoTable(doc, {
                startY: y,
                head: [
                    [
                        "Mã thuốc/vật tư",
                        "Tên thuốc/vật tư",
                        "Tồn kho",
                        "Ngưỡng cảnh báo",
                        "Đơn giá",
                        "Trạng thái",
                    ],
                ],
                body: inventoryStats.map((i) => [
                    i.itemCode,
                    i.itemName,
                    String(i.stock),
                    String(i.warningThreshold),
                    i.unitPrice,
                    i.status,
                ]),
                styles: { font: FONT_NAME, fontSize: 9, cellPadding: 3, textColor: COLORS.text },
                headStyles: {
                    fillColor: COLORS.primary,
                    textColor: [255, 255, 255],
                    fontStyle: "bold",
                },
                alternateRowStyles: { fillColor: COLORS.alt },
                margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
            });
            y = currentY(doc) + 5;
        }
    }

    y = managementBox(
        doc,
        "Nhận định về năng lực vận hành nội bộ",
        insights.workforceHighlights,
        y
    );
    y += 2;
    y = ensureSpace(doc, y, 55);

    doc.setFont(FONT_NAME, "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.primary);
    doc.text("Khuyến nghị ưu tiên cho kỳ tiếp theo", PAGE_MARGIN, y);
    doc.setFont(FONT_NAME, "normal");
    doc.setTextColor(...COLORS.text);
    y += 5;

    autoTable(doc, {
        startY: y,
        head: [["Ưu tiên", "Hành động đề xuất", "Tác động kỳ vọng"]],
        body: insights.recommendations.map((item) => [
            item.priority,
            item.action,
            item.expectedImpact,
        ]),
        styles: {
            font: FONT_NAME,
            fontSize: 8.5,
            cellPadding: 2.5,
            textColor: COLORS.text,
            overflow: "linebreak",
        },
        headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: "bold" },
        alternateRowStyles: { fillColor: COLORS.alt },
        columnStyles: {
            0: { cellWidth: 22, fontStyle: "bold" },
            1: { cellWidth: 98 },
            2: { cellWidth: 60 },
        },
        margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    });
    y = currentY(doc) + 5;
    managementBox(doc, "Tóm tắt điều hành", insights.executiveSummary, y);

    // ── Page numbers ──────────────────────────────────────────────────────────
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.muted);
        doc.text(
            `Trang ${i} / ${totalPages}   |   Pawluna — Báo cáo nội bộ — ${fromDate} đến ${toDate}`,
            PAGE_MARGIN,
            doc.internal.pageSize.getHeight() - 8
        );
    }

    // ── Save ──────────────────────────────────────────────────────────────────
    return doc;
}

export function exportReportToPdf(input: PdfReportInput): void {
    const doc = createReportPdf(input);
    doc.save(`Pawluna_Report_${input.fromDate}_${input.toDate}.pdf`);
}
