export type WorkScheduleRole = "Lễ tân" | "Nhân viên trung tâm" | "Bác sĩ thú y" | "Quản trị viên";
export type WorkScheduleShift = "Ca sáng" | "Ca chiều" | "Ca tối";
export type WorkScheduleStatus = "Đã phân công" | "Đã hủy";

export interface StaffMember {
    id: string;
    name: string;
    role: WorkScheduleRole;
}

export interface WorkSchedule {
    id: string;
    scheduleCode: string;
    staffId: string;
    staffName: string;
    role: WorkScheduleRole;
    workDate: string;
    shift: WorkScheduleShift;
    status: WorkScheduleStatus;
    note: string;
}

export interface WorkScheduleSearchParams {
    keyword: string;
    role: WorkScheduleRole | "";
    workDate: string;
    shift: WorkScheduleShift | "";
    status: WorkScheduleStatus | "";
}

export interface WorkScheduleFormValues {
    staffId: string;
    role: WorkScheduleRole | "";
    workDate: string;
    shift: WorkScheduleShift | "";
    status: WorkScheduleStatus | "";
    note: string;
}
