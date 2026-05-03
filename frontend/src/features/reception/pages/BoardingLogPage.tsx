import { useMemo, useState } from "react";
import { AlertTriangle, CalendarClock, ClipboardList, HeartPulse, Pencil, Search } from "lucide-react";
import { Button, Input, Select, Tag, Textarea } from "~/components/atoms";
import { Card, DataTable, MiniGridStats } from "~/components/molecules";

type EatingStatus = "Ăn tốt" | "Ăn ít" | "Bỏ ăn";
type HygieneStatus = "Bình thường" | "Bất thường";

type ActivityLog = {
    id: number;
    dateTime: string;
    staffName: string;
    eatingStatus: EatingStatus;
    hygieneStatus: HygieneStatus;
    temperature: string;
    weight: string;
    note: string;
};

const petSummary = {
    petName: "Bơ",
    room: "Chuồng B03",
    startDate: "01/05/2026",
    healthStatus: "Đang theo dõi ăn uống",
};

const initialLogs: ActivityLog[] = [
    {
        id: 1,
        dateTime: "03/05/2026 08:15",
        staffName: "Nguyễn Thu Hà",
        eatingStatus: "Ăn ít",
        hygieneStatus: "Bình thường",
        temperature: "38.7",
        weight: "5.2",
        note: "Ăn khoảng nửa khẩu phần, đã cho đi dạo 10 phút và uống nước bình thường.",
    },
    {
        id: 2,
        dateTime: "02/05/2026 17:40",
        staffName: "Trần Minh Quân",
        eatingStatus: "Ăn tốt",
        hygieneStatus: "Bình thường",
        temperature: "38.5",
        weight: "5.3",
        note: "Hoạt động nhanh nhẹn, chơi với bóng cao su, không có biểu hiện bất thường.",
    },
    {
        id: 3,
        dateTime: "02/05/2026 08:05",
        staffName: "Nguyễn Thu Hà",
        eatingStatus: "Ăn tốt",
        hygieneStatus: "Bình thường",
        temperature: "38.6",
        weight: "5.3",
        note: "Ăn hết khẩu phần sáng, vệ sinh sạch sẽ, đã thay lót chuồng.",
    },
];

const eatingOptions: EatingStatus[] = ["Ăn tốt", "Ăn ít", "Bỏ ăn"];
const hygieneOptions: HygieneStatus[] = ["Bình thường", "Bất thường"];

