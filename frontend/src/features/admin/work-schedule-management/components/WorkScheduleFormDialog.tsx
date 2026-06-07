import { Button, Input, Textarea } from "~/components/atoms";
import { Card } from "~/components/molecules";
import type {
    WorkSchedule,
    WorkScheduleFormValues,
    WorkScheduleOptions,
    WorkScheduleRole,
    WorkScheduleShift,
    WorkScheduleStatus,
} from "../types";

interface WorkScheduleFormDialogProps {
    open: boolean;
    mode: "create" | "edit";
    value: WorkScheduleFormValues;
    options: WorkScheduleOptions;
    loading: boolean;
    error?: string;
    optionError?: string;
    onChange: (value: WorkScheduleFormValues) => void;
    onClose: () => void;
    onSubmit: () => void;
    currentSchedule?: WorkSchedule | null;
}

const workScheduleStatuses: WorkScheduleStatus[] = ["Đã phân công", "Đã hủy", "Đã hoàn thành"];

const statusLabels: Record<WorkScheduleStatus, string> = {
    "Đã phân công": "Đã phân công",
    "Đã hủy": "Đã hủy",
    "Đã hoàn thành": "Đã hoàn thành",
};

const roleLabelFromCode = (code?: string): WorkScheduleRole => {
    switch (code) {
        case "ADMIN":
            return "Quản trị viên";
        case "VETERINARIAN":
            return "Bác sĩ thú y";
        case "STAFF":
            return "Nhân viên trung tâm";
        default:
            return "Lễ tân";
    }
};

const shiftLabelFromCode = (code?: string, name?: string): WorkScheduleShift => {
    const value = `${code ?? ""} ${name ?? ""}`.toLowerCase();
    if (value.includes("evening") || value.includes("tối") || value.includes("toi")) {
        return "Ca tối";
    }
    if (value.includes("afternoon") || value.includes("chiều") || value.includes("chieu")) {
        return "Ca chiều";
    }
    return "Ca sáng";
};

const formatShiftTime = (startTime?: string, endTime?: string) => {
    if (!startTime && !endTime) return "";
    return ` (${startTime?.slice(0, 5) ?? "--:--"} - ${endTime?.slice(0, 5) ?? "--:--"})`;
};

const locationValue = (type: "exam" | "station", id: string) => `${type}:${id}`;

