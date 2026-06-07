import type { ReportRecord } from "./types";

export const reportTypes = ["Doanh thu", "Lượt sử dụng dịch vụ", "Lưu trú", "Khám bệnh", "Tài khoản người dùng"] as const;
export const reportGroups = ["Tất cả", "Theo bác sĩ", "Theo dịch vụ", "Theo lưu trú", "Theo làm đẹp", "Theo khám bệnh"] as const;

export const mockReports: ReportRecord[] = [
    { id: "RP001", date: "01/04/2026", reportType: "Doanh thu", group: "Theo khám bệnh", serviceName: "Khám bệnh", count: 12, revenue: 2400000, note: "Tăng nhẹ so với hôm trước" },
    { id: "RP002", date: "02/04/2026", reportType: "Doanh thu", group: "Theo làm đẹp", serviceName: "Làm đẹp", count: 18, revenue: 3600000, note: "Dịch vụ spa tăng trưởng tốt" },
    { id: "RP003", date: "03/04/2026", reportType: "Doanh thu", group: "Theo lưu trú", serviceName: "Lưu trú", count: 9, revenue: 2700000, note: "Tỷ lệ lấp đầy ổn định" },
    { id: "RP004", date: "04/04/2026", reportType: "Doanh thu", group: "Theo khám bệnh", serviceName: "Khám bệnh", count: 15, revenue: 3000000, note: "Số lượt tái khám cao" },
    { id: "RP005", date: "05/04/2026", reportType: "Doanh thu", group: "Theo làm đẹp", serviceName: "Làm đẹp", count: 20, revenue: 4200000, note: "Cuối tuần tăng lượt spa" },
    { id: "RP006", date: "06/04/2026", reportType: "Doanh thu", group: "Theo lưu trú", serviceName: "Lưu trú", count: 11, revenue: 3300000, note: "Phòng VIP được đặt nhiều" },
    { id: "RP007", date: "07/04/2026", reportType: "Doanh thu", group: "Theo khám bệnh", serviceName: "Khám bệnh", count: 10, revenue: 2000000, note: "Bệnh án ngoại trú tăng" },
    { id: "RP008", date: "01/04/2026", reportType: "Lượt sử dụng dịch vụ", group: "Theo dịch vụ", serviceName: "Tiêm phòng", count: 8, revenue: 1200000, note: "Dịch vụ phòng bệnh" },
    { id: "RP009", date: "02/04/2026", reportType: "Lượt sử dụng dịch vụ", group: "Theo dịch vụ", serviceName: "Tắm sấy", count: 14, revenue: 1680000, note: "Spa cơ bản" },
    { id: "RP010", date: "03/04/2026", reportType: "Lưu trú", group: "Theo lưu trú", serviceName: "Phòng thường", count: 6, revenue: 600000, note: "Lưu trú ngắn ngày" },
    { id: "RP011", date: "04/04/2026", reportType: "Khám bệnh", group: "Theo bác sĩ", serviceName: "BS An", count: 7, revenue: 1400000, note: "Khám nội tổng quát" },
    { id: "RP012", date: "05/04/2026", reportType: "Tài khoản người dùng", group: "Tất cả", serviceName: "Tài khoản mới", count: 4, revenue: 0, note: "Tài khoản mới đăng ký" },
    { id: "RP013", date: "06/04/2026", reportType: "Doanh thu", group: "Theo làm đẹp", serviceName: "Cắt tỉa lông", count: 12, revenue: 2400000, note: "Dịch vụ phổ biến" },
    { id: "RP014", date: "07/04/2026", reportType: "Lưu trú", group: "Theo lưu trú", serviceName: "Phòng VIP", count: 5, revenue: 1000000, note: "Phòng cao cấp" },
];
