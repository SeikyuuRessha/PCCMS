import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { BellRing, CheckCircle2, Clock3, Plus, Sparkles, X } from "lucide-react";
import { Button, Input, Select, Tag, Textarea } from "~/components/atoms";
import { Card, MiniGridStats, SectionTitle } from "~/components/molecules";
import {
    groomingServiceOptions as serviceOptions,
    groomingStatusOptions as statusOptions,
    groomingTimeSlotOptions as timeSlotOptions,
    type GroomingStatus,
    type GroomingTicket,
    useReceptionMockData,
} from "../mockReceptionData";

const tones: Record<GroomingStatus, "amber" | "blue" | "green"> = {
    "Chờ làm": "amber",
    "Đang dùng dịch vụ": "blue",
    "Hoàn thành": "green",
};

const nextStatuses: Record<GroomingStatus, GroomingStatus[]> = {
    "Chờ làm": ["Đang dùng dịch vụ"],
    "Đang dùng dịch vụ": ["Hoàn thành"],
    "Hoàn thành": [],
};

const emptyTicketForm = {
    petName: "",
    ownerName: "",
    service: serviceOptions[0],
    time: timeSlotOptions[0],
    note: "",
};

export function GroomingBoardPage() {
    const { groomingTickets: tickets, setGroomingTickets: setTickets } = useReceptionMockData();
    const [selectedTicket, setSelectedTicket] = useState<GroomingTicket | null>(null);
    const [targetStatus, setTargetStatus] = useState<GroomingStatus>("Đang dùng dịch vụ");
    const [updateNote, setUpdateNote] = useState("");
    const [modalError, setModalError] = useState("");
    const [notice, setNotice] = useState("");
    const [simulatePopupFail, setSimulatePopupFail] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createForm, setCreateForm] = useState(emptyTicketForm);
    const [createError, setCreateError] = useState("");

    const groupedTickets = useMemo(
        () => statusOptions.reduce<Record<GroomingStatus, GroomingTicket[]>>(
            (acc, status) => ({ ...acc, [status]: tickets.filter((ticket) => ticket.status === status) }),
            { "Chờ làm": [], "Đang dùng dịch vụ": [], "Hoàn thành": [] }
        ),
        [tickets]
    );

    const stats = useMemo(
        () => ({
            total: tickets.length,
            processing: tickets.filter((ticket) => ticket.status === "Đang dùng dịch vụ").length,
            completed: tickets.filter((ticket) => ticket.status === "Hoàn thành").length,
        }),
        [tickets]
    );

    const openStatusModal = (ticket: GroomingTicket, status?: GroomingStatus) => {
        if (ticket.status === "Hoàn thành") {
            setNotice(`${ticket.petName} đã hoàn thành dịch vụ, không cần cập nhật thêm.`);
            return;
        }

        setSelectedTicket(ticket);
        setTargetStatus(status ?? nextStatuses[ticket.status][0]);
        setUpdateNote(ticket.note ?? "");
        setModalError("");
        setSimulatePopupFail(false);
    };

    const closeModal = () => {
        setSelectedTicket(null);
        setModalError("");
        setUpdateNote("");
        setSimulatePopupFail(false);
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        setCreateForm(emptyTicketForm);
        setCreateError("");
    };

    const addGroomingTicket = () => {
        const petName = createForm.petName.trim();
        const ownerName = createForm.ownerName.trim();

        if (!petName || !ownerName) {
            setCreateError("Vui lòng nhập tên thú cưng và tên chủ nuôi.");
            return;
        }

        const nextNumber = tickets.length + 102;
        const newTicket: GroomingTicket = {
            id: `SPA${String(nextNumber).padStart(3, "0")}`,
            petName,
            ownerName,
            service: createForm.service,
            time: createForm.time,
            status: "Chờ làm",
            note: createForm.note.trim(),
            updatedAt: "Hiện tại",
        };

        setTickets((prev) => [newTicket, ...prev]);
        setNotice(`${newTicket.petName} đã được thêm vào cột Chờ làm của bảng dịch vụ spa.`);
        closeCreateModal();
    };

    const confirmStatusUpdate = () => {
        if (!selectedTicket) return;

        if (selectedTicket.status === "Chờ làm" && targetStatus === "Hoàn thành") {
            setModalError("Không được chuyển thẳng từ Chờ làm sang Hoàn thành. Cần chuyển qua Đang dùng dịch vụ trước.");
            return;
        }

        if (!nextStatuses[selectedTicket.status].includes(targetStatus)) {
            setModalError(`Trạng thái tiếp theo không hợp lệ với phiếu ${selectedTicket.id}.`);
            return;
        }

        const popupFails = targetStatus === "Hoàn thành" && simulatePopupFail;

        setTickets((prev) =>
            prev.map((ticket) =>
                ticket.id === selectedTicket.id
                    ? {
                          ...ticket,
                          status: targetStatus,
                          note: updateNote.trim(),
                          updatedAt: "Hiện tại",
                          popupSent: targetStatus === "Hoàn thành" ? !popupFails : ticket.popupSent,
                          warning: popupFails ? "Gửi popup cho lễ tân thất bại, cần gọi khách thủ công." : undefined,
                      }
                    : ticket
            )
        );

        if (targetStatus === "Hoàn thành") {
            setNotice(
                popupFails
                    ? `${selectedTicket.petName} đã hoàn thành dịch vụ nhưng popup lễ tân thất bại. Trạng thái vẫn được lưu.`
                    : `${selectedTicket.petName} đã hoàn thành dịch vụ. Popup đã gửi tới lễ tân để gọi khách đến đón.`
            );
        } else {
            setNotice(`${selectedTicket.petName} đã chuyển sang trạng thái Đang dùng dịch vụ.`);
        }

        closeModal();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <SectionTitle title="Bảng trạng thái dịch vụ làm đẹp" />
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <span className="inline-flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Thêm thú cưng
                    </span>
                </Button>
            </div>
            <MiniGridStats
                items={[
                    { label: "Phiếu dịch vụ hôm nay", value: String(stats.total), hint: "Danh sách thú cưng làm đẹp", icon: Sparkles },
                    { label: "Đang dùng dịch vụ", value: String(stats.processing), hint: "Đang được nhân viên xử lý", icon: Clock3 },
                    { label: "Hoàn thành", value: String(stats.completed), hint: "Đã hoặc cần gửi popup lễ tân", icon: CheckCircle2 },
                ]}
            />

            {notice && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
                    {notice}
                </div>
            )}

            <div className="grid gap-4 lg:grid-cols-3">
                {statusOptions.map((title) => {
                    const cards = groupedTickets[title];

                    return (
                        <Card
                            key={title}
                            title={title}
                            subtitle={title === "Hoàn thành" ? "Tự động tạo popup cho lễ tân khi hoàn tất" : undefined}
                            right={<Tag tone={tones[title]}>{cards.length} thẻ</Tag>}
                        >
                            <div className="space-y-3">
                                {cards.map((ticket) => (
                                    <motion.div
                                        key={ticket.id}
                                        whileHover={{ y: -2 }}
                                        className="cursor-grab rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-medium">{ticket.petName} • {ticket.service}</p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    Phiếu {ticket.id} • {ticket.ownerName}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Giờ hẹn {ticket.time} • cập nhật {ticket.updatedAt}
                                                </p>
                                                {ticket.warning && (
                                                    <p className="mt-2 text-xs font-medium text-rose-600">{ticket.warning}</p>
                                                )}
                                            </div>
                                            <Tag tone={tones[title]}>{title}</Tag>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {nextStatuses[ticket.status].map((status) => (
                                                <Button
                                                    key={status}
                                                    className="px-3 py-1.5 text-xs"
                                                    variant={status === "Hoàn thành" ? "primary" : "outline"}
                                                    onClick={() => openStatusModal(ticket, status)}
                                                >
                                                    Chuyển {status}
                                                </Button>
                                            ))}
                                            {ticket.status === "Hoàn thành" && (
                                                <Tag tone={ticket.popupSent ? "green" : "red"}>
                                                    {ticket.popupSent ? "Đã gửi popup" : "Cần gọi thủ công"}
                                                </Tag>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}

                                {cards.length === 0 && (
                                    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                                        Chưa có thẻ nào ở cột này.
                                    </div>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="w-full max-w-xl rounded-3xl border border-border-main bg-white p-5 shadow-lg">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-base font-semibold text-text-main">Thêm thú cưng làm đẹp</h3>
                                <p className="mt-1 text-sm text-text-muted">
                                    Nhập phiếu dịch vụ trong ngày. Sau khi thêm, thẻ sẽ xuất hiện ở cột Chờ làm.
                                </p>
                            </div>
                            <button
                                type="button"
                                aria-label="Đóng modal thêm thú cưng làm đẹp"
                                className="rounded-xl p-2 text-text-muted transition hover:bg-slate-100 hover:text-text-main"
                                onClick={closeCreateModal}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {createError && (
                            <div className="mb-4 rounded-2xl bg-rose-50 p-3 text-sm font-medium text-rose-700">
                                {createError}
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            <Input
                                label="Tên thú cưng"
                                placeholder="Nhập tên thú cưng"
                                value={createForm.petName}
                                onChange={(event) => setCreateForm((prev) => ({ ...prev, petName: event.target.value }))}
                            />
                            <Input
                                label="Tên chủ nuôi"
                                placeholder="Nhập tên chủ nuôi"
                                value={createForm.ownerName}
                                onChange={(event) => setCreateForm((prev) => ({ ...prev, ownerName: event.target.value }))}
                            />
                            <Select
                                label="Dịch vụ làm đẹp"
                                options={serviceOptions}
                                value={createForm.service}
                                onChange={(event) => setCreateForm((prev) => ({ ...prev, service: event.target.value }))}
                            />
                            <Select
                                label="Giờ sử dụng dịch vụ"
                                options={timeSlotOptions}
                                value={createForm.time}
                                onChange={(event) => setCreateForm((prev) => ({ ...prev, time: event.target.value }))}
                            />
                            <div className="md:col-span-2">
                                <Textarea
                                    label="Ghi chú thêm"
                                    placeholder="Ví dụ: bé sợ máy sấy, ưu tiên cắt móng trước..."
                                    value={createForm.note}
                                    onChange={(event) => setCreateForm((prev) => ({ ...prev, note: event.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="mt-5 flex justify-end gap-2">
                            <Button variant="ghost" onClick={closeCreateModal}>Đóng</Button>
                            <Button onClick={addGroomingTicket}>Thêm vào Chờ làm</Button>
                        </div>
                    </div>
                </div>
            )}

            {selectedTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="w-full max-w-xl rounded-3xl border border-border-main bg-white p-5 shadow-lg">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-base font-semibold text-text-main">Cập nhật trạng thái dịch vụ</h3>
                                <p className="mt-1 text-sm text-text-muted">
                                    {selectedTicket.petName} • {selectedTicket.service} • Phiếu {selectedTicket.id}
                                </p>
                            </div>
                            <button
                                type="button"
                                aria-label="Đóng modal cập nhật trạng thái dịch vụ"
                                className="rounded-xl p-2 text-text-muted transition hover:bg-slate-100 hover:text-text-main"
                                onClick={closeModal}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {modalError && (
                            <div className="mb-4 rounded-2xl bg-rose-50 p-3 text-sm font-medium text-rose-700">
                                {modalError}
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            <Select
                                label="Trạng thái hiện tại"
                                options={[selectedTicket.status]}
                                value={selectedTicket.status}
                                disabled
                            />
                            <Select
                                label="Trạng thái mới"
                                options={nextStatuses[selectedTicket.status]}
                                value={targetStatus}
                                onChange={(event) => setTargetStatus(event.target.value as GroomingStatus)}
                            />
                        </div>

                        <div className="mt-4">
                            <Textarea
                                label="Ghi chú cập nhật"
                                placeholder="Ví dụ: thú cưng hợp tác tốt, cần gọi khách đến đón..."
                                value={updateNote}
                                onChange={(event) => setUpdateNote(event.target.value)}
                            />
                        </div>

                        {targetStatus === "Hoàn thành" && (
                            <label className="mt-4 flex items-start gap-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                                <input
                                    type="checkbox"
                                    className="mt-1"
                                    checked={simulatePopupFail}
                                    onChange={(event) => setSimulatePopupFail(event.target.checked)}
                                />
                                <span>
                                    Mô phỏng gửi popup thất bại. Trạng thái vẫn được lưu, nhưng nhân viên cần báo lễ tân xử lý thủ công.
                                </span>
                            </label>
                        )}

                        {targetStatus === "Hoàn thành" && (
                            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">
                                <BellRing className="h-4 w-4" />
                                Hoàn thành dịch vụ sẽ tạo popup: “{selectedTicket.petName} đã hoàn thành dịch vụ, mời khách đến đón”.
                            </div>
                        )}

                        <div className="mt-5 flex justify-end gap-2">
                            <Button variant="ghost" onClick={closeModal}>Đóng</Button>
                            <Button onClick={confirmStatusUpdate}>Lưu trạng thái</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
