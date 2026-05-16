import { useEffect, useMemo, useState } from "react";
import { Button } from "~/components/atoms";
import { Card } from "~/components/molecules";
import { WorkScheduleFormDialog } from "../work-schedule-management/components/WorkScheduleFormDialog";
import { WorkScheduleCancelDialog } from "../work-schedule-management/components/WorkScheduleCancelDialog";
import {
    cancelWorkSchedule,
    createWorkSchedule,
    getWorkSchedules,
    searchWorkSchedules,
    updateWorkSchedule,
} from "../work-schedule-management/workScheduleService";
import type {
    WorkSchedule,
    WorkScheduleFormValues,
    WorkScheduleSearchParams,
} from "../work-schedule-management/types";

const emptyFilters: WorkScheduleSearchParams = {
    keyword: "",
    role: "",
    workDate: "",
    shift: "",
    status: "",
};

const emptyForm: WorkScheduleFormValues = {
    staffId: "",
    role: "",
    workDate: "",
    shift: "",
    status: "",
    note: "",
};

const shiftOrder: WorkSchedule["shift"][] = ["Ca sáng", "Ca chiều", "Ca tối"];

const weekdayLabels = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

const roleOptions = ["Lễ tân", "Bác sĩ thú y", "Nhân viên trung tâm"];

const shiftOptions = ["Ca sáng", "Ca chiều", "Ca tối"];

const statusOptions = ["Đã phân công", "Đã hủy"];

const buildFormValues = (schedule: WorkSchedule): WorkScheduleFormValues => ({
    staffId: schedule.staffId,
    role: schedule.role,
    workDate: schedule.workDate,
    shift: schedule.shift,
    status: schedule.status,
    note: schedule.note,
});

const normalizeDateValue = (value?: string) => {
    if (!value) return "";

    const trimmedValue = value.trim();

    if (!trimmedValue) return "";

    if (trimmedValue.includes("/")) {
        const parts = trimmedValue.split("/");

        if (parts.length !== 3) {
            return trimmedValue;
        }

        const [day, month, year] = parts;

        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    return trimmedValue;
};

const formatISODate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const formatShortDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");

    return `${day}/${month}`;
};

const formatFullDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

const getStartOfWeek = (date: Date) => {
    const clone = new Date(date);

    clone.setHours(0, 0, 0, 0);

    const day = clone.getDay();

    clone.setDate(clone.getDate() - day);

    return clone;
};

const addDays = (date: Date, days: number) => {
    const clone = new Date(date);

    clone.setDate(clone.getDate() + days);

    return clone;
};

const formatWeekRange = (startDate: Date) => {
    const endDate = addDays(startDate, 6);

    return `${formatFullDate(startDate)} - ${formatFullDate(endDate)}`;
};

const formatDayHeading = (date: Date) => {
    const weekday = weekdayLabels[date.getDay()];

    return `${weekday}, ${formatShortDate(date)}`;
};

const inputClassName =
    "h-11 w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50";

const selectClassName =
    "h-11 w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50";

