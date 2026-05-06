import { Button, Input, Textarea } from "~/components/atoms";
import { Card } from "~/components/molecules";
import { roleLabels, shiftLabels, statusLabels, staffMembers, workScheduleRoles, workScheduleShifts, workScheduleStatuses } from "../mockWorkSchedules";
import type { StaffMember, WorkSchedule, WorkScheduleFormValues } from "../types";

interface WorkScheduleFormDialogProps {
    open: boolean;
    mode: "create" | "edit";
    value: WorkScheduleFormValues;
    loading: boolean;
    error?: string;
    onChange: (value: WorkScheduleFormValues) => void;
    onClose: () => void;
    onSubmit: () => void;
    currentSchedule?: WorkSchedule | null;
}

export function WorkScheduleFormDialog({
    open,
    mode,
    value,
    loading,
    error,
    onChange,
    onClose,
    onSubmit,
    currentSchedule,
}: WorkScheduleFormDialogProps) {
    if (!open) return null;

    const selectedStaff = staffMembers.find((staff) => staff.id === value.staffId) ?? null;
    const filteredStaff = value.role ? staffMembers.filter((staff) => staff.role === value.role) : staffMembers;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
            <div className="w-full max-w-3xl">
                <Card title={mode === "create" ? "Thêm lịch làm việc" : "Sửa lịch làm việc"} subtitle="Nhập thông tin nhân sự, ngày làm việc và ca làm việc">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-[13px] font-medium text-slate-700">Nhân sự</label>
                            <select
                                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                value={value.staffId}
                                onChange={(e) => {
                                    const nextStaff = staffMembers.find((staff) => staff.id === e.target.value);
                                    onChange({
                                        ...value,
                                        staffId: e.target.value,
                                        role: nextStaff?.role ?? value.role,
                                    });
                                }}
                            >
                                <option value="">Chọn nhân sự</option>
                                {filteredStaff.map((staff) => (
                                    <option key={staff.id} value={staff.id}>
                                        {staff.id} - {staff.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-medium text-slate-700">Vai trò</label>
                            <select
                                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                value={value.role}
                                onChange={(e) => onChange({ ...value, role: e.target.value as WorkScheduleFormValues["role"] })}
                            >
                                <option value="">Chọn vai trò</option>
                                {workScheduleRoles.map((role) => (
                                    <option key={role} value={role}>
                                        {roleLabels[role]}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Input
                            label="Ngày làm việc"
                            value={value.workDate}
                            onChange={(e) => onChange({ ...value, workDate: e.target.value })}
                            placeholder="DD/MM/YYYY"
                        />
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-medium text-slate-700">Ca làm việc</label>
                            <select
                                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                value={value.shift}
                                onChange={(e) => onChange({ ...value, shift: e.target.value as WorkScheduleFormValues["shift"] })}
                            >
                                <option value="">Chọn ca làm việc</option>
                                {workScheduleShifts.map((shift) => (
                                    <option key={shift} value={shift}>
                                        {shiftLabels[shift]}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-medium text-slate-700">Trạng thái</label>
                            <select
                                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                value={value.status}
                                onChange={(e) => onChange({ ...value, status: e.target.value as WorkScheduleFormValues["status"] })}
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
                                onChange={(e) => onChange({ ...value, note: e.target.value })}
                                placeholder="Nhập ghi chú nếu cần"
                                rows={3}
                            />
                        </div>
                    </div>

                    {selectedStaff && currentSchedule && selectedStaff.id !== currentSchedule.staffId && (
                        <p className="mt-3 text-sm text-slate-500">Nhân sự được chọn: {selectedStaff.name}</p>
                    )}

                    {error && <p className="mt-3 text-sm font-medium text-error-600">{error}</p>}

                    <div className="mt-6 flex flex-wrap justify-end gap-3">
                        <Button variant="outline" onClick={onClose} disabled={loading}>
                            Hủy
                        </Button>
                        <Button onClick={onSubmit} disabled={loading}>
                            {loading ? "Đang lưu..." : mode === "create" ? "Thêm lịch làm việc" : "Cập nhật lịch làm việc"}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
