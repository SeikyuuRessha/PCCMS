export type WorkScheduleRole = "Lễ tân" | "Nhân viên trung tâm" | "Bác sĩ thú y" | "Quản trị viên";
export type WorkScheduleShift = "Ca sáng" | "Ca chiều" | "Ca tối";
export type WorkScheduleStatus = "Đã phân công" | "Đã hủy" | "Đã hoàn thành";
export type WorkScheduleSource = "backend" | "demo" | "local";
export type BackendScheduleStatus = "ASSIGNED" | "CANCELLED" | "COMPLETED";

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
    shiftId?: string;
    roleId?: string;
    examRoomId?: string;
    stationId?: string;
    capacity?: number;
    statusCode?: BackendScheduleStatus;
    role: WorkScheduleRole;
    room: string;
    position: string;
    workDate: string;
    shift: WorkScheduleShift;
    status: WorkScheduleStatus;
    note: string;
    source?: WorkScheduleSource;
}

export interface WorkScheduleSearchParams {
    keyword: string;
    role: WorkScheduleRole | "";
    room: string;
    position: string;
    workDate: string;
    shift: WorkScheduleShift | "";
    status: WorkScheduleStatus | "";
}

export interface WorkScheduleFormValues {
    staffId: string;
    shiftId: string;
    roleId: string;
    examRoomId: string;
    stationId: string;
    capacity: string;
    role: WorkScheduleRole | "";
    room: string;
    position: string;
    workDate: string;
    shift: WorkScheduleShift | "";
    status: WorkScheduleStatus | "";
    note: string;
}

export interface WorkScheduleStaffOption {
    id: string;
    fullName: string;
    roleCode?: string;
    roleName?: string;
}

export interface WorkScheduleShiftOption {
    id: string;
    shiftCode: string;
    shiftName: string;
    startTime: string;
    endTime: string;
}

export interface WorkScheduleRoleOption {
    id: string;
    code: string;
    name: string;
}

export interface WorkScheduleExamRoomOption {
    id: string;
    roomCode: string;
    name: string;
}

export interface WorkScheduleGroomingStationOption {
    id: string;
    stationCode: string;
    name: string;
}

export interface WorkScheduleOptions {
    staff: WorkScheduleStaffOption[];
    shifts: WorkScheduleShiftOption[];
    roles: WorkScheduleRoleOption[];
    examRooms: WorkScheduleExamRoomOption[];
    groomingStations: WorkScheduleGroomingStationOption[];
}
