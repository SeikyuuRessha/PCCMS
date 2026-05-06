import { useMemo, useState } from "react";
import { Button, Input, Tag, Textarea } from "~/components/atoms";
import { Card, EmptyState, SummaryRow } from "~/components/molecules";

type PersonalScheduleRole = "Lễ tân" | "Nhân viên trung tâm";
type PersonalScheduleShift = "Ca sáng" | "Ca chiều" | "Ca tối";
type PersonalScheduleStatus = "Đã phân công" | "Đã hủy";
type PersonalScheduleViewMode = "Ngày" | "Tuần" | "Tháng";

type ShiftChangeRequestStatus = "Đang chờ" | "Đã đồng ý" | "Từ chối";

interface PersonalSchedule {
    id: string;
    userId: string;
    userName: string;
    role: PersonalScheduleRole;
    workDate: string;
    shift: PersonalScheduleShift;
    startTime: string;
    endTime: string;
    status: PersonalScheduleStatus;
    note: string;
}

interface ShiftChangeRequest {
    requestId: string;
    scheduleId: string;
    senderName: string;
    receiverName: string;
    reason: string;
    status: ShiftChangeRequestStatus;
    createdAt: string;
    scheduleDisplay?: string;
}

const currentUserName = "Nguyễn Lan";
const today = "2026-04-12";
const receiverOptions = ["Trần Minh", "Phạm Hoàng Nam", "Nguyễn Lan"];

const personalSchedules: PersonalSchedule[] = [
    { id: "RS001", userId: "NV001", userName: "Nguyễn Lan", role: "Lễ tân", workDate: "2026-04-12", shift: "Ca sáng", startTime: "08:00", endTime: "12:00", status: "Đã phân công", note: "Trực quầy tiếp nhận" },
    { id: "RS002", userId: "NV001", userName: "Nguyễn Lan", role: "Lễ tân", workDate: "2026-04-13", shift: "Ca chiều", startTime: "13:00", endTime: "17:00", status: "Đã phân công", note: "Hỗ trợ đặt lịch" },
    { id: "RS003", userId: "NV001", userName: "Nguyễn Lan", role: "Lễ tân", workDate: "2026-04-14", shift: "Ca sáng", startTime: "08:00", endTime: "12:00", status: "Đã hủy", note: "Nghỉ có phép" },
    { id: "RS004", userId: "NV001", userName: "Nguyễn Lan", role: "Lễ tân", workDate: "2026-04-15", shift: "Ca tối", startTime: "18:00", endTime: "22:00", status: "Đã phân công", note: "Trực điện thoại" },
    { id: "RS005", userId: "NV001", userName: "Nguyễn Lan", role: "Lễ tân", workDate: "2026-04-16", shift: "Ca chiều", startTime: "13:00", endTime: "17:00", status: "Đã phân công", note: "Tiếp nhận lịch hẹn" },
    { id: "RS006", userId: "NV002", userName: "Trần Minh", role: "Nhân viên trung tâm", workDate: "2026-04-17", shift: "Ca sáng", startTime: "08:00", endTime: "12:00", status: "Đã phân công", note: "Hỗ trợ khu lưu trú" },
];

const baseShiftChangeRequests: ShiftChangeRequest[] = [
    { requestId: "SC001", scheduleId: "RS001", senderName: "Nguyễn Lan", receiverName: "Trần Minh", reason: "Bận việc gia đình", status: "Đang chờ", createdAt: "2026-04-10 09:00", scheduleDisplay: "2026-04-12 • Ca sáng • 08:00 - 12:00" },
    { requestId: "SC002", scheduleId: "RS002", senderName: "Trần Minh", receiverName: "Nguyễn Lan", reason: "Cần đổi ca do có việc cá nhân", status: "Đang chờ", createdAt: "2026-04-10 10:00", scheduleDisplay: "2026-04-13 • Ca chiều • 13:00 - 17:00" },
];

const defaultFilters = { viewMode: "Ngày" as PersonalScheduleViewMode, fromDate: "2026-04-12", toDate: "2026-04-17" };
const emptyFilters = { viewMode: "Ngày" as PersonalScheduleViewMode, fromDate: "", toDate: "" };

