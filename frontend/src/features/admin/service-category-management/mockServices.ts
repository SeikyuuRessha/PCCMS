import type { Service } from "./types";

export const serviceTypes = ["Khám bệnh", "Làm đẹp", "Lưu trú"] as const;
export const serviceStatuses = ["active", "inactive"] as const;

export const serviceTypeLabels: Record<Service["type"], string> = {
    "Khám bệnh": "Khám bệnh",
    "Làm đẹp": "Làm đẹp",
    "Lưu trú": "Lưu trú",
};

export const serviceStatusLabels = {
    active: "Đang áp dụng",
    inactive: "Ngừng áp dụng",
} as const;

export const mockServices: Service[] = [
    {
        id: "SRV-001",
        code: "DV001",
        name: "Khám tổng quát",
        type: "Khám bệnh",
        price: 200000,
        durationMinutes: 30,
        description: "Khám tổng quát và đánh giá sức khỏe ban đầu",
        status: "active",
    },
    {
        id: "SRV-002",
        code: "DV002",
        name: "Tiêm phòng",
        type: "Khám bệnh",
        price: 150000,
        durationMinutes: 20,
        description: "Tiêm phòng theo lịch và chỉ định của bác sĩ",
        status: "active",
    },
    {
        id: "SRV-003",
        code: "DV003",
        name: "Tắm sấy cơ bản",
        type: "Làm đẹp",
        price: 120000,
        durationMinutes: 60,
        description: "Tắm sạch, sấy khô và chăm sóc vệ sinh cơ bản",
        status: "active",
    },
    {
        id: "SRV-004",
        code: "DV004",
        name: "Cắt tỉa lông",
        type: "Làm đẹp",
        price: 180000,
        durationMinutes: 90,
        description: "Cắt tỉa lông theo yêu cầu và kiểu dáng phù hợp",
        status: "active",
    },
    {
        id: "SRV-005",
        code: "DV005",
        name: "Combo spa",
        type: "Làm đẹp",
        price: 300000,
        durationMinutes: 120,
        description: "Combo chăm sóc spa, tắm sấy và làm đẹp toàn diện",
        status: "active",
    },
    {
        id: "SRV-006",
        code: "DV006",
        name: "Lưu trú thường",
        type: "Lưu trú",
        price: 100000,
        durationMinutes: 1440,
        description: "Dịch vụ lưu trú tiêu chuẩn theo ngày",
        status: "active",
    },
    {
        id: "SRV-007",
        code: "DV007",
        name: "Lưu trú VIP",
        type: "Lưu trú",
        price: 200000,
        durationMinutes: 1440,
        description: "Dịch vụ lưu trú VIP với không gian riêng",
        status: "active",
    },
    {
        id: "SRV-008",
        code: "DV008",
        name: "Vệ sinh tai/móng",
        type: "Làm đẹp",
        price: 80000,
        durationMinutes: 30,
        description: "Vệ sinh tai, móng và chăm sóc chi tiết",
        status: "inactive",
    },
];
