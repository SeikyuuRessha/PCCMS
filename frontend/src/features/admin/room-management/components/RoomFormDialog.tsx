import { Button, Input, Textarea } from "~/components/atoms";
import { Card } from "~/components/molecules";
import { roomStatusLabels, roomTypes } from "../mockRooms";
import type { BoardingRoom, RoomFormValues } from "../types";

interface RoomFormDialogProps {
    open: boolean;
    mode: "create" | "edit";
    value: RoomFormValues;
    loading: boolean;
    error?: string;
    onChange: (value: RoomFormValues) => void;
    onClose: () => void;
    onSubmit: () => void;
    currentRoom?: BoardingRoom | null;
}

export function RoomFormDialog({
    open,
    mode,
    value,
    loading,
    error,
    onChange,
    onClose,
    onSubmit,
    currentRoom,
}: RoomFormDialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
            <div className="w-full max-w-3xl">
                <Card title={mode === "create" ? "Thêm phòng" : "Sửa phòng"} subtitle="Nhập thông tin phòng lưu trú, sức chứa và trạng thái sử dụng">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input
                            label="Mã phòng / chuồng"
                            value={value.code}
                            onChange={(e) => onChange({ ...value, code: e.target.value })}
                            placeholder="VD: ROOM011"
                        />
                        <Input
                            label="Tên phòng / chuồng"
                            value={value.name}
                            onChange={(e) => onChange({ ...value, name: e.target.value })}
                            placeholder="VD: Chuồng C01"
                        />
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-medium text-slate-700">Loại phòng</label>
                            <select
                                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                value={value.type}
                                onChange={(e) => onChange({ ...value, type: e.target.value as RoomFormValues["type"] })}
                            >
                                <option value="">Chọn loại phòng</option>
                                {roomTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Input
                            label="Sức chứa"
                            type="number"
                            min="1"
                            step="1"
                            value={value.capacity}
                            onChange={(e) => onChange({ ...value, capacity: e.target.value })}
                            placeholder="VD: 1"
                        />
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-medium text-slate-700">Trạng thái</label>
                            <select
                                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                value={value.status}
                                onChange={(e) => onChange({ ...value, status: e.target.value as RoomFormValues["status"] })}
                            >
                                <option value="">Chọn trạng thái</option>
                                <option value="Trống">{roomStatusLabels.Trống}</option>
                                <option value="Đang sử dụng">{roomStatusLabels["Đang sử dụng"]}</option>
                                <option value="Bảo trì">{roomStatusLabels["Bảo trì"]}</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <Textarea
                                label="Ghi chú"
                                value={value.note}
                                onChange={(e) => onChange({ ...value, note: e.target.value })}
                                placeholder="Nhập ghi chú nếu cần"
                                rows={3}
                            />
                        </div>
                    </div>

                    {error && <p className="mt-3 text-sm font-medium text-error-600">{error}</p>}

                    <div className="mt-6 flex flex-wrap justify-end gap-3">
                        <Button variant="outline" onClick={onClose} disabled={loading}>
                            Hủy
                        </Button>
                        <Button onClick={onSubmit} disabled={loading}>
                            {loading ? "Đang lưu..." : mode === "create" ? "Thêm phòng" : "Cập nhật phòng"}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