export function MySchedulePage() {
    const [filters, setFilters] = useState(defaultFilters);
    const [items, setItems] = useState(personalSchedules.filter((item) => item.userName === currentUserName));
    const [requests, setRequests] = useState(baseShiftChangeRequests);
    const [loading, setLoading] = useState(false);
    const [requestLoading, setRequestLoading] = useState(false);
    const [error, setError] = useState("");
    const [dialogError, setDialogError] = useState("");
    const [feedback, setFeedback] = useState("");
    const [selectedSchedule, setSelectedSchedule] = useState<PersonalSchedule | null>(null);

    const summary = useMemo(() => {
        const total = items.length;
        const cancelled = items.filter((item) => item.status === "Đã hủy").length;
        const todayCount = items.filter((item) => item.workDate === today).length;
        const upcoming = items.filter((item) => item.workDate > today && item.status === "Đã phân công").length;
        return { total, todayCount, upcoming, cancelled };
    }, [items]);

    const currentUserRequests = requests.filter((item) => item.senderName === currentUserName);
    const pendingRequestsForMe = requests.filter((item) => item.receiverName === currentUserName);

    const applyFilter = (source: PersonalSchedule[]) => {
        return source.filter((item) => item.userName === currentUserName && item.workDate >= filters.fromDate && item.workDate <= filters.toDate);
    };

    const handleSearch = () => {
        if (!filters.fromDate || !filters.toDate) {
            setError("Vui lòng chọn đầy đủ khoảng thời gian");
            return;
        }
        if (filters.toDate < filters.fromDate) {
            setError("Đến ngày phải lớn hơn hoặc bằng Từ ngày");
            return;
        }
        setError("");
        setLoading(true);
        const data = applyFilter(personalSchedules);
        setItems(data);
        setLoading(false);
    };

    const handleReset = () => {
        setFilters(emptyFilters);
        setError("");
        setItems(personalSchedules.filter((item) => item.userName === currentUserName));
    };

    const canRequestChange = (schedule: PersonalSchedule) => schedule.status === "Đã phân công" && schedule.workDate >= today;

    const openRequestDialog = (schedule: PersonalSchedule) => {
        if (!canRequestChange(schedule)) {
            setDialogError(schedule.status === "Đã hủy" ? "Ca làm việc đã hủy nên không thể yêu cầu đổi" : "Ca làm việc đã bắt đầu hoặc đã kết thúc nên không thể yêu cầu đổi");
            return;
        }
        setDialogError("");
        setSelectedSchedule(schedule);
    };

    const submitShiftChange = (payload: { reason: string; receiverName: string }) => {
        if (!selectedSchedule) return;
        if (!payload.reason.trim()) {
            setDialogError("Vui lòng nhập lý do đổi ca");
            return;
        }
        if (!canRequestChange(selectedSchedule)) {
            setDialogError(selectedSchedule.status === "Đã hủy" ? "Ca làm việc đã hủy nên không thể yêu cầu đổi" : "Ca làm việc đã bắt đầu hoặc đã kết thúc nên không thể yêu cầu đổi");
            return;
        }

        const request: ShiftChangeRequest = {
            requestId: `REQ-${String(requests.length + 1).padStart(3, "0")}`,
            scheduleId: selectedSchedule.id,
            senderName: currentUserName,
            receiverName: payload.receiverName,
            reason: payload.reason,
            status: "Đang chờ",
            createdAt: new Date().toISOString(),
            scheduleDisplay: `${selectedSchedule.workDate} • ${selectedSchedule.shift} • ${selectedSchedule.startTime} - ${selectedSchedule.endTime}`,
        };
        setRequests((prev) => [request, ...prev]);
        setSelectedSchedule(null);
        setDialogError("");
        setFeedback("Gửi yêu cầu đổi ca thành công");
    };

    const decideRequest = (requestId: string, status: "Đã đồng ý" | "Từ chối") => {
        setRequests((prev) => prev.map((item) => (item.requestId === requestId ? { ...item, status } : item)));
        setFeedback(status === "Đã đồng ý" ? "Bạn đã đồng ý nhận yêu cầu đổi ca" : "Bạn đã từ chối yêu cầu đổi ca");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold text-slate-900">Lịch làm việc cá nhân</h1>
                <p className="text-sm text-slate-500">Xem các ca làm việc đã được phân công cho tài khoản hiện tại.</p>
            </div>

            {feedback && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{feedback}</div>}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card><SummaryRow label="Tổng ca trong khoảng" value={String(summary.total)} /></Card>
                <Card><SummaryRow label="Ca hôm nay" value={String(summary.todayCount)} /></Card>
                <Card><SummaryRow label="Ca sắp tới" value={String(summary.upcoming)} /></Card>
                <Card><SummaryRow label="Ca đã hủy" value={String(summary.cancelled)} /></Card>
            </div>

            <Card title="Bộ lọc thời gian" subtitle="Chọn ngày, tuần hoặc tháng để xem lịch cá nhân">
                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-slate-700">Kiểu xem</label>
                        <select className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none" value={filters.viewMode} onChange={(e) => setFilters({ ...filters, viewMode: e.target.value as PersonalScheduleViewMode })}>
                            <option value="Ngày">Ngày</option>
                            <option value="Tuần">Tuần</option>
                            <option value="Tháng">Tháng</option>
                        </select>
                    </div>
                    <Input label="Từ ngày" type="date" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} />
                    <Input label="Đến ngày" type="date" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} />
                </div>
                {error && <p className="mt-3 text-sm font-medium text-error-600">{error}</p>}
                <div className="mt-5 flex flex-wrap gap-3">
                    <Button onClick={handleSearch} disabled={loading}>Xem lịch</Button>
                    <Button variant="outline" onClick={handleReset} disabled={loading}>Làm mới</Button>
                </div>
            </Card>

            {items.length === 0 ? (
                <EmptyState title="Không có lịch làm việc trong khoảng thời gian được chọn" description="Hãy đổi khoảng ngày để xem các ca làm việc khác của tài khoản hiện tại." />
            ) : (
                <Card title="Lịch làm việc cá nhân" subtitle="Danh sách các ca làm việc đã được phân công">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Ngày làm việc</th>
                                    <th className="px-4 py-3 font-medium">Ca làm việc</th>
                                    <th className="px-4 py-3 font-medium">Thời gian</th>
                                    <th className="px-4 py-3 font-medium">Vai trò</th>
                                    <th className="px-4 py-3 font-medium">Ghi chú</th>
                                    <th className="px-4 py-3 font-medium">Trạng thái</th>
                                    <th className="px-4 py-3 font-medium">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {items.map((item) => {
                                    const disabled = !canRequestChange(item);
                                    return (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3">{item.workDate}</td>
                                            <td className="px-4 py-3">{item.shift}</td>
                                            <td className="px-4 py-3">{item.startTime} - {item.endTime}</td>
                                            <td className="px-4 py-3">{item.role}</td>
                                            <td className="px-4 py-3">{item.note}</td>
                                            <td className="px-4 py-3"><Tag tone={item.status === "Đã phân công" ? "green" : "amber"}>{item.status}</Tag></td>
                                            <td className="px-4 py-3">
                                                <Button variant="outline" className="px-3 py-1.5 text-xs" onClick={() => openRequestDialog(item)} disabled={disabled} title={disabled ? "Ca này không thể yêu cầu đổi" : undefined}>
                                                    Yêu cầu đổi ca
                                                </Button>
                                                {disabled && <p className="mt-1 text-[11px] text-slate-400">Ca này không thể yêu cầu đổi</p>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            <div className="space-y-6">
                <Card title="Yêu cầu đổi ca đã gửi" subtitle="Theo dõi các yêu cầu đổi ca đã gửi từ tài khoản hiện tại.">
                    {currentUserRequests.length === 0 ? (
                        <EmptyState title="Chưa có yêu cầu đổi ca nào được gửi" description="Các yêu cầu đổi ca bạn gửi sẽ hiển thị tại đây." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Mã yêu cầu</th>
                                        <th className="px-4 py-3 font-medium">Mã lịch làm việc</th>
                                        <th className="px-4 py-3 font-medium">Ca cần đổi</th>
                                        <th className="px-4 py-3 font-medium">Người nhận đề xuất</th>
                                        <th className="px-4 py-3 font-medium">Lý do</th>
                                        <th className="px-4 py-3 font-medium">Trạng thái yêu cầu</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {currentUserRequests.map((item) => (
                                        <tr key={item.requestId}>
                                            <td className="px-4 py-3 font-medium">{item.requestId}</td>
                                            <td className="px-4 py-3">{item.scheduleId}</td>
                                            <td className="px-4 py-3">{item.scheduleDisplay || "-"}</td>
                                            <td className="px-4 py-3">{item.receiverName || "Chưa chọn"}</td>
                                            <td className="px-4 py-3">{item.reason}</td>
                                            <td className="px-4 py-3"><Tag tone={item.status === "Đang chờ" ? "amber" : item.status === "Đã đồng ý" ? "green" : "red"}>{item.status}</Tag></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                <Card title="Yêu cầu đổi ca cần phản hồi" subtitle="Các yêu cầu đổi ca được gửi tới bạn.">
                    {pendingRequestsForMe.length === 0 ? (
                        <EmptyState title="Không có yêu cầu đổi ca nào cần phản hồi" description="Bạn chưa có yêu cầu đổi ca nào cần xử lý." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Mã yêu cầu</th>
                                        <th className="px-4 py-3 font-medium">Mã lịch làm việc</th>
                                        <th className="px-4 py-3 font-medium">Ca cần đổi</th>
                                        <th className="px-4 py-3 font-medium">Người gửi yêu cầu</th>
                                        <th className="px-4 py-3 font-medium">Lý do</th>
                                        <th className="px-4 py-3 font-medium">Trạng thái yêu cầu</th>
                                        <th className="px-4 py-3 font-medium">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {pendingRequestsForMe.map((item) => {
                                        const isPending = item.status === "Đang chờ";
                                        return (
                                            <tr key={item.requestId}>
                                                <td className="px-4 py-3 font-medium">{item.requestId}</td>
                                                <td className="px-4 py-3">{item.scheduleId}</td>
                                                <td className="px-4 py-3">{item.scheduleDisplay || "-"}</td>
                                                <td className="px-4 py-3">{item.senderName}</td>
                                                <td className="px-4 py-3">{item.reason}</td>
                                                <td className="px-4 py-3"><Tag tone={item.status === "Đang chờ" ? "amber" : item.status === "Đã đồng ý" ? "green" : "red"}>{item.status}</Tag></td>
                                                <td className="px-4 py-3">
                                                    {isPending ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            <Button className="px-3 py-1.5 text-xs" onClick={() => decideRequest(item.requestId, "Đã đồng ý")}>Đồng ý</Button>
                                                            <Button variant="outline" className="px-3 py-1.5 text-xs" onClick={() => decideRequest(item.requestId, "Từ chối")}>Từ chối</Button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-500">Đã xử lý</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>

            <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 ${selectedSchedule ? "" : "pointer-events-none opacity-0"}`}>
                {selectedSchedule && (
                    <div className="w-full max-w-2xl">
                        <Card title="Yêu cầu đổi ca" subtitle="Nhập lý do và người nhận đổi ca (nếu có)">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-medium text-slate-500">Mã lịch làm việc</p><p className="mt-1 text-sm font-semibold text-slate-900">{selectedSchedule.id}</p></div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-medium text-slate-500">Ngày làm việc</p><p className="mt-1 text-sm font-semibold text-slate-900">{selectedSchedule.workDate}</p></div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-medium text-slate-500">Ca làm việc</p><p className="mt-1 text-sm font-semibold text-slate-900">{selectedSchedule.shift}</p></div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-medium text-slate-500">Thời gian ca</p><p className="mt-1 text-sm font-semibold text-slate-900">{selectedSchedule.startTime} - {selectedSchedule.endTime}</p></div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-medium text-slate-500">Vai trò</p><p className="mt-1 text-sm font-semibold text-slate-900">{selectedSchedule.role}</p></div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-medium text-slate-500">Ghi chú</p><p className="mt-1 text-sm font-semibold text-slate-900">{selectedSchedule.note || "-"}</p></div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-medium text-slate-500">Trạng thái ca</p><p className="mt-1 text-sm font-semibold text-slate-900">{selectedSchedule.status}</p></div>
                            </div>

                            <div className="mt-5 grid gap-4">
                                <Textarea label="Lý do đổi ca" value={""} onChange={() => undefined} placeholder="Nhập lý do đổi ca" rows={4} />
                                <Input label="Người nhận đổi ca (nếu có)" value={""} onChange={() => undefined} placeholder="Nhập tên người nhận đổi ca nếu có" />
                                <p className="text-xs text-slate-500">Nếu chưa có người nhận phù hợp, bạn có thể để trống để quản trị viên xử lý.</p>
                            </div>

                            {dialogError && <p className="mt-3 text-sm font-medium text-error-600">{dialogError}</p>}

                            <div className="mt-6 flex flex-wrap justify-end gap-3">
                                <Button variant="outline" onClick={() => setSelectedSchedule(null)} disabled={requestLoading}>Hủy</Button>
                                <Button onClick={() => submitShiftChange({ reason: "", receiverName: "" })} disabled={requestLoading}>{requestLoading ? "Đang gửi..." : "Gửi yêu cầu"}</Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
