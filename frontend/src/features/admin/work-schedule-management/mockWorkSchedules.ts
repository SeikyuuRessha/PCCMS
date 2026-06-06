import type { StaffMember, WorkSchedule } from "./types";

export const staffMembers: StaffMember[] = [
    { id: "NV001", name: "Nguyễn Lan", role: "Lễ tân" },
    { id: "NV002", name: "Trần Minh", role: "Nhân viên trung tâm" },
    { id: "NV003", name: "Phạm Hoàng Nam", role: "Nhân viên trung tâm" },
    { id: "BS001", name: "Bác sĩ An", role: "Bác sĩ thú y" },
    { id: "BS002", name: "Bác sĩ Bình", role: "Bác sĩ thú y" },
    { id: "AD001", name: "Đỗ Hoàng Minh Hiếu", role: "Quản trị viên" },
    { id: "NV004", name: "Lê Thu Hà", role: "Lễ tân" },
    { id: "NV005", name: "Hoàng Nhật Vy", role: "Nhân viên trung tâm" },
    { id: "NV006", name: "Đặng Gia Huy", role: "Nhân viên trung tâm" },
    { id: "BS003", name: "Bác sĩ Khánh", role: "Bác sĩ thú y" },
    { id: "BS004", name: "Bác sĩ Linh", role: "Bác sĩ thú y" },
    { id: "NV007", name: "Phan Đức Tài", role: "Nhân viên trung tâm" },
    { id: "NV008", name: "Võ Mai Trang", role: "Lễ tân" },
    { id: "BS005", name: "Bác sĩ Phúc", role: "Bác sĩ thú y" },
    { id: "NV009", name: "Ngô Thanh Tùng", role: "Nhân viên trung tâm" },
    { id: "NV010", name: "Bùi Ngọc Anh", role: "Nhân viên trung tâm" },
    { id: "BS006", name: "Bác sĩ Duy", role: "Bác sĩ thú y" },
    { id: "NV011", name: "Trịnh Mỹ Duyên", role: "Lễ tân" },
    { id: "NV012", name: "Lâm Quốc Bảo", role: "Nhân viên trung tâm" },
    { id: "BS007", name: "Bác sĩ Thảo", role: "Bác sĩ thú y" },
    { id: "NV013", name: "Đinh Nhật Nam", role: "Nhân viên trung tâm" },
    { id: "NV014", name: "Cao Minh Hằng", role: "Lễ tân" },
];

export const workScheduleRoles = ["Lễ tân", "Nhân viên trung tâm", "Bác sĩ thú y", "Quản trị viên"] as const;
export const workScheduleShifts = ["Ca sáng", "Ca chiều", "Ca tối"] as const;
export const workScheduleStatuses = ["Đã phân công", "Đã hủy", "Đã hoàn thành"] as const;

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
    "Đã hoàn thành": "Đã hoàn thành",
};