export function BoardingLogPage() {
    const [logs, setLogs] = useState<ActivityLog[]>(initialLogs);
    const [staffName, setStaffName] = useState("Nguyễn Thu Hà");
    const [eatingStatus, setEatingStatus] = useState<EatingStatus>("Ăn tốt");
    const [hygieneStatus, setHygieneStatus] = useState<HygieneStatus>("Bình thường");
    const [temperature, setTemperature] = useState("38.5");
    const [weight, setWeight] = useState("5.2");
    const [detail, setDetail] = useState("Đã cho đi dạo 15p, uống thuốc đúng giờ");
    const [keyword, setKeyword] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

    const hasWarningSign = eatingStatus === "Bỏ ăn" || hygieneStatus === "Bất thường";

    const filteredLogs = useMemo(() => {
        const normalized = keyword.trim().toLowerCase();

        if (!normalized) return logs;

        return logs.filter(
            (log) =>
                log.staffName.toLowerCase().includes(normalized) ||
                log.note.toLowerCase().includes(normalized) ||
                log.eatingStatus.toLowerCase().includes(normalized)
        );
    }, [keyword, logs]);

    const logStats = useMemo(() => {
        const warningCount = logs.filter(
            (log) => log.eatingStatus === "Bỏ ăn" || log.hygieneStatus === "Bất thường"
        ).length;

        return {
            total: logs.length,
            warningCount,
            latest: logs[0]?.dateTime ?? "Chưa có",
        };
    }, [logs]);

    const renderEatingTag = (status: EatingStatus) => {
        if (status === "Ăn tốt") return <Tag tone="green">Ăn tốt</Tag>;
        if (status === "Ăn ít") return <Tag tone="amber">Ăn ít</Tag>;
        return <Tag tone="red">Bỏ ăn</Tag>;
    };

    const saveLog = () => {
        if (!detail.trim()) return;

        const now = new Date();
        const newLog: ActivityLog = {
            id: Date.now(),
            dateTime: now.toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }),
            staffName: staffName.trim() || "Nhân viên chăm sóc",
            eatingStatus,
            hygieneStatus,
            temperature: temperature.trim() || "Chưa ghi nhận",
            weight: weight.trim() || "Chưa ghi nhận",
            note: detail.trim(),
        };

        setLogs((prev) => [newLog, ...prev]);
        setAlertMessage("Đã lưu nhật ký lưu trú thành công");
        setDetail("");
    };

    const reportDoctor = () => {
        setAlertMessage("Đã gửi báo cáo khẩn cấp cho bác sĩ phụ trách");
    };

    const rows = filteredLogs.map((log) => [
        <span key={`${log.id}-time`} className="font-semibold text-text-main">
            {log.dateTime}
        </span>,
        log.staffName,
        renderEatingTag(log.eatingStatus),
        <span key={`${log.id}-note`} className="text-slate-600">
            {log.note}
        </span>,
        <div key={`${log.id}-actions`} className="flex flex-wrap gap-2">
            <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setSelectedLog(log)}>
                Xem
            </Button>
            <Button
                variant="outline"
                className="px-3 py-1.5 text-xs"
                onClick={() => {
                    setStaffName(log.staffName);
                    setEatingStatus(log.eatingStatus);
                    setHygieneStatus(log.hygieneStatus);
                    setTemperature(log.temperature);
                    setWeight(log.weight);
                    setDetail(log.note);
                    setSelectedLog(log);
                }}
            >
                <span className="inline-flex items-center gap-1.5">
                    <Pencil className="h-3.5 w-3.5" />
                    Sửa
                </span>
            </Button>
        </div>,
    ]);

    return (
        <div className="space-y-6">
            {alertMessage && (
                <div className="rounded-3xl border border-sky-200 bg-sky-50 p-4 text-sm font-medium text-sky-700 shadow-sm">
                    {alertMessage}
                </div>
            )}

            <MiniGridStats
                items={[
                    {
                        label: "Tổng nhật ký",
                        value: String(logStats.total),
                        hint: "Số lần cập nhật trong hồ sơ lưu trú",
                        icon: ClipboardList,
                    },
                    {
                        label: "Dấu hiệu bất thường",
                        value: String(logStats.warningCount),
                        hint: "Bỏ ăn hoặc vệ sinh bất thường",
                        icon: AlertTriangle,
                    },
                    {
                        label: "Cập nhật gần nhất",
                        value: logStats.latest,
                        hint: "Thời điểm nhân viên ghi nhận gần nhất",
                        icon: CalendarClock,
                    },
                ]}
            />

            <Card
                title="Thông tin thú cưng lưu trú"
                subtitle="Thông tin mẫu để nhân viên chăm sóc theo dõi trong ca trực."
                right={<Tag tone="blue">Đang lưu trú</Tag>}
            >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Tên thú cưng</p>
                        <p className="mt-2 text-lg font-semibold text-text-main">{petSummary.petName}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Phòng/Chuồng</p>
                        <p className="mt-2 text-lg font-semibold text-text-main">{petSummary.room}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Ngày bắt đầu</p>
                        <p className="mt-2 text-lg font-semibold text-text-main">{petSummary.startDate}</p>
                    </div>
                    <div className="rounded-2xl bg-primary-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-primary-700">Tình trạng sức khỏe</p>
                        <p className="mt-2 text-lg font-semibold text-primary-700">{petSummary.healthStatus}</p>
                    </div>
                </div>
            </Card>

            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <Card
                    title="Cập nhật nhật ký hàng ngày"
                    subtitle="Nhập thông tin ăn uống, vệ sinh, sinh hiệu và hoạt động trong ca trực."
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input
                            label="Người trực"
                            value={staffName}
                            onChange={(event) => setStaffName(event.target.value)}
                        />
                        <Select
                            label="Trạng thái ăn uống"
                            options={eatingOptions}
                            value={eatingStatus}
                            onChange={(event) => setEatingStatus(event.target.value as EatingStatus)}
                        />
                        <Select
                            label="Trạng thái vệ sinh"
                            options={hygieneOptions}
                            value={hygieneStatus}
                            onChange={(event) => setHygieneStatus(event.target.value as HygieneStatus)}
                        />
                        <Input
                            label="Nhiệt độ (°C)"
                            value={temperature}
                            onChange={(event) => setTemperature(event.target.value)}
                        />
                        <Input
                            label="Cân nặng (kg)"
                            value={weight}
                            onChange={(event) => setWeight(event.target.value)}
                        />
                        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                            Trạng thái hiện tại:{" "}
                            <span className="font-semibold text-text-main">
                                {hasWarningSign ? "Cần báo bác sĩ" : "Ổn định"}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4">
                        <Textarea
                            label="Nội dung chi tiết"
                            rows={5}
                            placeholder="Ví dụ: Đã cho đi dạo 15p, uống thuốc đúng giờ"
                            value={detail}
                            onChange={(event) => setDetail(event.target.value)}
                        />
                    </div>

                    <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <Button onClick={saveLog}>Lưu nhật ký</Button>
                        <Button
                            variant={hasWarningSign ? "soft" : "outline"}
                            className={hasWarningSign ? "border border-amber-200 shadow-sm" : ""}
                            onClick={reportDoctor}
                        >
                            <span className="inline-flex items-center gap-2">
                                <HeartPulse className="h-4 w-4" />
                                Báo cáo bác sĩ
                            </span>
                        </Button>
                    </div>
                </Card>

                <Card
                    title="Lịch sử nhật ký"
                    subtitle="Danh sách cập nhật được lưu tạm bằng state trong phiên thao tác hiện tại."
                >
                    <div className="mb-4 relative">
                        <Search className="pointer-events-none absolute left-4 top-3 h-4 w-4 text-slate-400" />
                        <Input
                            aria-label="Tìm kiếm nhật ký"
                            placeholder="Tìm theo người trực, ghi chú hoặc trạng thái"
                            className="pl-11"
                            value={keyword}
                            onChange={(event) => setKeyword(event.target.value)}
                        />
                    </div>

                    <DataTable
                        columns={["Ngày/Giờ", "Người trực", "Trạng thái ăn uống", "Ghi chú", "Hành động"]}
                        rows={rows}
                    />

                    {filteredLogs.length === 0 && (
                        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-text-muted">
                            Không tìm thấy nhật ký phù hợp với từ khóa hiện tại.
                        </div>
                    )}
                </Card>
            </div>

            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="w-full max-w-lg rounded-3xl border border-border-main bg-white p-5 shadow-lg">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-base font-semibold text-text-main">Chi tiết nhật ký lưu trú</h3>
                                <p className="mt-1 text-sm text-text-muted">{selectedLog.dateTime}</p>
                            </div>
                            {renderEatingTag(selectedLog.eatingStatus)}
                        </div>
                        <div className="grid gap-3 text-sm md:grid-cols-2">
                            <div className="rounded-2xl bg-slate-50 p-3">
                                <p className="text-text-muted">Người trực</p>
                                <p className="mt-1 font-semibold text-text-main">{selectedLog.staffName}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-3">
                                <p className="text-text-muted">Vệ sinh</p>
                                <p className="mt-1 font-semibold text-text-main">{selectedLog.hygieneStatus}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-3">
                                <p className="text-text-muted">Nhiệt độ</p>
                                <p className="mt-1 font-semibold text-text-main">{selectedLog.temperature} °C</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-3">
                                <p className="text-text-muted">Cân nặng</p>
                                <p className="mt-1 font-semibold text-text-main">{selectedLog.weight} kg</p>
                            </div>
                        </div>
                        <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                            {selectedLog.note}
                        </div>
                        <div className="mt-5 flex justify-end">
                            <Button variant="ghost" onClick={() => setSelectedLog(null)}>
                                Đóng
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
