import type { StaffMember, WorkSchedule } from "./types";

export const staffMembers: StaffMember[] = [
    { id: "NV001", name: "Nguyễn Lan", role: "Lễ tân" },
    { id: "NV002", name: "Trần Minh", role: "Nhân viên trung tâm" },
    { id: "NV003", name: "Phạm Hoàng Nam", role: "Nhân viên trung tâm" },
    { id: "BS001", name: "Bác sĩ An", role: "Bác sĩ thú y" },
    { id: "BS002", name: "Bác sĩ Bình", role: "Bác sĩ thú y" },
    { id: "AD001", name: "Đỗ Hoàng Minh Hiếu", role: "Quản trị viên" },
];

export const workScheduleRoles = ["Lễ tân", "Nhân viên trung tâm", "Bác sĩ thú y", "Quản trị viên"] as const;
export const workScheduleShifts = ["Ca sáng", "Ca chiều", "Ca tối"] as const;
export const workScheduleStatuses = ["Đã phân công", "Đã hủy"] as const;

export const roleLabels: Record<(typeof workScheduleRoles)[number], string> = {
    "Lễ tân": "Lễ tân",
    "Nhân viên trung tâm": "Nhân viên trung tâm",
    "Bác sĩ thú y": "Bác sĩ thú y",
    "Quản trị viên": "Quản trị viên",
};

export const shiftLabels: Record<(typeof workScheduleShifts)[number], string> = {
    "Ca sáng": "Ca sáng",
    "Ca chiều": "Ca chiều",
    "Ca tối": "Ca tối",
};

export const statusLabels: Record<(typeof workScheduleStatuses)[number], string> = {
    "Đã phân công": "Đã phân công",
    "Đã hủy": "Đã hủy",
};

export const mockWorkSchedules: WorkSchedule[] = [
    {
        id: "WS-001",
        scheduleCode: "WS001",
        staffId: "NV001",
        staffName: "Nguyễn Lan",
        role: "Lễ tân",
        workDate: "12/04/2026",
        shift: "Ca sáng",
        status: "Đã phân công",
        note: "Trực quầy tiếp nhận",
    },
    {
        id: "WS-002",
        scheduleCode: "WS002",
        staffId: "NV002",
        staffName: "Trần Minh",
        role: "Nhân viên trung tâm",
        workDate: "12/04/2026",
        shift: "Ca chiều",
        status: "Đã phân công",
        note: "Hỗ trợ khu lưu trú",
    },
    {
        id: "WS-003",
        scheduleCode: "WS003",
        staffId: "BS001",
        staffName: "Bác sĩ An",
        role: "Bác sĩ thú y",
        workDate: "12/04/2026",
        shift: "Ca sáng",
        status: "Đã phân công",
        note: "Khám nội tổng quát",
    },
    {
        id: "WS-004",
        scheduleCode: "WS004",
        staffId: "BS002",
        staffName: "Bác sĩ Bình",
        role: "Bác sĩ thú y",
        workDate: "13/04/2026",
        shift: "Ca chiều",
        status: "Đã phân công",
        note: "Khám ngoại trú",
    },
    {
        id: "WS-005",
        scheduleCode: "WS005",
        staffId: "NV003",
        staffName: "Phạm Hoàng Nam",
        role: "Nhân viên trung tâm",
        workDate: "13/04/2026",
        shift: "Ca tối",
        status: "Đã phân công",
        note: "Theo dõi lưu trú",
    },
    {
        id: "WS-006",
        scheduleCode: "WS006",
        staffId: "NV001",
        staffName: "Nguyễn Lan",
        role: "Lễ tân",
        workDate: "14/04/2026",
        shift: "Ca sáng",
        status: "Đã hủy",
        note: "Nghỉ có phép",
    },
    {
        id: "WS-007",
        scheduleCode: "WS007",
        staffId: "NV002",
        staffName: "Trần Minh",
        role: "Nhân viên trung tâm",
        workDate: "14/04/2026",
        shift: "Ca chiều",
        status: "Đã phân công",
        note: "Spa và vệ sinh",
    },
    {
        id: "WS-008",
        scheduleCode: "WS008",
        staffId: "BS001",
        staffName: "Bác sĩ An",
        role: "Bác sĩ thú y",
        workDate: "15/04/2026",
        shift: "Ca sáng",
        status: "Đã phân công",
        note: "Khám tái khám",
    },
    {
        id: "WS-009",
        scheduleCode: "WS009",
        staffId: "NV003",
        staffName: "Phạm Hoàng Nam",
        role: "Nhân viên trung tâm",
        workDate: "15/04/2026",
        shift: "Ca tối",
        status: "Đã phân công",
        note: "Trực khu lưu trú",
    },
    {
        id: "WS-010",
        scheduleCode: "WS010",
        staffId: "NV001",
        staffName: "Nguyễn Lan",
        role: "Lễ tân",
        workDate: "16/04/2026",
        shift: "Ca chiều",
        status: "Đã phân công",
        note: "Tiếp nhận lịch hẹn",
    },
];
