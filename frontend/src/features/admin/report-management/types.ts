export type ReportType = "REVENUE" | "Doanh thu" | "Lượt sử dụng dịch vụ" | "Lưu trú" | "Khám bệnh" | "Tài khoản người dùng";
export type ReportGroup =
    | "ALL"
    | "MEDICAL"
    | "GROOMING"
    | "BOARDING"
    | "OTHER"
    | "Tất cả"
    | "Theo bác sĩ"
    | "Theo dịch vụ"
    | "Theo lưu trú"
    | "Theo làm đẹp"
    | "Theo khám bệnh";

export interface ReportRecord {
    id: string;
    date: string;
    reportType: ReportType;
    group: string;
    categoryCode?: string;
    serviceId?: string;
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
    serviceId: string;
}

export interface ReportSummary {
    reportType: string;
    periodLabel: string;
    totalCount: number;
    totalRevenue: number;
    totalValueLabel: string;
}

export interface ServiceStats {
    group: string;
    count: number;
    revenue: number;
    completed?: number;
    pending?: number;
    cancelled?: number;
}

export interface PaymentStats {
    group: string;
    count: number;
    revenue: number;
    collected?: number;
    outstanding?: number;
}

export interface RoomStats {
    roomName: string;
    roomType: string;
    availableDays: number;
    usedDays: number;
    occupancyRate: string;
    note: string;
}

export interface StaffStats {
    staffName: string;
    role: string;
    shifts: number;
    handledCount: number;
    completedCount: number;
    note: string;
}

export interface InventoryStats {
    itemCode: string;
    itemName: string;
    stock: number;
    warningThreshold: number;
    unitPrice: string;
    status: "An toàn" | "Theo dõi" | "Sắp chạm ngưỡng";
}
