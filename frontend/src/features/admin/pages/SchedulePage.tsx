import { useEffect, useMemo, useState } from "react";
import { Button } from "~/components/atoms";
import { Card } from "~/components/molecules";
import { WorkScheduleSummaryCards } from "../work-schedule-management/components/WorkScheduleSummaryCards";
import { WorkScheduleFilters } from "../work-schedule-management/components/WorkScheduleFilters";
import { WorkScheduleTable } from "../work-schedule-management/components/WorkScheduleTable";
import { WorkScheduleFormDialog } from "../work-schedule-management/components/WorkScheduleFormDialog";
import { WorkScheduleCancelDialog } from "../work-schedule-management/components/WorkScheduleCancelDialog";
import { cancelWorkSchedule, createWorkSchedule, getWorkSchedules, searchWorkSchedules, updateWorkSchedule } from "../work-schedule-management/workScheduleService";
import type { WorkSchedule, WorkScheduleFormValues, WorkScheduleSearchParams } from "../work-schedule-management/types";

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

const buildFormValues = (schedule: WorkSchedule): WorkScheduleFormValues => ({
    staffId: schedule.staffId,
    role: schedule.role,
    workDate: schedule.workDate,
    shift: schedule.shift,
    status: schedule.status,
    note: schedule.note,
});

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

    const runSearch = async () => {
        const hasCriteria = filters.keyword.trim() || filters.role || filters.workDate.trim() || filters.shift || filters.status;
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
            const saved = formMode === "create" ? await createWorkSchedule(formValue) : await updateWorkSchedule(editingSchedule?.id ?? "", formValue);
            const next = formMode === "create" ? [saved, ...schedules] : schedules.map((item) => (item.id === saved.id ? saved : item));
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
                    <p className="mt-1 text-sm text-slate-500">Quản lý lịch phân công ca làm việc cho nhân viên, bác sĩ và lễ tân tại trung tâm.</p>
                </div>
                <Button onClick={openCreate}>Thêm lịch làm việc</Button>
            </div>

            <WorkScheduleSummaryCards total={total} assigned={assigned} cancelled={cancelled} staffCount={staffCount} />

            <WorkScheduleFilters value={filters} onChange={setFilters} onSearch={runSearch} onReset={resetFilters} loading={loading} error={searchError} />

            {feedback && <Card className="border-emerald-200 bg-emerald-50 text-emerald-800">{feedback}</Card>}

            <WorkScheduleTable items={filteredSchedules} loading={loading} onEdit={openEdit} onCancel={openCancel} />

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
