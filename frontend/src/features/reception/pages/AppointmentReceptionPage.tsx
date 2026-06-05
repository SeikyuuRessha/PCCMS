import { useMemo, useState } from "react";
import { CalendarCheck2, Clock3, Search, UserCheck, X } from "lucide-react";
import { Button, Input, Select, Tag } from "~/components/atoms";
import { Card, DataTable, MiniGridStats } from "~/components/molecules";
import {
    appointmentDoctorOptions as doctorOptions,
    appointmentServiceOptions as serviceOptions,
    appointmentStatusOptions as statusOptions,
    appointmentTimeSlotOptions as timeSlotOptions,
    type Appointment,
    type AppointmentStatus,
    useReceptionMockData,
} from "../mockReceptionData";

const normalizePhone = (value: string) => value.replace(/\D/g, "");
const normalizeText = (value: string) =>
    value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase();

export function AppointmentReceptionPage() {
    const { appointments, setAppointments } = useReceptionMockData();
    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState(statusOptions[0]);
    const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
    const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
    const [notice, setNotice] = useState("");
    const [formError, setFormError] = useState("");
    const [quickForm, setQuickForm] = useState({
        phone: "",
        customerName: "",
        petName: "",
        service: serviceOptions[0],
        doctor: doctorOptions[0],
        symptom: "",
        time: timeSlotOptions[0],
    });

    const stats = useMemo(() => {
        const total = appointments.length;
        const received = appointments.filter((item) => item.status === "Đang chờ khám").length;
        const waiting = appointments.filter((item) => item.status === "Chờ tiếp nhận").length;

        return { total, received, waiting };
    }, [appointments]);

    const filteredAppointments = useMemo(() => {
        const normalized = normalizeText(keyword.trim());
        const phoneKeyword = normalizePhone(keyword);

        return appointments.filter((item) => {
            const textKeyword = normalized;
            const hasPhoneKeyword = phoneKeyword.length > 0;
            const matchKeyword =
                !textKeyword ||
                normalizeText(item.customerName).includes(textKeyword) ||
                normalizeText(item.petName).includes(textKeyword) ||
                normalizeText(item.service).includes(textKeyword) ||
                normalizeText(item.doctor).includes(textKeyword) ||
                (hasPhoneKeyword && normalizePhone(item.phone).includes(phoneKeyword));
            const matchStatus = statusFilter === "Tất cả trạng thái" || item.status === statusFilter;

            return matchKeyword && matchStatus;
        });
    }, [appointments, keyword, statusFilter]);

    const renderStatusTag = (status: AppointmentStatus) => {
        if (status === "Chờ tiếp nhận") {
            return <Tag tone="amber">Chờ tiếp nhận</Tag>;
        }

        if (status === "Đang chờ khám") {
            return <Tag tone="blue">Đang chờ khám</Tag>;
        }

        return <Tag tone="red">Đã hủy</Tag>;
    };

    const receiveAppointment = (id: string) => {
        const target = appointments.find((item) => item.id === id);

        if (!target) {
            setNotice("Không tìm thấy lịch hẹn phù hợp.");
            return;
        }

        if (target.status === "Đã hủy") {
            setNotice(`Không thể tiếp nhận ${target.id} vì lịch đã bị hủy.`);
            return;
        }

        if (target.status === "Đang chờ khám") {
            setNotice(`${target.id} đã được tiếp nhận trước đó.`);
            return;
        }

        setAppointments((prev) =>
            prev.map((item) => (item.id === id ? { ...item, status: "Đang chờ khám" } : item))
        );
        setNotice(`${target.petName} đã được đưa vào danh sách chờ khám của ${target.doctor}.`);
    };

    const confirmCancel = () => {
        if (!cancelTarget) return;

        if (cancelTarget.status === "Đang chờ khám") {
            setNotice(`Không thể hủy ${cancelTarget.id} vì thú cưng đã vào hàng chờ khám.`);
            setCancelTarget(null);
            return;
        }

        setAppointments((prev) =>
            prev.map((item) => (item.id === cancelTarget.id ? { ...item, status: "Đã hủy" } : item))
        );
        setNotice(`Đã hủy lịch ${cancelTarget.id} và giải phóng khung giờ đã giữ.`);
        setCancelTarget(null);
    };

    const addQuickAppointment = () => {
        const customerName = quickForm.customerName.trim();
        const phone = quickForm.phone.trim();
        const petName = quickForm.petName.trim();
        const symptom = quickForm.symptom.trim();

        if (!phone) {
            setFormError("Cần nhập SĐT khi tạo nhanh lịch hẹn tại quầy.");
            return;
        }

        if (normalizePhone(phone).length < 9) {
            setFormError("SĐT chưa hợp lệ. Vui lòng kiểm tra lại.");
            return;
        }

        if (!customerName || !petName || !symptom) {
            setFormError("Vui lòng nhập tên khách, tên thú cưng và triệu chứng ban đầu.");
            return;
        }

        if (!quickForm.time) {
            setFormError("Vui lòng chọn giờ hẹn khi tạo nhanh lịch hẹn.");
            return;
        }

        const nextNumber = appointments.length + 1;
        const assignedDoctor = quickForm.doctor === "Hệ thống tự gán" ? doctorOptions[1] : quickForm.doctor;
        const newAppointment: Appointment = {
            id: `AP${String(nextNumber).padStart(4, "0")}`,
            time: quickForm.time,
            customerName,
            phone,
            petName,
            doctor: assignedDoctor,
            service: quickForm.service,
            symptom,
            status: "Đang chờ khám",
            note: "Tạo nhanh tại quầy và tiếp nhận ngay.",
        };

        setAppointments((prev) => [newAppointment, ...prev]);
        setQuickForm({
            phone: "",
            customerName: "",
            petName: "",
            service: serviceOptions[0],
            doctor: doctorOptions[0],
            symptom: "",
            time: timeSlotOptions[0],
        });
        setFormError("");
        setNotice(`${newAppointment.petName} đã được tạo nhanh và chuyển sang hàng chờ khám.`);
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
        <div key={`${item.id}-doctor`}>
            <p className="font-medium text-slate-700">{item.doctor}</p>
            <p className="mt-1 text-xs text-slate-500">{item.service}</p>
        </div>,
        renderStatusTag(item.status),
        <div key={`${item.id}-actions`} className="flex flex-wrap gap-2">
            <Button
                variant={item.status === "Chờ tiếp nhận" ? "primary" : "ghost"}
                className="px-3 py-1.5 text-xs"
                onClick={() => receiveAppointment(item.id)}
                disabled={item.status !== "Chờ tiếp nhận"}
            >
                Tiếp nhận
            </Button>
            <Button
                variant="outline"
                className="px-3 py-1.5 text-xs"
                onClick={() => setCancelTarget(item)}
                disabled={item.status !== "Chờ tiếp nhận"}
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
                        label: "Đang chờ khám",
                        value: String(stats.received),
                        hint: "Đã tiếp nhận và chuyển bác sĩ phụ trách",
                        icon: UserCheck,
                    },
                    {
                        label: "Chờ tiếp nhận",
                        value: String(stats.waiting),
                        hint: "Cần nhân viên xác nhận tại quầy",
                        icon: Clock3,
                    },
                ]}
            />

            {notice && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
                    {notice}
                </div>
            )}

            <Card
                title="Tiếp nhận và điều phối lịch hẹn"
                subtitle="Tìm kiếm lịch hẹn theo SĐT/tên khách, tiếp nhận khách đến quầy, tạo nhanh khách walk-in hoặc hủy lịch còn hiệu lực."
            >
                <div className="mb-4 grid gap-3 md:grid-cols-[1fr_190px_190px]">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-4 top-3 h-4 w-4 text-slate-400" />
                        <Input
                            aria-label="Tìm kiếm theo số điện thoại hoặc tên khách hàng"
                            placeholder="Tìm theo SĐT, tên khách hoặc thú cưng"
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
                        Tạo nhanh lịch hẹn
                    </Button>
                </div>

                <DataTable
                    columns={[
                        "Mã lịch",
                        "Giờ hẹn",
                        "Khách hàng",
                        "SĐT",
                        "Tên thú cưng",
                        "Bác sĩ / dịch vụ",
                        "Trạng thái",
                        "Hành động",
                    ]}
                    rows={rows}
                />

                {filteredAppointments.length === 0 && (
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-text-muted">
                        Không tìm thấy lịch hẹn phù hợp. Có thể tạo nhanh lịch hẹn mới cho khách tại quầy.
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
                                    Tạo nhanh lịch hẹn cho khách chưa đặt trước và đưa thú cưng vào hàng chờ khám.
                                </p>
                            </div>
                            <button
                                type="button"
                                aria-label="Đóng modal tiếp nhận nhanh"
                                className="rounded-xl p-2 text-text-muted transition hover:bg-slate-100 hover:text-text-main"
                                onClick={() => {
                                    setIsQuickModalOpen(false);
                                    setFormError("");
                                }}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-4 rounded-2xl bg-rose-50 p-3 text-sm font-medium text-rose-700">
                                {formError}
                            </div>
                        )}

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
                            <Select
                                label="Dịch vụ khám"
                                options={serviceOptions}
                                value={quickForm.service}
                                onChange={(event) =>
                                    setQuickForm((prev) => ({ ...prev, service: event.target.value }))
                                }
                            />
                            <Select
                                label="Giờ hẹn"
                                options={timeSlotOptions}
                                value={quickForm.time}
                                onChange={(event) =>
                                    setQuickForm((prev) => ({ ...prev, time: event.target.value }))
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
                            <div className="md:col-span-2">
                                <Input
                                    label="Triệu chứng ban đầu"
                                    placeholder="Ví dụ: bỏ ăn, nôn, lờ đờ..."
                                    value={quickForm.symptom}
                                    onChange={(event) =>
                                        setQuickForm((prev) => ({ ...prev, symptom: event.target.value }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="mt-5 flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setIsQuickModalOpen(false);
                                    setFormError("");
                                }}
                            >
                                Đóng
                            </Button>
                            <Button onClick={addQuickAppointment}>Tiếp nhận ngay</Button>
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
