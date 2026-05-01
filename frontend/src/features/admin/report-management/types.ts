export type ReportType = "Doanh thu" | "Lượt sử dụng dịch vụ" | "Lưu trú" | "Khám bệnh" | "Tài khoản người dùng";
export type ReportGroup = "Tất cả" | "Theo bác sĩ" | "Theo dịch vụ" | "Theo lưu trú" | "Theo làm đẹp" | "Theo khám bệnh";

export interface ReportRecord {
    id: string;
    date: string;
    reportType: ReportType;
    group: ReportGroup;
    serviceName: string;
    count: number;
    revenue: number;
    note: string;
}

export interface ReportSearchParams {
    fromDate: string;
    toDate: string;
    reportType: ReportType | "";
    group: ReportGroup;
}

export interface ReportSummary {
    reportType: string;
    periodLabel: string;
    totalCount: number;
    totalRevenue: number;
    totalValueLabel: string;
}
