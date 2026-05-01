import { Button, Tag } from "~/components/atoms";
import { Card, EmptyState } from "~/components/molecules";
import { roomStatusLabels } from "../mockRooms";
import type { BoardingRoom, RoomStatus } from "../types";

interface RoomTableProps {
    items: BoardingRoom[];
    loading: boolean;
    onEdit: (room: BoardingRoom) => void;
    onDelete: (room: BoardingRoom) => void;
}

const statusTone: Record<RoomStatus, "green" | "amber" | "red"> = {
    Trống: "green",
    "Đang sử dụng": "red",
    "Bảo trì": "amber",
};

export function RoomTable({ items, loading, onEdit, onDelete }: RoomTableProps) {
    return (
        <Card title="Danh sách phòng lưu trú" subtitle="Quản lý phòng/chuồng lưu trú, sức chứa và trạng thái sử dụng">
            {loading ? (
                <div className="py-10 text-center text-sm text-slate-500">Đang tải dữ liệu phòng...</div>
            ) : items.length === 0 ? (
                <EmptyState
                    title="Không tìm thấy phòng nào"
                    description="Không có phòng nào thỏa mãn điều kiện tìm kiếm hiện tại."
                    className="py-12"
                />
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">STT</th>
                                <th className="px-4 py-3 font-medium">Mã phòng / chuồng</th>
                                <th className="px-4 py-3 font-medium">Tên phòng / chuồng</th>
                                <th className="px-4 py-3 font-medium">Loại phòng</th>
                                <th className="px-4 py-3 font-medium">Sức chứa</th>
                                <th className="px-4 py-3 font-medium">Trạng thái</th>
                                <th className="px-4 py-3 font-medium">Ghi chú</th>
                                <th className="px-4 py-3 font-medium">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {items.map((room, index) => (
                                <tr key={room.id}>
                                    <td className="px-4 py-3">{index + 1}</td>
                                    <td className="px-4 py-3 font-medium text-slate-900">{room.code}</td>
                                    <td className="px-4 py-3">{room.name}</td>
                                    <td className="px-4 py-3">{room.type}</td>
                                    <td className="px-4 py-3 font-medium">{room.capacity}</td>
                                    <td className="px-4 py-3">
                                        <Tag tone={statusTone[room.status]}>{roomStatusLabels[room.status]}</Tag>
                                    </td>
                                    <td className="px-4 py-3">{room.note}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-2">
                                            <Button variant="outline" className="px-3 py-1.5 text-xs" onClick={() => onEdit(room)}>
                                                Sửa
                                            </Button>
                                            <Button variant="ghost" className="px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50" onClick={() => onDelete(room)}>
                                                Xóa
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
