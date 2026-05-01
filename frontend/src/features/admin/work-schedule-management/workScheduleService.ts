import { mockWorkSchedules, staffMembers } from "./mockWorkSchedules";
import type { WorkSchedule, WorkScheduleFormValues, WorkScheduleRole, WorkScheduleSearchParams, WorkScheduleShift, WorkScheduleStatus } from "./types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let schedulesStore: WorkSchedule[] = mockWorkSchedules.map((schedule) => ({ ...schedule }));

const cloneSchedule = (schedule: WorkSchedule): WorkSchedule => ({ ...schedule });

const validateRequired = (payload: WorkScheduleFormValues) => {
    if (!payload.staffId || !payload.role || !payload.workDate || !payload.shift || !payload.status) {
        throw new Error("Vui lòng nhập đầy đủ thông tin bắt buộc");
    }
};

const getStaff = (staffId: string) => staffMembers.find((staff) => staff.id === staffId);

const findDuplicate = (payload: WorkScheduleFormValues, excludeId?: string) =>
    schedulesStore.find(
        (schedule) =>
            schedule.id !== excludeId &&
            schedule.staffId === payload.staffId &&
            schedule.workDate === payload.workDate &&
            schedule.shift === payload.shift
    );

const isRoleCompatible = (staffId: string, role: WorkScheduleRole) => getStaff(staffId)?.role === role;

export const getWorkSchedules = async () => {
    await delay(250);
    return schedulesStore.map((schedule) => cloneSchedule(schedule));
};

export const searchWorkSchedules = async (params: WorkScheduleSearchParams) => {
    await delay(300);
    const keyword = params.keyword.trim().toLowerCase();

    return schedulesStore
        .filter((schedule) => {
            const matchesKeyword =
                !keyword ||
                schedule.scheduleCode.toLowerCase().includes(keyword) ||
                schedule.staffName.toLowerCase().includes(keyword);
            const matchesRole = !params.role || schedule.role === params.role;
            const matchesDate = !params.workDate || schedule.workDate === params.workDate;
            const matchesShift = !params.shift || schedule.shift === params.shift;
            const matchesStatus = !params.status || schedule.status === params.status;
            return matchesKeyword && matchesRole && matchesDate && matchesShift && matchesStatus;
        })
        .map((schedule) => cloneSchedule(schedule));
};

export const createWorkSchedule = async (payload: WorkScheduleFormValues) => {
    await delay(300);
    validateRequired(payload);

    const staff = getStaff(payload.staffId);
    if (!staff) {
        throw new Error("Vui lòng nhập đầy đủ thông tin bắt buộc");
    }

    if (!isRoleCompatible(payload.staffId, payload.role as WorkScheduleRole)) {
        throw new Error("Vai trò làm việc không phù hợp với nhân sự đã chọn");
    }

    if (findDuplicate(payload)) {
        throw new Error("Nhân sự đã có lịch làm việc trong ca này");
    }

    const schedule: WorkSchedule = {
        id: `WS-${String(schedulesStore.length + 1).padStart(3, "0")}`,
        scheduleCode: `WS${String(schedulesStore.length + 1).padStart(3, "0")}`,
        staffId: staff.id,
        staffName: staff.name,
        role: staff.role,
        workDate: payload.workDate,
        shift: payload.shift as WorkScheduleShift,
        status: payload.status as WorkScheduleStatus,
        note: payload.note.trim(),
    };

    schedulesStore = [schedule, ...schedulesStore];
    return cloneSchedule(schedule);
};

export const updateWorkSchedule = async (id: string, payload: WorkScheduleFormValues) => {
    await delay(300);
    const index = schedulesStore.findIndex((schedule) => schedule.id === id);

    if (index === -1) {
        throw new Error("Không tìm thấy lịch làm việc cần cập nhật");
    }

    validateRequired(payload);

    const staff = getStaff(payload.staffId);
    if (!staff) {
        throw new Error("Vui lòng nhập đầy đủ thông tin bắt buộc");
    }

    if (!isRoleCompatible(payload.staffId, payload.role as WorkScheduleRole)) {
        throw new Error("Vai trò làm việc không phù hợp với nhân sự đã chọn");
    }

    if (findDuplicate(payload, id)) {
        throw new Error("Nhân sự đã có lịch làm việc trong ca này");
    }

    const updated: WorkSchedule = {
        ...schedulesStore[index],
        staffId: staff.id,
        staffName: staff.name,
        role: staff.role,
        workDate: payload.workDate,
        shift: payload.shift as WorkScheduleShift,
        status: payload.status as WorkScheduleStatus,
        note: payload.note.trim(),
    };

    schedulesStore[index] = updated;
    return cloneSchedule(updated);
};

export const cancelWorkSchedule = async (id: string) => {
    await delay(250);
    const index = schedulesStore.findIndex((schedule) => schedule.id === id);
    if (index === -1) {
        throw new Error("Không tìm thấy lịch làm việc cần hủy");
    }

    const updated: WorkSchedule = {
        ...schedulesStore[index],
        status: "Đã hủy",
    };

    schedulesStore[index] = updated;
    return cloneSchedule(updated);
};
