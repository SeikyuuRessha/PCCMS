import { useMemo, useState } from "react";
import { CalendarCheck2, Clock3, Search, UserCheck, X } from "lucide-react";
import { Button, Input, Select, Tag } from "~/components/atoms";
import { Card, DataTable, MiniGridStats } from "~/components/molecules";

type AppointmentStatus = "Chưa đến" | "Đã tiếp nhận" | "Đang chờ khám" | "Đã hủy";

type Appointment = {
    id: string;
    time: string;
    customerName: string;
    phone: string;
    petName: string;
    doctor: string;
    service: string;
    status: AppointmentStatus;
};

const initialAppointments: Appointment[] = [
    {
        id: "LH0001",
        time: "09:00",
        customerName: "Nguyễn Minh Anh",
        phone: "0912 456 888",
        petName: "Milu",
        doctor: "BS. Trần Gia An",
        service: "Khám tổng quát",
        status: "Chưa đến",
    },
    {
        id: "LH0002",
        time: "09:30",
        customerName: "Lê Thanh Hà",
        phone: "0909 145 336",
        petName: "Mít",
        doctor: "BS. Phạm Thu Hương",
        service: "Tiêm phòng",
        status: "Đã tiếp nhận",
    },
    {
        id: "LH0003",
        time: "10:00",
        customerName: "Hoàng Ngọc Lan",
        phone: "0933 778 990",
        petName: "Bơ",
        doctor: "BS. Trần Gia An",
        service: "Cắt tỉa lông",
        status: "Đã hủy",
    },
    {
        id: "LH0004",
        time: "10:30",
        customerName: "Trần Quốc Huy",
        phone: "0988 332 101",
        petName: "Đốm",
        doctor: "BS. Nguyễn Minh Phúc",
        service: "Khám da liễu",
        status: "Chưa đến",
    },
];

const doctorOptions = ["BS. Trần Gia An", "BS. Phạm Thu Hương", "BS. Nguyễn Minh Phúc"];
const statusOptions = ["Tất cả trạng thái", "Chưa đến", "Đã tiếp nhận", "Đã hủy"];