export function SchedulePage() {
    const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
    const [filters, setFilters] = useState<WorkScheduleSearchParams>(emptyFilters);
    const [loading, setLoading] = useState(true);
    const [searchError, setSearchError] = useState("");
    const [feedback, setFeedback] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [formValue, setFormValue] = useState<WorkScheduleFormValues>(emptyForm);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(null);
    const [cancelTarget, setCancelTarget] = useState<WorkSchedule | null>(null);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [cancelError, setCancelError] = useState("");

    const [weekAnchor, setWeekAnchor] = useState(() => getStartOfWeek(new Date("2026-04-12T00:00:00")));

    const loadSchedules = async () => {
        setLoading(true);

        const data = await getWorkSchedules();

        setSchedules(data);
        setLoading(false);
    };

    useEffect(() => {
        void loadSchedules();
    }, []);

    const total = schedules.length;
    const assigned = schedules.filter((schedule) => schedule.status === "Đã phân công").length;
    const cancelled = schedules.filter((schedule) => schedule.status === "Đã hủy").length;
    const staffCount = new Set(schedules.map((schedule) => schedule.staffId)).size;

    const filteredSchedules = useMemo(() => schedules, [schedules]);

    const visibleWeekDates = useMemo(() => {
        return Array.from({ length: 7 }, (_, index) => addDays(weekAnchor, index));
    }, [weekAnchor]);

    const groupedByDate = useMemo(() => {
        return visibleWeekDates.map((date) => {
            const dateKey = formatISODate(date);
            const items = filteredSchedules.filter((schedule) => normalizeDateValue(schedule.workDate) === dateKey);

            return {
                date,
                shifts: shiftOrder.map((shift) => ({
                    shift,
                    items: items.filter((item) => item.shift === shift),
                })),
            };
        });
    }, [filteredSchedules, visibleWeekDates]);

    const updateFilter = (name: keyof WorkScheduleSearchParams, value: string) => {
        setFilters((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const runSearch = async () => {
        const hasCriteria =
            filters.keyword.trim() ||
            filters.role ||
            filters.workDate.trim() ||
            filters.shift ||
            filters.status;

        if (!hasCriteria) {
            setSearchError("Cần nhập ít nhất một tiêu chí tìm kiếm");
            return;
        }

        setSearchError("");
        setFeedback("");
        setLoading(true);

        const result = await searchWorkSchedules(filters);

        setSchedules(result);
        setLoading(false);

        if (filters.workDate.trim()) {
            const normalizedDate = normalizeDateValue(filters.workDate);
            const parsedDate = new Date(`${normalizedDate}T00:00:00`);

            if (!Number.isNaN(parsedDate.getTime())) {
                setWeekAnchor(getStartOfWeek(parsedDate));
            }
        }

        if (result.length === 0) {
            setFeedback("Không tìm thấy lịch làm việc nào thoả mãn tiêu chí tìm kiếm");
        }
    };

    const resetFilters = async () => {
        setFilters(emptyFilters);
        setSearchError("");
        setFeedback("");
        setWeekAnchor(getStartOfWeek(new Date("2026-04-12T00:00:00")));

        await loadSchedules();
    };

    const openCreate = () => {
        setFormMode("create");
        setFormValue(emptyForm);
        setEditingSchedule(null);
        setFormError("");
        setFormOpen(true);
    };

    const openCreateForSlot = (date: Date, shift: WorkSchedule["shift"]) => {
        setFormMode("create");
        setFormValue({
            ...emptyForm,
            workDate: formatFullDate(date),
            shift,
            status: "Đã phân công",
        });
        setEditingSchedule(null);
        setFormError("");
        setFormOpen(true);
    };

    const openEdit = (schedule: WorkSchedule) => {
        setFormMode("edit");
        setEditingSchedule(schedule);
        setFormValue(buildFormValues(schedule));
        setFormError("");
        setFormOpen(true);
    };

    const submitForm = async () => {
        setFormLoading(true);
        setFormError("");

        try {
            const saved =
                formMode === "create"
                    ? await createWorkSchedule(formValue)
                    : await updateWorkSchedule(editingSchedule?.id ?? "", formValue);

            const next =
                formMode === "create"
                    ? [saved, ...schedules]
                    : schedules.map((item) => (item.id === saved.id ? saved : item));

            setSchedules(next);
            setFormOpen(false);
            setFeedback(formMode === "create" ? "Thêm lịch làm việc thành công" : "Cập nhật lịch làm việc thành công");

            const savedDate = new Date(`${normalizeDateValue(saved.workDate)}T00:00:00`);

            if (!Number.isNaN(savedDate.getTime())) {
                setWeekAnchor(getStartOfWeek(savedDate));
            }
        } catch (error) {
            setFormError(error instanceof Error ? error.message : "Đã xảy ra lỗi");
        } finally {
            setFormLoading(false);
        }
    };

    const openCancel = (schedule: WorkSchedule) => {
        setCancelTarget(schedule);
        setCancelError("");
    };

    const goToPreviousWeek = () => {
        setWeekAnchor((current) => addDays(current, -7));
    };

    const goToNextWeek = () => {
        setWeekAnchor((current) => addDays(current, 7));
    };

    const goToCurrentWeek = () => {
        setWeekAnchor(getStartOfWeek(new Date("2026-04-12T00:00:00")));
    };

    const confirmCancel = async () => {
        if (!cancelTarget) return;

        setCancelLoading(true);
        setCancelError("");

        try {
            const updated = await cancelWorkSchedule(cancelTarget.id);

            setSchedules((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            setCancelTarget(null);
            setFeedback("Hủy lịch làm việc thành công");
        } catch (error) {
            setCancelError(error instanceof Error ? error.message : "Không thể hủy lịch làm việc");
        } finally {
            setCancelLoading(false);
        }
    };

    return (
        <div className="w-full min-w-0 max-w-full space-y-6 overflow-x-hidden">
            <div className="min-w-0">
                <h1 className="text-2xl font-semibold text-slate-900">Quản lý lịch làm việc nhân sự</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Phân công, theo dõi và điều chỉnh ca làm việc của nhân sự trong trung tâm.
                </p>
            </div>

            <div className="grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Tổng lịch làm việc</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{total}</p>
                </div>

                <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Đang phân công</p>
                    <p className="mt-2 text-2xl font-semibold text-emerald-700">{assigned}</p>
                </div>

                <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Đã hủy</p>
                    <p className="mt-2 text-2xl font-semibold text-amber-700">{cancelled}</p>
                </div>

                <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Nhân sự có lịch</p>
                    <p className="mt-2 text-2xl font-semibold text-blue-700">{staffCount}</p>
                </div>
            </div>

            <Card title="Bộ lọc tìm kiếm" subtitle="Tìm theo mã lịch, tên nhân sự, vai trò, ngày làm việc, ca và trạng thái">
                <div className="grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                    <div className="min-w-0">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Mã lịch / nhân sự</label>
                        <input
                            value={filters.keyword}
                            onChange={(event) => updateFilter("keyword", event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    void runSearch();
                                }
                            }}
                            className={inputClassName}
                            placeholder="Nhập mã lịch hoặc tên nhân sự"
                        />
                    </div>

                    <div className="min-w-0">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Vai trò</label>
                        <select
                            value={filters.role}
                            onChange={(event) => updateFilter("role", event.target.value)}
                            className={selectClassName}
                        >
                            <option value="">Tất cả vai trò</option>
                            {roleOptions.map((role) => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="min-w-0">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Ngày làm việc</label>
                        <input
                            value={filters.workDate}
                            onChange={(event) => updateFilter("workDate", event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    void runSearch();
                                }
                            }}
                            className={inputClassName}
                            placeholder="DD/MM/YYYY"
                        />
                    </div>

                    <div className="min-w-0">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Ca làm việc</label>
                        <select
                            value={filters.shift}
                            onChange={(event) => updateFilter("shift", event.target.value)}
                            className={selectClassName}
                        >
                            <option value="">Tất cả ca</option>
                            {shiftOptions.map((shift) => (
                                <option key={shift} value={shift}>
                                    {shift}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="min-w-0">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Trạng thái</label>
                        <select
                            value={filters.status}
                            onChange={(event) => updateFilter("status", event.target.value)}
                            className={selectClassName}
                        >
                            <option value="">Tất cả trạng thái</option>
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {searchError && <p className="mt-3 text-sm font-medium text-rose-600">{searchError}</p>}

                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Button onClick={() => void runSearch()} disabled={loading}>
                        Tìm kiếm
                    </Button>

                    <Button variant="outline" onClick={() => void resetFilters()} disabled={loading}>
                        Xóa bộ lọc / Làm mới
                    </Button>
                </div>
            </Card>

            {feedback && <Card className="border-emerald-200 bg-emerald-50 text-emerald-800">{feedback}</Card>}

            <Card
                title="Lịch chăm sóc thú cưng theo tuần"
                subtitle="Theo dõi nhân sự trực theo từng ngày, từng ca và thêm lịch nhanh cho các ca còn trống."
            >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" className="px-3 py-2 text-xs" onClick={goToPreviousWeek}>
                            Tuần trước
                        </Button>

                        <Button variant="ghost" className="px-3 py-2 text-xs" onClick={goToCurrentWeek}>
                            Tuần hiện tại
                        </Button>

                        <Button variant="outline" className="px-3 py-2 text-xs" onClick={goToNextWeek}>
                            Tuần sau
                        </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="text-sm font-medium text-slate-700">{formatWeekRange(weekAnchor)}</div>

                        <Button className="px-4 py-2 text-xs" onClick={openCreate}>
                            Thêm lịch làm việc
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="py-10 text-center text-sm text-slate-500">Đang tải dữ liệu lịch làm việc...</div>
                ) : (
                    <div className="w-full min-w-0 max-w-full overflow-hidden">
                        <div className="grid w-full min-w-0 grid-cols-7 gap-3">
                            {groupedByDate.map((day) => (
                                <div
                                    key={formatISODate(day.date)}
                                    className="min-w-0 rounded-3xl border border-slate-200 bg-slate-50/70 p-2"
                                >
                                    <div className="mb-3 flex min-w-0 items-center justify-between gap-2">
                                        <p className="min-w-0 truncate text-sm font-semibold text-slate-900">
                                            {formatDayHeading(day.date)}
                                        </p>

                                        <div className="shrink-0 rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-600 shadow-sm">
                                            {day.shifts.reduce((acc, item) => acc + item.items.length, 0)} lịch
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {day.shifts.map((shiftBlock) => (
                                            <div
                                                key={`${formatISODate(day.date)}-${shiftBlock.shift}`}
                                                className="min-w-0 rounded-2xl bg-white p-2 shadow-sm"
                                            >
                                                <div className="flex min-w-0 items-center justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-xs font-semibold text-slate-900">
                                                            {shiftBlock.shift}
                                                        </p>
                                                        <p className="text-[11px] text-slate-500">
                                                            {shiftBlock.items.length} lịch
                                                        </p>
                                                    </div>

                                                    {shiftBlock.items.length > 0 ? (
                                                        <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700">
                                                            Có lịch
                                                        </span>
                                                    ) : (
                                                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">
                                                            Trống
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="mt-2 space-y-2">
                                                    {shiftBlock.items.length === 0 ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => openCreateForSlot(day.date, shiftBlock.shift)}
                                                            className="w-full rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 px-2 py-4 text-center text-xs font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                                                        >
                                                            + Thêm lịch
                                                        </button>
                                                    ) : (
                                                        <>
                                                            {shiftBlock.items.map((schedule) => (
                                                                <div
                                                                    key={schedule.id}
                                                                    className={`min-w-0 rounded-2xl border p-2 shadow-sm ${
                                                                        schedule.status === "Đã hủy"
                                                                            ? "border-amber-200 bg-amber-50/60"
                                                                            : "border-emerald-200 bg-emerald-50/70"
                                                                    }`}
                                                                >
                                                                    <div className="space-y-1">
                                                                        <p className="break-words text-xs font-semibold leading-snug text-slate-900">
                                                                            {schedule.staffName}
                                                                        </p>

                                                                        <div className="flex flex-wrap items-center gap-1">
                                                                            <p className="text-[11px] text-slate-500">
                                                                                {schedule.scheduleCode}
                                                                            </p>

                                                                            {schedule.status === "Đã hủy" && (
                                                                                <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-medium text-amber-700">
                                                                                    Đã hủy
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="mt-2 flex min-w-0 flex-wrap gap-1 text-[11px]">
                                                                        <span className="max-w-full break-words rounded-full bg-white px-2 py-1 text-slate-700">
                                                                            {schedule.role}
                                                                        </span>
                                                                    </div>

                                                                    {schedule.note && (
                                                                        <p className="mt-2 line-clamp-2 text-[11px] text-slate-600">
                                                                            {schedule.note}
                                                                        </p>
                                                                    )}

                                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => openEdit(schedule)}
                                                                            className="rounded-xl border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50"
                                                                        >
                                                                            Sửa
                                                                        </button>

                                                                        {schedule.status !== "Đã hủy" && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => openCancel(schedule)}
                                                                                className="rounded-xl border border-rose-200 px-2 py-1 text-[11px] font-semibold text-rose-700 transition hover:bg-rose-50"
                                                                            >
                                                                                Hủy
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}

                                                            <button
                                                                type="button"
                                                                onClick={() => openCreateForSlot(day.date, shiftBlock.shift)}
                                                                className="w-full rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 px-2 py-3 text-center text-xs font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                                                            >
                                                                + Thêm lịch
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Card>

            <WorkScheduleFormDialog
                open={formOpen}
                mode={formMode}
                value={formValue}
                loading={formLoading}
                error={formError}
                onChange={setFormValue}
                onClose={() => setFormOpen(false)}
                onSubmit={() => void submitForm()}
                currentSchedule={editingSchedule}
            />

            <WorkScheduleCancelDialog
                open={Boolean(cancelTarget)}
                schedule={cancelTarget}
                loading={cancelLoading}
                error={cancelError}
                onClose={() => setCancelTarget(null)}
                onConfirm={() => void confirmCancel()}
            />
        </div>
    );
}