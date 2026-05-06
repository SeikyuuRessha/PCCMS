import { Button, Tag } from "~/components/atoms";
import { Card, EmptyState } from "~/components/molecules";
import { roleLabels, shiftLabels, statusLabels } from "../mockWorkSchedules";
import type { WorkSchedule, WorkScheduleStatus } from "../types";

interface WorkScheduleTableProps {
    items: WorkSchedule[];
    loading: boolean;
    onEdit: (schedule: WorkSchedule) => void;
    onCancel: (schedule: WorkSchedule) => void;
}

const statusTone: Record<WorkScheduleStatus, "green" | "amber"> = {
    "Đã phân công": "green",
    "Đã hủy": "amber",
};

export function WorkScheduleTable({ items, loading, onEdit, onCancel }: WorkScheduleTableProps) {
    return (
        <Card title="Danh sách lịch làm việc" subtitle="Quản lý phân công ca làm việc cho nhân sự trong trung tâm">
            {loading ? (
                <div className="py-10 text-center text-sm text-slate-500">Đang tải dữ liệu lịch làm việc...</div>
            ) : items.length === 0 ? (
                <EmptyState
                    title="Không tìm thấy lịch nào"
                    description="Không có lịch nào thỏa mãn điều kiện tìm kiếm hiện tại."
                    className="py-12"
                />
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">STT</th>
                                <th className="px-4 py-3 font-medium">Mã lịch làm việc</th>
                                <th className="px-4 py-3 font-medium">Nhân sự</th>
                                <th className="px-4 py-3 font-medium">Vai trò</th>
                                <th className="px-4 py-3 font-medium">Ngày làm việc</th>
                                <th className="px-4 py-3 font-medium">Ca làm việc</th>
                                <th className="px-4 py-3 font-medium">Trạng thái</th>
                                <th className="px-4 py-3 font-medium">Ghi chú</th>
                                <th className="px-4 py-3 font-medium">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {items.map((schedule, index) => (
                                <tr key={schedule.id}>
                                    <td className="px-4 py-3">{index + 1}</td>
                                    <td className="px-4 py-3 font-medium text-slate-900">{schedule.scheduleCode}</td>
                                    <td className="px-4 py-3">
                                        <div className="space-y-1">
                                            <p className="font-medium text-slate-900">{schedule.staffName}</p>
                                            <p className="text-xs text-slate-500">Mã NV: {schedule.staffId}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{roleLabels[schedule.role]}</td>
                                    <td className="px-4 py-3">{schedule.workDate}</td>
                                    <td className="px-4 py-3">{shiftLabels[schedule.shift]}</td>
                                    <td className="px-4 py-3">
                                        <Tag tone={statusTone[schedule.status]}>{statusLabels[schedule.status]}</Tag>
                                    </td>
                                    <td className="px-4 py-3">{schedule.note}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-2">
                                            <Button variant="outline" className="px-3 py-1.5 text-xs" onClick={() => onEdit(schedule)}>
                                                Sửa
                                            </Button>
                                            <Button variant="ghost" className="px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50" onClick={() => onCancel(schedule)}>
                                                Hủy
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
}