export function AppointmentReceptionPage() {
    const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState(statusOptions[0]);
    const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
    const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
    const [quickForm, setQuickForm] = useState({
        phone: "",
        customerName: "",
        petName: "",
        service: "",
        doctor: doctorOptions[0],
    });

    const stats = useMemo(() => {
        const total = appointments.length;
        const received = appointments.filter(
            (item) => item.status === "Đã tiếp nhận" || item.status === "Đang chờ khám"
        ).length;
        const waiting = appointments.filter((item) => item.status === "Chưa đến").length;

        return { total, received, waiting };
    }, [appointments]);

    const filteredAppointments = useMemo(() => {
        const normalized = keyword.trim().toLowerCase();

        return appointments.filter((item) => {
            const matchKeyword =
                !normalized ||
                item.phone.toLowerCase().includes(normalized) ||
                item.customerName.toLowerCase().includes(normalized);
            const matchStatus =
                statusFilter === "Tất cả trạng thái" ||
                (statusFilter === "Đã tiếp nhận" &&
                    (item.status === "Đã tiếp nhận" || item.status === "Đang chờ khám")) ||
                item.status === statusFilter;

            return matchKeyword && matchStatus;
        });
    }, [appointments, keyword, statusFilter]);

    const renderStatusTag = (status: AppointmentStatus) => {
        if (status === "Chưa đến") {
            return <Tag tone="amber">Chưa đến</Tag>;
        }

        if (status === "Đã tiếp nhận") {
            return <Tag tone="green">Đã tiếp nhận</Tag>;
        }

        if (status === "Đang chờ khám") {
            return <Tag tone="blue">Đang chờ khám</Tag>;
        }

        return <Tag tone="red">Đã hủy</Tag>;
    };

    const receiveAppointment = (id: string) => {
        setAppointments((prev) =>
            prev.map((item) => (item.id === id ? { ...item, status: "Đang chờ khám" } : item))
        );
    };

    const confirmCancel = () => {
        if (!cancelTarget) return;

        setAppointments((prev) =>
            prev.map((item) => (item.id === cancelTarget.id ? { ...item, status: "Đã hủy" } : item))
        );
        setCancelTarget(null);
    };

    const addQuickAppointment = () => {
        const customerName = quickForm.customerName.trim();
        const phone = quickForm.phone.trim();
        const petName = quickForm.petName.trim();

        if (!customerName || !phone || !petName) return;

        const nextNumber = appointments.length + 1;
        const newAppointment: Appointment = {
            id: `LH${String(nextNumber).padStart(4, "0")}`,
            time: "Khách vãng lai",
            customerName,
            phone,
            petName,
            doctor: quickForm.doctor,
            service: quickForm.service.trim() || "Khám tổng quát",
            status: "Chưa đến",
        };

        setAppointments((prev) => [newAppointment, ...prev]);
        setQuickForm({
            phone: "",
            customerName: "",
            petName: "",
            service: "",
            doctor: doctorOptions[0],
        });
        setIsQuickModalOpen(false);
    };

    const rows = filteredAppointments.map((item) => [
        <span key={`${item.id}-id`} className="font-semibold text-text-main">
            {item.id}
        </span>,
        item.time,
        item.customerName,
        item.phone,
        item.petName,
        item.doctor,
        renderStatusTag(item.status),
        <div key={`${item.id}-actions`} className="flex flex-wrap gap-2">
            <Button
                variant={item.status === "Chưa đến" ? "primary" : "ghost"}
                className="px-3 py-1.5 text-xs"
                onClick={() => receiveAppointment(item.id)}
                disabled={item.status !== "Chưa đến"}
            >
                Tiếp nhận
            </Button>
            <Button
                variant="outline"
                className="px-3 py-1.5 text-xs"
                onClick={() => setCancelTarget(item)}
                disabled={item.status === "Đã hủy"}
            >
                Hủy
            </Button>
        </div>,
    ]);

    return (
        <div className="space-y-6">
            <MiniGridStats
                items={[
                    {
                        label: "Tổng lịch hẹn hôm nay",
                        value: String(stats.total),
                        hint: "Bao gồm lịch đặt trước và khách vãng lai",
                        icon: CalendarCheck2,
                    },
                    {
                        label: "Đã tiếp nhận",
                        value: String(stats.received),
                        hint: "Sẵn sàng chuyển vào hàng chờ khám",
                        icon: UserCheck,
                    },
                    {
                        label: "Đang chờ",
                        value: String(stats.waiting),
                        hint: "Cần lễ tân xác nhận tại quầy",
                        icon: Clock3,
                    },
                ]}
            />

            <Card
                title="Tiếp nhận và điều phối lịch hẹn"
                subtitle="Theo dõi lịch trong ngày, tiếp nhận khách đến quầy và mô phỏng hủy lịch bằng dữ liệu mẫu."
            >
                <div className="mb-4 grid gap-3 md:grid-cols-[1fr_190px_190px]">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-4 top-3 h-4 w-4 text-slate-400" />
                        <Input
                            aria-label="Tìm kiếm theo số điện thoại hoặc tên khách hàng"
                            placeholder="Tìm theo SĐT hoặc tên khách hàng"
                            className="pl-11"
                            value={keyword}
                            onChange={(event) => setKeyword(event.target.value)}
                        />
                    </div>
                    <Select
                        aria-label="Lọc trạng thái lịch hẹn"
                        options={statusOptions}
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                    />
                    <Button className="h-10" onClick={() => setIsQuickModalOpen(true)}>
                        Thêm mới lịch hẹn
                    </Button>
                </div>

                <DataTable
                    columns={[
                        "Mã lịch",
                        "Giờ hẹn",
                        "Khách hàng",
                        "SĐT",
                        "Tên thú cưng",
                        "Bác sĩ",
                        "Trạng thái",
                        "Hành động",
                    ]}
                    rows={rows}
                />

                {filteredAppointments.length === 0 && (
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-text-muted">
                        Không tìm thấy lịch hẹn phù hợp với điều kiện lọc hiện tại.
                    </div>
                )}
            </Card>

            {isQuickModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="w-full max-w-xl rounded-3xl border border-border-main bg-white p-5 shadow-lg">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-base font-semibold text-text-main">Tiếp nhận nhanh</h3>
                                <p className="mt-1 text-sm text-text-muted">
                                    Tạo lịch hẹn giả cho khách vãng lai ngay tại quầy lễ tân.
                                </p>
                            </div>
                            <button
                                type="button"
                                aria-label="Đóng modal tiếp nhận nhanh"
                                className="rounded-xl p-2 text-text-muted transition hover:bg-slate-100 hover:text-text-main"
                                onClick={() => setIsQuickModalOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Input
                                label="SĐT"
                                placeholder="0912 345 678"
                                value={quickForm.phone}
                                onChange={(event) =>
                                    setQuickForm((prev) => ({ ...prev, phone: event.target.value }))
                                }
                            />
                            <Input
                                label="Tên khách"
                                placeholder="Nhập tên khách hàng"
                                value={quickForm.customerName}
                                onChange={(event) =>
                                    setQuickForm((prev) => ({ ...prev, customerName: event.target.value }))
                                }
                            />
                            <Input
                                label="Tên thú cưng"
                                placeholder="Nhập tên thú cưng"
                                value={quickForm.petName}
                                onChange={(event) =>
                                    setQuickForm((prev) => ({ ...prev, petName: event.target.value }))
                                }
                            />
                            <Input
                                label="Dịch vụ"
                                placeholder="Khám tổng quát"
                                value={quickForm.service}
                                onChange={(event) =>
                                    setQuickForm((prev) => ({ ...prev, service: event.target.value }))
                                }
                            />
                            <div className="md:col-span-2">
                                <Select
                                    label="Chọn bác sĩ"
                                    options={doctorOptions}
                                    value={quickForm.doctor}
                                    onChange={(event) =>
                                        setQuickForm((prev) => ({ ...prev, doctor: event.target.value }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="mt-5 flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setIsQuickModalOpen(false)}>
                                Đóng
                            </Button>
                            <Button onClick={addQuickAppointment}>Lưu lịch hẹn</Button>
                        </div>
                    </div>
                </div>
            )}

            {cancelTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="w-full max-w-md rounded-3xl border border-border-main bg-white p-5 shadow-lg">
                        <h3 className="text-base font-semibold text-text-main">Xác nhận hủy lịch hẹn</h3>
                        <p className="mt-2 text-sm text-text-muted">
                            Bạn có chắc chắn muốn hủy lịch <span className="font-semibold">{cancelTarget.id}</span> của
                            khách <span className="font-semibold">{cancelTarget.customerName}</span> không?
                        </p>
                        <div className="mt-5 flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setCancelTarget(null)}>
                                Không
                            </Button>
                            <Button variant="soft" onClick={confirmCancel}>
                                Xác nhận hủy
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