export const mockWorkSchedules: WorkSchedule[] = [
    { id: "WS-001", scheduleCode: "WS001", staffId: "NV001", staffName: "Nguyễn Lan", role: "Lễ tân", room: "Quầy lễ tân", position: "Tiếp nhận lịch hẹn", workDate: "12/04/2026", shift: "Ca sáng", status: "Đã phân công", note: "Trực quầy tiếp nhận" },
    { id: "WS-002", scheduleCode: "WS002", staffId: "NV002", staffName: "Trần Minh", role: "Nhân viên trung tâm", room: "Khu lưu trú", position: "Theo dõi lưu trú", workDate: "12/04/2026", shift: "Ca chiều", status: "Đã phân công", note: "Hỗ trợ khu lưu trú" },
    { id: "WS-003", scheduleCode: "WS003", staffId: "BS001", staffName: "Bác sĩ An", role: "Bác sĩ thú y", room: "Phòng khám 1", position: "Bác sĩ trực khám", workDate: "12/04/2026", shift: "Ca sáng", status: "Đã phân công", note: "Khám nội tổng quát" },
    { id: "WS-004", scheduleCode: "WS004", staffId: "BS002", staffName: "Bác sĩ Bình", role: "Bác sĩ thú y", room: "Phòng khám 2", position: "Bác sĩ trực khám", workDate: "13/04/2026", shift: "Ca chiều", status: "Đã phân công", note: "Khám ngoại trú" },
    { id: "WS-005", scheduleCode: "WS005", staffId: "NV003", staffName: "Phạm Hoàng Nam", role: "Nhân viên trung tâm", room: "Khu lưu trú", position: "Theo dõi lưu trú", workDate: "13/04/2026", shift: "Ca tối", status: "Đã phân công", note: "Theo dõi lưu trú" },
    { id: "WS-006", scheduleCode: "WS006", staffId: "NV001", staffName: "Nguyễn Lan", role: "Lễ tân", room: "Quầy lễ tân", position: "Tiếp nhận lịch hẹn", workDate: "14/04/2026", shift: "Ca sáng", status: "Đã hủy", note: "Nghỉ có phép" },
    { id: "WS-007", scheduleCode: "WS007", staffId: "NV002", staffName: "Trần Minh", role: "Nhân viên trung tâm", room: "Khu spa", position: "Spa và vệ sinh", workDate: "14/04/2026", shift: "Ca chiều", status: "Đã phân công", note: "Spa và vệ sinh" },
    { id: "WS-008", scheduleCode: "WS008", staffId: "BS001", staffName: "Bác sĩ An", role: "Bác sĩ thú y", room: "Phòng nội trú", position: "Chăm sóc nội trú", workDate: "15/04/2026", shift: "Ca sáng", status: "Đã phân công", note: "Khám tái khám" },
    { id: "WS-009", scheduleCode: "WS009", staffId: "NV003", staffName: "Phạm Hoàng Nam", role: "Nhân viên trung tâm", room: "Khu lưu trú", position: "Theo dõi lưu trú", workDate: "15/04/2026", shift: "Ca tối", status: "Đã phân công", note: "Trực khu lưu trú" },
    { id: "WS-010", scheduleCode: "WS010", staffId: "NV001", staffName: "Nguyễn Lan", role: "Lễ tân", room: "Quầy lễ tân", position: "Tiếp nhận lịch hẹn", workDate: "16/04/2026", shift: "Ca chiều", status: "Đã phân công", note: "Tiếp nhận lịch hẹn" },

    { id: "WS-011", scheduleCode: "WS011", staffId: "NV004", staffName: "Lê Thu Hà", role: "Lễ tân", room: "Quầy lễ tân", position: "Đón khách", workDate: "12/04/2026", shift: "Ca sáng", status: "Đã phân công", note: "Mở quầy đón khách" },
    { id: "WS-012", scheduleCode: "WS012", staffId: "NV005", staffName: "Hoàng Nhật Vy", role: "Nhân viên trung tâm", room: "Khu bếp", position: "Chuẩn bị thức ăn", workDate: "12/04/2026", shift: "Ca sáng", status: "Đã phân công", note: "Chuẩn bị thức ăn cho thú cưng" },
    { id: "WS-013", scheduleCode: "WS013", staffId: "NV006", staffName: "Đặng Gia Huy", role: "Nhân viên trung tâm", room: "Khu vệ sinh", position: "Dọn dẹp khu nuôi", workDate: "12/04/2026", shift: "Ca sáng", status: "Đã phân công", note: "Vệ sinh khu chăm sóc" },
    { id: "WS-014", scheduleCode: "WS014", staffId: "BS003", staffName: "Bác sĩ Khánh", role: "Bác sĩ thú y", room: "Phòng khám 3", position: "Siêu âm tổng quát", workDate: "12/04/2026", shift: "Ca sáng", status: "Đã phân công", note: "Siêu âm và kiểm tra tổng quát" },
    { id: "WS-015", scheduleCode: "WS015", staffId: "BS004", staffName: "Bác sĩ Linh", role: "Bác sĩ thú y", room: "Phòng tiêm phòng", position: "Tiêm phòng", workDate: "12/04/2026", shift: "Ca sáng", status: "Đã phân công", note: "Tiêm phòng theo lịch" },
    { id: "WS-016", scheduleCode: "WS016", staffId: "NV007", staffName: "Phan Đức Tài", role: "Nhân viên trung tâm", room: "Khu tiếp nhận", position: "Hỗ trợ nhận thú cưng", workDate: "12/04/2026", shift: "Ca sáng", status: "Đã phân công", note: "Hỗ trợ nhận thú cưng" },
    { id: "WS-017", scheduleCode: "WS017", staffId: "NV008", staffName: "Võ Mai Trang", role: "Lễ tân", room: "Quầy lễ tân", position: "Tiếp nhận cuộc gọi", workDate: "13/04/2026", shift: "Ca sáng", status: "Đã phân công", note: "Tiếp nhận cuộc gọi đặt lịch" },
    { id: "WS-018", scheduleCode: "WS018", staffId: "BS005", staffName: "Bác sĩ Phúc", role: "Bác sĩ thú y", room: "Phòng khám 1", position: "Khám ngoại trú", workDate: "13/04/2026", shift: "Ca sáng", status: "Đã phân công", note: "Khám ngoại trú buổi sáng" },
    { id: "WS-019", scheduleCode: "WS019", staffId: "NV009", staffName: "Ngô Thanh Tùng", role: "Nhân viên trung tâm", room: "Khu lưu trú", position: "Theo dõi phòng", workDate: "13/04/2026", shift: "Ca chiều", status: "Đã phân công", note: "Theo dõi phòng lưu trú" },
    { id: "WS-020", scheduleCode: "WS020", staffId: "NV010", staffName: "Bùi Ngọc Anh", role: "Nhân viên trung tâm", room: "Khu lưu trú", position: "Kiểm tra cuối ngày", workDate: "14/04/2026", shift: "Ca tối", status: "Đã phân công", note: "Kiểm tra khu vực cuối ngày" },
    { id: "WS-021", scheduleCode: "WS021", staffId: "BS006", staffName: "Bác sĩ Duy", role: "Bác sĩ thú y", room: "Phòng phẫu thuật", position: "Khám hậu phẫu", workDate: "15/04/2026", shift: "Ca chiều", status: "Đã phân công", note: "Khám lại ca phẫu thuật" },
    { id: "WS-022", scheduleCode: "WS022", staffId: "NV011", staffName: "Trịnh Mỹ Duyên", role: "Lễ tân", room: "Quầy lễ tân", position: "Trực điện thoại", workDate: "16/04/2026", shift: "Ca sáng", status: "Đã hủy", note: "Đổi ca đột xuất" },
    { id: "WS-023", scheduleCode: "WS023", staffId: "NV012", staffName: "Lâm Quốc Bảo", role: "Nhân viên trung tâm", room: "Khu spa", position: "Chăm sóc khách VIP", workDate: "16/04/2026", shift: "Ca sáng", status: "Đã phân công", note: "Chăm sóc khách VIP" },
    { id: "WS-024", scheduleCode: "WS024", staffId: "BS007", staffName: "Bác sĩ Thảo", role: "Bác sĩ thú y", room: "Phòng khám 2", position: "Khám định kỳ", workDate: "17/04/2026", shift: "Ca sáng", status: "Đã phân công", note: "Ca khám định kỳ" },
    { id: "WS-025", scheduleCode: "WS025", staffId: "NV013", staffName: "Đinh Nhật Nam", role: "Nhân viên trung tâm", room: "Khu spa", position: "Vệ sinh spa", workDate: "17/04/2026", shift: "Ca chiều", status: "Đã phân công", note: "Khu spa và vệ sinh" },
    { id: "WS-026", scheduleCode: "WS026", staffId: "NV014", staffName: "Cao Minh Hằng", role: "Lễ tân", room: "Quầy lễ tân", position: "Trực ngoài giờ", workDate: "18/04/2026", shift: "Ca tối", status: "Đã phân công", note: "Trực điện thoại ngoài giờ" },
];