export function WorkScheduleFormDialog({
    open,
    mode,
    value,
    options,
    loading,
    error,
    optionError,
    onChange,
    onClose,
    onSubmit,
    currentSchedule,
}: WorkScheduleFormDialogProps) {
    if (!open) return null;

    const selectedStaff = options.staff.find((staff) => staff.id === value.staffId) ?? null;
    const missingRequiredOptions = options.staff.length === 0 || options.shifts.length === 0 || options.roles.length === 0;
    const canSubmit = !loading && !missingRequiredOptions;
    const selectedLocation = value.examRoomId
        ? locationValue("exam", value.examRoomId)
        : value.stationId
            ? locationValue("station", value.stationId)
            : "";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
            <div className="w-full max-w-3xl">
                <Card
                    title={mode === "create" ? "Thêm lịch làm việc" : "Sửa lịch làm việc"}
                    subtitle="Chọn dữ liệu nhân sự, ca và vai trò đang có trên hệ thống"
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-[13px] font-medium text-slate-700">Nhân sự</label>
                            <select
                                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                value={value.staffId}
                                onChange={(event) => {
                                    const nextStaff = options.staff.find((staff) => staff.id === event.target.value);
                                    onChange({
                                        ...value,
                                        staffId: event.target.value,
                                        role: nextStaff?.roleCode ? roleLabelFromCode(nextStaff.roleCode) : value.role,
                                    });
                                }}
                            >
                                <option value="">Chọn nhân sự</option>
                                {options.staff.map((staff) => (
                                    <option key={staff.id} value={staff.id}>
                                        {staff.fullName}
                                        {staff.roleName ? ` - ${staff.roleName}` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-medium text-slate-700">Vai trò</label>
                            <select
                                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                value={value.roleId}
                                onChange={(event) => {
                                    const role = options.roles.find((item) => item.id === event.target.value);
                                    onChange({
                                        ...value,
                                        roleId: event.target.value,
                                        role: role ? roleLabelFromCode(role.code) : "",
                                    });
                                }}
                            >
                                <option value="">Chọn vai trò</option>
                                {options.roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-medium text-slate-700">Ca làm việc</label>
                            <select
                                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                value={value.shiftId}
                                onChange={(event) => {
                                    const shift = options.shifts.find((item) => item.id === event.target.value);
                                    onChange({
                                        ...value,
                                        shiftId: event.target.value,
                                        shift: shift ? shiftLabelFromCode(shift.shiftCode, shift.shiftName) : "",
                                    });
                                }}
                            >
                                <option value="">Chọn ca làm việc</option>
                                {options.shifts.map((shift) => (
                                    <option key={shift.id} value={shift.id}>
                                        {shift.shiftName || shift.shiftCode}
                                        {formatShiftTime(shift.startTime, shift.endTime)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="Phòng làm việc"
                            value={value.room}
                            readOnly
                            placeholder="Tự động theo vị trí làm việc"
                        />

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-medium text-slate-700">Vị trí làm việc</label>
                            <select
                                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                value={selectedLocation}
                                onChange={(event) => {
                                    const [locationType, locationId] = event.target.value.split(":");
                                    const room = options.examRooms.find((item) => item.id === locationId);
                                    const station = options.groomingStations.find((item) => item.id === locationId);

                                    onChange({
                                        ...value,
                                        examRoomId: locationType === "exam" ? locationId : "",
                                        stationId: locationType === "station" ? locationId : "",
                                        room: room ? "Khu khám bệnh" : station ? "Khu spa" : "",
                                        position: room
                                            ? `${room.roomCode} - ${room.name}`
                                            : station
                                                ? `${station.stationCode} - ${station.name}`
                                                : "",
                                    });
                                }}
                            >
                                <option value="">Không chọn vị trí</option>
                                {options.examRooms.map((room) => (
                                    <option key={room.id} value={locationValue("exam", room.id)}>
                                        Khu khám bệnh - {room.roomCode} - {room.name}
                                    </option>
                                ))}
                                {options.groomingStations.map((station) => (
                                    <option key={station.id} value={locationValue("station", station.id)}>
                                        Khu spa - {station.stationCode} - {station.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="Ngày làm việc"
                            value={value.workDate}
                            onChange={(event) => onChange({ ...value, workDate: event.target.value })}
                            placeholder="DD/MM/YYYY"
                        />

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-medium text-slate-700">Trạng thái</label>
                            <select
                                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                value={value.status}
                                onChange={(event) => onChange({ ...value, status: event.target.value as WorkScheduleFormValues["status"] })}
                            >
                                <option value="">Chọn trạng thái</option>
                                {workScheduleStatuses.map((status) => (
                                    <option key={status} value={status}>
                                        {statusLabels[status]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <Textarea
                                label="Ghi chú"
                                value={value.note}
                                onChange={(event) => onChange({ ...value, note: event.target.value })}
                                placeholder="Nhập ghi chú nếu cần"
                                rows={3}
                            />
                        </div>
                    </div>

                    {selectedStaff && currentSchedule && selectedStaff.id !== currentSchedule.staffId && (
                        <p className="mt-3 text-sm text-slate-500">Nhân sự được chọn: {selectedStaff.fullName}</p>
                    )}

                    {missingRequiredOptions && (
                        <p className="mt-3 text-sm font-medium text-amber-700">
                            Chưa có dữ liệu nhân sự, ca làm việc hoặc vai trò từ hệ thống. Không thể lưu lịch thật.
                        </p>
                    )}

                    {optionError && <p className="mt-3 text-sm font-medium text-amber-700">{optionError}</p>}

                    {error && <p className="mt-3 text-sm font-medium text-error-600">{error}</p>}

                    <div className="mt-6 flex flex-wrap justify-end gap-3">
                        <Button variant="outline" onClick={onClose} disabled={loading}>
                            Hủy
                        </Button>
                        <Button onClick={onSubmit} disabled={!canSubmit}>
                            {loading ? "Đang lưu..." : mode === "create" ? "Thêm lịch làm việc" : "Cập nhật lịch làm việc"}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
