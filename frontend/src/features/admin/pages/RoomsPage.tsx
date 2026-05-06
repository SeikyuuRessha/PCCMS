import { useEffect, useMemo, useState } from "react";
import { Button } from "~/components/atoms";
import { Card } from "~/components/molecules";
import { RoomSummaryCards } from "../room-management/components/RoomSummaryCards";
import { RoomFilters } from "../room-management/components/RoomFilters";
import { RoomTable } from "../room-management/components/RoomTable";
import { RoomFormDialog } from "../room-management/components/RoomFormDialog";
import { RoomDeleteDialog } from "../room-management/components/RoomDeleteDialog";
import { createRoom, deleteRoom, getRooms, searchRooms, updateRoom } from "../room-management/roomService";
import type { BoardingRoom, RoomFormValues, RoomSearchParams } from "../room-management/types";

const emptyFilters: RoomSearchParams = {
    keyword: "",
    type: "",
    status: "",
    capacity: "",
};

const emptyForm: RoomFormValues = {
    code: "",
    name: "",
    type: "",
    capacity: "",
    status: "",
    note: "",
};

const buildFormValues = (room: BoardingRoom): RoomFormValues => ({
    code: room.code,
    name: room.name,
    type: room.type,
    capacity: String(room.capacity),
    status: room.status,
    note: room.note,
});

export function RoomsPage() {
    const [rooms, setRooms] = useState<BoardingRoom[]>([]);
    const [filters, setFilters] = useState<RoomSearchParams>(emptyFilters);
    const [loading, setLoading] = useState(true);
    const [searchError, setSearchError] = useState("");
    const [feedback, setFeedback] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [formValue, setFormValue] = useState<RoomFormValues>(emptyForm);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [editingRoom, setEditingRoom] = useState<BoardingRoom | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<BoardingRoom | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const loadRooms = async () => {
        setLoading(true);
        const data = await getRooms();
        setRooms(data);
        setLoading(false);
    };

    useEffect(() => {
        void loadRooms();
    }, []);

    const total = rooms.length;
    const emptyCount = rooms.filter((room) => room.status === "Trống").length;
    const occupiedCount = rooms.filter((room) => room.status === "Đang sử dụng").length;
    const maintenanceCount = rooms.filter((room) => room.status === "Bảo trì").length;

    const filteredRooms = useMemo(() => rooms, [rooms]);

    const runSearch = async () => {
        const hasCriteria = filters.keyword.trim() || filters.type.trim() || filters.status.trim() || filters.capacity.trim();
        if (!hasCriteria) {
            setSearchError("Cần nhập ít nhất một tiêu chí tìm kiếm");
            return;
        }
        setSearchError("");
        setLoading(true);
        const result = await searchRooms(filters);
        setRooms(result);
        setLoading(false);
        if (result.length === 0) {
            setFeedback("Không tìm thấy phòng nào thoả mãn tiêu chí tìm kiếm");
        }
    };

    const resetFilters = async () => {
        setFilters(emptyFilters);
        setSearchError("");
        setFeedback("");
        await loadRooms();
    };

    const openCreate = () => {
        setFormMode("create");
        setFormValue(emptyForm);
        setEditingRoom(null);
        setFormError("");
        setFormOpen(true);
    };

    const openEdit = (room: BoardingRoom) => {
        setFormMode("edit");
        setEditingRoom(room);
        setFormValue(buildFormValues(room));
        setFormError("");
        setFormOpen(true);
    };

    const submitForm = async () => {
        setFormLoading(true);
        setFormError("");
        try {
            const saved = formMode === "create" ? await createRoom(formValue) : await updateRoom(editingRoom?.id ?? "", formValue);
            const next = formMode === "create" ? [saved, ...rooms] : rooms.map((item) => (item.id === saved.id ? saved : item));
            setRooms(next);
            setFormOpen(false);
            setFeedback(formMode === "create" ? "Thêm phòng lưu trú thành công" : "Cập nhật phòng lưu trú thành công");
        } catch (error) {
            setFormError(error instanceof Error ? error.message : "Đã xảy ra lỗi");
        } finally {
            setFormLoading(false);
        }
    };

    const openDelete = (room: BoardingRoom) => {
        setDeleteTarget(room);
        setDeleteError("");
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        setDeleteError("");
        try {
            await deleteRoom(deleteTarget.id);
            setRooms((prev) => prev.filter((item) => item.id !== deleteTarget.id));
            setDeleteTarget(null);
            setFeedback("Xóa phòng lưu trú thành công");
        } catch (error) {
            setDeleteError(error instanceof Error ? error.message : "Không thể xóa phòng");
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Quản lý phòng lưu trú</h1>
                    <p className="mt-1 text-sm text-slate-500">Quản lý phòng/chuồng lưu trú, sức chứa và trạng thái sử dụng tại trung tâm.</p>
                </div>
                <Button onClick={openCreate}>Thêm phòng</Button>
            </div>

            <RoomSummaryCards total={total} empty={emptyCount} occupied={occupiedCount} maintenance={maintenanceCount} />

            <RoomFilters value={filters} onChange={setFilters} onSearch={runSearch} onReset={resetFilters} loading={loading} error={searchError} />

            {feedback && <Card className="border-emerald-200 bg-emerald-50 text-emerald-800">{feedback}</Card>}

            <RoomTable items={filteredRooms} loading={loading} onEdit={openEdit} onDelete={openDelete} />

            <RoomFormDialog
                open={formOpen}
                mode={formMode}
                value={formValue}
                loading={formLoading}
                error={formError}
                onChange={setFormValue}
                onClose={() => setFormOpen(false)}
                onSubmit={() => void submitForm()}
                currentRoom={editingRoom}
            />

            <RoomDeleteDialog
                open={Boolean(deleteTarget)}
                room={deleteTarget}
                loading={deleteLoading}
                error={deleteError}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => void confirmDelete()}
            />
        </div>
    );
}
