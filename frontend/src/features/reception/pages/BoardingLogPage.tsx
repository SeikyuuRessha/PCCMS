import { useMemo, useState } from "react";
import { Camera, ClipboardCheck, Plus, UploadCloud, X } from "lucide-react";
import { Button, Input, Select, Tag, Textarea } from "~/components/atoms";
import { Card, DataTable, MiniGridStats } from "~/components/molecules";
import {
    boardingHygieneOptions as hygieneOptions,
    boardingMealOptions as mealOptions,
    boardingSessionOptions as sessionOptions,
    boardingStatusOptions as statusOptions,
    today,
    type BoardingLog,
    type BoardingPet,
    type HygieneStatus,
    type MealStatus,
    type Session,
    useReceptionMockData,
} from "../mockReceptionData";

const emptyForm = {
    session: "Trưa" as Session,
    mealStatus: "Ăn tốt" as MealStatus,
    hygieneStatus: "Bình thường" as HygieneStatus,
    note: "",
    fileNames: [] as string[],
};

const emptyPetForm = {
    cage: "",
    petName: "",
    ownerName: "",
    dayText: "Ngày 1/1",
    status: "Đang lưu trú" as BoardingPet["status"],
};

export function BoardingLogPage() {
    const {
        boardingPets,
        setBoardingPets,
        boardingLogs: logs,
        setBoardingLogs: setLogs,
    } = useReceptionMockData();
    const [selectedPetId, setSelectedPetId] = useState(boardingPets[0]?.id ?? "");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPetModalOpen, setIsPetModalOpen] = useState(false);
    const [editingLogId, setEditingLogId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [petForm, setPetForm] = useState(emptyPetForm);
    const [formError, setFormError] = useState("");
    const [petFormError, setPetFormError] = useState("");
    const [notice, setNotice] = useState("");

    const selectedPet = boardingPets.find((pet) => pet.id === selectedPetId) ?? boardingPets[0];
    const petLogs = selectedPet ? logs.filter((log) => log.petId === selectedPet.id) : [];
    const todayPetLogs = petLogs.filter((log) => log.date === today);
    const completedSessions = new Set(todayPetLogs.filter((log) => log.status === "Đã lưu").map((log) => log.session));
    const missingSessions = sessionOptions.filter((session) => !completedSessions.has(session));

    const stats = useMemo(
        () => ({
            staying: boardingPets.filter((pet) => pet.status === "Đang lưu trú" || pet.status === "Sắp đón").length,
            todayLogs: logs.filter((log) => log.date === today && log.status === "Đã lưu").length,
            missing: boardingPets.filter((pet) => {
                const sessions = new Set(
                    logs
                        .filter((log) => log.petId === pet.id && log.date === today && log.status === "Đã lưu")
                        .map((log) => log.session)
                );
                return sessions.size < 3;
            }).length,
        }),
        [boardingPets, logs]
    );

    const openCreateModal = () => {
        const nextMissing = missingSessions[0] ?? "Sáng";
        setEditingLogId(null);
        setForm({ ...emptyForm, session: nextMissing });
        setFormError("");
        setIsModalOpen(true);
    };

    const openEditModal = (log: BoardingLog) => {
        if (!log.editable) {
            setNotice("Chỉ được sửa hoặc xóa nhật ký của ngày hôm nay.");
            return;
        }

        setEditingLogId(log.id);
        setForm({
            session: log.session,
            mealStatus: log.mealStatus,
            hygieneStatus: log.hygieneStatus,
            note: log.note,
            fileNames: log.files,
        });
        setFormError("");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingLogId(null);
        setFormError("");
    };

    const closePetModal = () => {
        setIsPetModalOpen(false);
        setPetForm(emptyPetForm);
        setPetFormError("");
    };

    const savePet = () => {
        const cage = petForm.cage.trim();
        const petName = petForm.petName.trim();
        const ownerName = petForm.ownerName.trim();
        const dayText = petForm.dayText.trim() || "Ngày 1/1";

        if (!cage || !petName || !ownerName) {
            setPetFormError("Vui lòng nhập chuồng, tên thú cưng và tên chủ nuôi.");
            return;
        }

        const newPet: BoardingPet = {
            id: `BP${String(boardingPets.length + 1).padStart(3, "0")}`,
            cage,
            petName,
            ownerName,
            dayText,
            status: petForm.status,
        };

        setBoardingPets((prev) => [newPet, ...prev]);
        setSelectedPetId(newPet.id);
        setNotice(`${newPet.petName} đã được thêm vào danh sách thú cưng đang lưu trú.`);
        closePetModal();
    };

    const saveLog = (asDraft = false) => {
        if (!selectedPet) return;

        if (!form.mealStatus || !form.hygieneStatus) {
            setFormError("Vui lòng chọn tình trạng ăn uống và tình trạng vệ sinh.");
            return;
        }

        if (!asDraft && form.fileNames.length === 0) {
            setFormError("Cần tải ít nhất một ảnh hoặc video trong ngày trước khi lưu nhật ký.");
            return;
        }

        const duplicate = logs.some(
            (log) =>
                log.petId === selectedPet.id &&
                log.date === today &&
                log.session === form.session &&
                log.id !== editingLogId &&
                log.status === "Đã lưu"
        );

        if (!asDraft && duplicate) {
            setFormError(`Buổi ${form.session.toLowerCase()} của ${selectedPet.petName} đã có nhật ký hôm nay.`);
            return;
        }

        if (editingLogId) {
            setLogs((prev) =>
                prev.map((log) =>
                    log.id === editingLogId
                        ? {
                              ...log,
                              session: form.session,
                              mealStatus: form.mealStatus,
                              hygieneStatus: form.hygieneStatus,
                              files: form.fileNames,
                              note: form.note,
                              status: asDraft ? "Nháp" : "Đã lưu",
                          }
                        : log
                )
            );
            setNotice(asDraft ? "Đã lưu nháp nhật ký lưu trú." : "Đã cập nhật nhật ký lưu trú hôm nay.");
        } else {
            const newLog: BoardingLog = {
                id: `LT${String(logs.length + 1).padStart(4, "0")}`,
                petId: selectedPet.id,
                date: today,
                session: form.session,
                mealStatus: form.mealStatus,
                hygieneStatus: form.hygieneStatus,
                files: form.fileNames,
                note: form.note,
                status: asDraft ? "Nháp" : "Đã lưu",
                createdAt: "Hiện tại",
                editable: true,
            };
            setLogs((prev) => [newLog, ...prev]);
            setNotice(asDraft ? "Đã lưu nháp nhật ký lưu trú." : `Đã lưu nhật ký buổi ${form.session.toLowerCase()} cho ${selectedPet.petName}.`);
        }

        closeModal();
    };

    const deleteLog = (log: BoardingLog) => {
        if (!log.editable) {
            setNotice("Không được sửa hoặc xóa các bài nhật ký của ngày hôm qua trở về trước.");
            return;
        }

        setLogs((prev) => prev.filter((item) => item.id !== log.id));
        setNotice(`Đã xóa nhật ký ${log.id} của ngày hôm nay.`);
    };

    const handleFiles = (files: File[]) => {
        const tooLarge = files.some((file) => file.size > 10 * 1024 * 1024);
        if (files.length > 5) {
            setFormError("Chỉ được chọn tối đa 5 tệp cho một nhật ký.");
            return;
        }
        if (tooLarge) {
            setFormError("Có tệp vượt quá giới hạn 10MB.");
            return;
        }
        setFormError("");
        setForm((prev) => ({ ...prev, fileNames: files.map((file) => file.name) }));
    };

    const rows = petLogs.map((log) => [
        <span key={`${log.id}-id`} className="font-semibold text-text-main">
            {log.id}
        </span>,
        log.date,
        log.session,
        log.mealStatus,
        log.hygieneStatus,
        <div key={`${log.id}-files`} className="space-y-1">
            {log.files.length > 0 ? (
                log.files.map((file) => (
                    <p key={file} className="text-xs text-slate-500">
                        {file}
                    </p>
                ))
            ) : (
                <p className="text-xs text-slate-400">Chưa có tệp</p>
            )}
        </div>,
        <Tag key={`${log.id}-status`} tone={log.status === "Đã lưu" ? "green" : "amber"}>
            {log.status}
        </Tag>,
        <div key={`${log.id}-actions`} className="flex flex-wrap gap-2">
            <Button
                variant="outline"
                className="px-3 py-1.5 text-xs"
                onClick={() => openEditModal(log)}
                disabled={!log.editable}
            >
                Sửa
            </Button>
            <Button
                variant="soft"
                className="px-3 py-1.5 text-xs"
                onClick={() => deleteLog(log)}
                disabled={!log.editable}
            >
                Xóa
            </Button>
        </div>,
    ]);

    return (
        <div className="space-y-6">
            <MiniGridStats
                items={[
                    { label: "Thú cưng lưu trú", value: String(stats.staying), hint: "Đang ở trạng thái lưu trú", icon: Camera },
                    { label: "Nhật ký hôm nay", value: String(stats.todayLogs), hint: "Bản ghi đã lưu trong ngày", icon: ClipboardCheck },
                    { label: "Cần bổ sung", value: String(stats.missing), hint: "Chưa đủ 3 buổi sáng/trưa/chiều", icon: Plus },
                ]}
            />

            {notice && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
                    {notice}
                </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <Card
                    title="Thú cưng đang lưu trú"
                    right={<Button className="px-3 py-1.5 text-xs" onClick={() => setIsPetModalOpen(true)}>Thêm thú cưng</Button>}
                >
                    <div className="space-y-3">
                        {boardingPets.map((pet) => {
                            const sessions = new Set(
                                logs
                                    .filter((log) => log.petId === pet.id && log.date === today && log.status === "Đã lưu")
                                    .map((log) => log.session)
                            );
                            const isActive = pet.id === selectedPet?.id;

                            return (
                                <button
                                    type="button"
                                    key={pet.id}
                                    onClick={() => setSelectedPetId(pet.id)}
                                    className={`w-full cursor-pointer rounded-3xl border p-4 text-left transition hover:border-emerald-300 hover:shadow-sm ${
                                        isActive ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200 bg-white"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold">{pet.cage} - {pet.petName}</p>
                                            <p className="mt-1 text-sm text-slate-500">{pet.ownerName} • {pet.dayText}</p>
                                            <p className="mt-2 text-xs text-slate-500">
                                                Đã cập nhật {sessions.size}/3 buổi hôm nay
                                            </p>
                                        </div>
                                        <Tag tone={sessions.size === 3 ? "green" : "amber"}>
                                            {sessions.size === 3 ? "Đủ 3 buổi" : "Cần cập nhật"}
                                        </Tag>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </Card>

                <Card
                    title="Nhật ký lưu trú hôm nay"
                    subtitle={`${selectedPet?.cage ?? ""} - ${selectedPet?.petName ?? ""}. Chỉ cho phép sửa/xóa nhật ký trong ngày hiện tại.`}
                    right={<Button onClick={openCreateModal}>Thêm nhật ký</Button>}
                >
                    <div className="mb-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                        Còn thiếu: {missingSessions.length > 0 ? missingSessions.join(", ") : "Đã đủ 3 buổi cập nhật"}.
                    </div>
                    <DataTable
                        columns={["Mã nhật ký", "Ngày", "Buổi", "Ăn uống", "Vệ sinh", "Tệp", "Trạng thái", "Hành động"]}
                        rows={rows}
                    />
                </Card>
            </div>

            {isModalOpen && selectedPet && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="w-full max-w-xl rounded-3xl border border-border-main bg-white p-5 shadow-lg">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-base font-semibold text-text-main">
                                    {editingLogId ? "Sửa nhật ký lưu trú" : "Thêm nhật ký lưu trú"}
                                </h3>
                                <p className="mt-1 text-sm text-text-muted">
                                    Cập nhật tình trạng ăn uống, vệ sinh và ảnh/video trong ngày cho {selectedPet.petName}.
                                </p>
                            </div>
                            <button
                                type="button"
                                aria-label="Đóng modal nhật ký lưu trú"
                                className="rounded-xl p-2 text-text-muted transition hover:bg-slate-100 hover:text-text-main"
                                onClick={closeModal}
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
                            <Select
                                label="Buổi cập nhật"
                                options={sessionOptions}
                                value={form.session}
                                onChange={(event) => setForm((prev) => ({ ...prev, session: event.target.value as Session }))}
                            />
                            <Select
                                label="Tình trạng ăn uống"
                                options={mealOptions}
                                value={form.mealStatus}
                                onChange={(event) => setForm((prev) => ({ ...prev, mealStatus: event.target.value as MealStatus }))}
                            />
                            <Select
                                label="Tình trạng vệ sinh"
                                options={hygieneOptions}
                                value={form.hygieneStatus}
                                onChange={(event) => setForm((prev) => ({ ...prev, hygieneStatus: event.target.value as HygieneStatus }))}
                            />
                            <label className="block cursor-pointer rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/30">
                                <input
                                    className="sr-only"
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    onChange={(event) => handleFiles(Array.from(event.target.files ?? []))}
                                />
                                <div className="flex items-start gap-3">
                                    <UploadCloud className="mt-1 h-5 w-5 text-slate-400" />
                                    <div>
                                        <p className="text-sm font-medium">Ảnh / video</p>
                                        <p className="mt-2 text-xs text-slate-500">Bấm vào ô này để chọn tối đa 5 tệp từ máy, mỗi tệp không quá 10MB.</p>
                                        <p className="mt-3 text-xs font-medium text-emerald-700">
                                            {form.fileNames.length > 0 ? `Đã chọn ${form.fileNames.length} tệp` : "Chọn tệp từ máy"}
                                        </p>
                                    </div>
                                </div>
                                {form.fileNames.length > 0 && (
                                    <div className="mt-3 space-y-1 text-xs text-slate-500">
                                        {form.fileNames.map((file) => <p key={file}>{file}</p>)}
                                    </div>
                                )}
                            </label>
                        </div>
                        <div className="mt-4">
                            <Textarea
                                label="Ghi chú"
                                placeholder="Biểu hiện, thói quen, sức khỏe, giờ uống thuốc..."
                                value={form.note}
                                onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                            />
                        </div>
                        <div className="mt-5 flex justify-end gap-2">
                            <Button variant="ghost" onClick={closeModal}>Đóng</Button>
                            <Button variant="outline" onClick={() => saveLog(true)}>Lưu nháp</Button>
                            <Button onClick={() => saveLog(false)}>Lưu nhật ký</Button>
                        </div>
                    </div>
                </div>
            )}

            {isPetModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="w-full max-w-xl rounded-3xl border border-border-main bg-white p-5 shadow-lg">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-base font-semibold text-text-main">Thêm thú cưng lưu trú</h3>
                                <p className="mt-1 text-sm text-text-muted">
                                    Nhập thông tin thú cưng đang lưu trú để nhân viên có thể ghi nhật ký chăm sóc trong ngày.
                                </p>
                            </div>
                            <button
                                type="button"
                                aria-label="Đóng modal thêm thú cưng lưu trú"
                                className="rounded-xl p-2 text-text-muted transition hover:bg-slate-100 hover:text-text-main"
                                onClick={closePetModal}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {petFormError && (
                            <div className="mb-4 rounded-2xl bg-rose-50 p-3 text-sm font-medium text-rose-700">
                                {petFormError}
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            <Input
                                label="Chuồng / phòng"
                                placeholder="Ví dụ: A01"
                                value={petForm.cage}
                                onChange={(event) => setPetForm((prev) => ({ ...prev, cage: event.target.value }))}
                            />
                            <Input
                                label="Tên thú cưng"
                                placeholder="Nhập tên thú cưng"
                                value={petForm.petName}
                                onChange={(event) => setPetForm((prev) => ({ ...prev, petName: event.target.value }))}
                            />
                            <Input
                                label="Tên chủ nuôi"
                                placeholder="Nhập tên chủ nuôi"
                                value={petForm.ownerName}
                                onChange={(event) => setPetForm((prev) => ({ ...prev, ownerName: event.target.value }))}
                            />
                            <Input
                                label="Ngày lưu trú"
                                placeholder="Ví dụ: Ngày 1/3"
                                value={petForm.dayText}
                                onChange={(event) => setPetForm((prev) => ({ ...prev, dayText: event.target.value }))}
                            />
                            <div className="md:col-span-2">
                                <Select
                                    label="Trạng thái lưu trú"
                                    options={statusOptions}
                                    value={petForm.status}
                                    onChange={(event) => setPetForm((prev) => ({ ...prev, status: event.target.value as BoardingPet["status"] }))}
                                />
                            </div>
                        </div>

                        <div className="mt-5 flex justify-end gap-2">
                            <Button variant="ghost" onClick={closePetModal}>Đóng</Button>
                            <Button onClick={savePet}>Thêm thú cưng</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
