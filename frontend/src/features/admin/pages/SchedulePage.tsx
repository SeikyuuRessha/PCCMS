import { useEffect, useMemo, useState } from "react";
import { Button } from "~/components/atoms";
import { Card } from "~/components/molecules";
import { WorkScheduleSummaryCards } from "../work-schedule-management/components/WorkScheduleSummaryCards";
import { WorkScheduleFilters } from "../work-schedule-management/components/WorkScheduleFilters";
import { WorkScheduleTable } from "../work-schedule-management/components/WorkScheduleTable";
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

const formatDate = (value?: string) => {
    if (!value) return "-";

    const normalizedValue = normalizeDateValue(value);
    const parsedDate = new Date(`${normalizedValue}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return value;
    }

    return formatFullDate(parsedDate);
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
        setLoading(true);

        const result = await searchWorkSchedules(filters);

        setSchedules(result);
        setLoading(false);

        if (result.length === 0) {
            setFeedback("Không tìm thấy lịch làm việc nào thoả mãn tiêu chí tìm kiếm");
        }
    };

    const resetFilters = async () => {
        setFilters(emptyFilters);
        setSearchError("");
        setFeedback("");

        await loadSchedules();
    };

    const openCreate = () => {
        setFormMode("create");
        setFormValue(emptyForm);
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
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Quản lý lịch làm việc nhân sự</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Phân công, theo dõi và điều chỉnh ca làm việc của nhân sự trong trung tâm.
                    </p>
                </div>

                <Button onClick={openCreate}>Thêm lịch làm việc</Button>
            </div>

            <WorkScheduleSummaryCards total={total} assigned={assigned} cancelled={cancelled} staffCount={staffCount} />

            <WorkScheduleFilters
                value={filters}
                onChange={setFilters}
                onSearch={runSearch}
                onReset={resetFilters}
                loading={loading}
                error={searchError}
            />

            {feedback && <Card className="border-emerald-200 bg-emerald-50 text-emerald-800">{feedback}</Card>}

            <Card title="Ma trận phân ca" subtitle="Nhìn nhanh ngày nào có ai trực, ca nào trống và lịch nào đã hủy.">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-2">
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

                    <div className="text-sm font-medium text-slate-700">{formatWeekRange(weekAnchor)}</div>
                </div>

                {loading ? (
                    <div className="py-10 text-center text-sm text-slate-500">Đang tải dữ liệu lịch làm việc...</div>
                ) : (
                    <div className="overflow-x-auto pb-2">
                        <div
                            className="grid min-w-[1100px] gap-4"
                            style={{ gridTemplateColumns: "repeat(7, minmax(260px, 1fr))" }}
                        >
                            {groupedByDate.map((day) => (
                                <div key={formatISODate(day.date)} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <p className="text-sm font-semibold text-slate-900">{formatDayHeading(day.date)}</p>

                                        <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                                            {day.shifts.reduce((acc, item) => acc + item.items.length, 0)} lịch
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {day.shifts.map((shiftBlock) => (
                                            <div key={`${formatISODate(day.date)}-${shiftBlock.shift}`} className="rounded-2xl bg-white p-3 shadow-sm">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">{shiftBlock.shift}</p>
                                                        <p className="text-xs text-slate-500">{shiftBlock.items.length} lịch trong ca</p>
                                                    </div>

                                                    {shiftBlock.items.length > 0 ? (
                                                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                                            Có lịch
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                                                            Trống
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="mt-3 space-y-2">
                                                    {shiftBlock.items.length === 0 ? (
                                                        <div className="rounded-2xl border border-dashed border-slate-200 px-3 py-5 text-center text-sm text-slate-400">
                                                            Chưa có lịch
                                                        </div>
                                                    ) : (
                                                        shiftBlock.items.map((schedule) => (
                                                            <div
                                                                key={schedule.id}
                                                                className={`rounded-2xl border p-3 shadow-sm ${
                                                                    schedule.status === "Đã hủy"
                                                                        ? "border-amber-200 bg-amber-50/60"
                                                                        : "border-emerald-200 bg-emerald-50/70"
                                                                }`}
                                                            >
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="min-w-0">
                                                                        <p className="truncate text-sm font-semibold text-slate-900">
                                                                            {schedule.staffName}
                                                                        </p>
                                                                        <p className="text-xs text-slate-500">{schedule.scheduleCode}</p>
                                                                    </div>

                                                                    <span
                                                                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                                            schedule.status === "Đã hủy"
                                                                                ? "bg-amber-100 text-amber-700"
                                                                                : "bg-emerald-100 text-emerald-700"
                                                                        }`}
                                                                    >
                                                                        {schedule.status}
                                                                    </span>
                                                                </div>

                                                                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                                                    <span className="rounded-full bg-white px-2.5 py-1 text-slate-700">
                                                                        {schedule.role}
                                                                    </span>
                                                                    <span className="rounded-full bg-white px-2.5 py-1 text-slate-700">
                                                                        {schedule.shift}
                                                                    </span>
                                                                </div>

                                                                {schedule.note && (
                                                                    <p className="mt-2 line-clamp-2 text-xs text-slate-600">
                                                                        {schedule.note}
                                                                    </p>
                                                                )}

                                                                <div className="mt-3 flex flex-wrap gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openEdit(schedule)}
                                                                        className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                                                    >
                                                                        Sửa
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openCancel(schedule)}
                                                                        className="rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                                                                    >
                                                                        Hủy
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))
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

            <Card title="Danh sách chi tiết lịch làm việc" subtitle="Xem và thao tác chi tiết các lịch làm việc đã phân công.">
                <WorkScheduleTable items={filteredSchedules} loading={loading} onEdit={openEdit} onCancel={openCancel} />
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