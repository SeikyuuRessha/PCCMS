import { Search, RotateCcw } from "lucide-react";
import { Button, Input } from "~/components/atoms";
import { Card } from "~/components/molecules";
import { roleLabels, shiftLabels, statusLabels, workScheduleRoles, workScheduleShifts, workScheduleStatuses } from "../mockWorkSchedules";
import type { WorkScheduleRole, WorkScheduleSearchParams, WorkScheduleShift, WorkScheduleStatus } from "../types";

interface WorkScheduleFiltersProps {
    value: WorkScheduleSearchParams;
    onChange: (value: WorkScheduleSearchParams) => void;
    onSearch: () => void;
    onReset: () => void;
    loading: boolean;
    error?: string;
}

export function WorkScheduleFilters({ value, onChange, onSearch, onReset, loading, error }: WorkScheduleFiltersProps) {
    return (
        <Card title="Bộ lọc tìm kiếm" subtitle="Tìm theo mã lịch, tên nhân sự, vai trò, ngày làm việc, ca và trạng thái">
            <div className="grid gap-4 lg:grid-cols-5">
                <Input
                    label="Mã lịch / nhân sự"
                    value={value.keyword}
                    onChange={(e) => onChange({ ...value, keyword: e.target.value })}
                    placeholder="Nhập mã lịch hoặc tên nhân sự"
                />
                <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-medium text-slate-700">Vai trò</label>
                    <select
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                        value={value.role}
                        onChange={(e) => onChange({ ...value, role: e.target.value as WorkScheduleRole | "" })}
                    >
                        <option value="">Tất cả vai trò</option>
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
                        onChange={(e) => onChange({ ...value, shift: e.target.value as WorkScheduleShift | "" })}
                    >
                        <option value="">Tất cả ca</option>
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
                        onChange={(e) => onChange({ ...value, status: e.target.value as WorkScheduleStatus | "" })}
                    >
                        <option value="">Tất cả trạng thái</option>
                        {workScheduleStatuses.map((status) => (
                            <option key={status} value={status}>
                                {statusLabels[status]}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && <p className="mt-3 text-sm font-medium text-error-600">{error}</p>}

            <div className="mt-5 flex flex-wrap gap-3">
                <Button onClick={onSearch} disabled={loading} className="inline-flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    {loading ? "Đang tìm..." : "Tìm kiếm"}
                </Button>
                <Button variant="outline" onClick={onReset} disabled={loading} className="inline-flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Xóa bộ lọc / Làm mới
                </Button>
            </div>
        </Card>
    );
}
