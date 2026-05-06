import { Search, RotateCcw } from "lucide-react";
import { Button, Input } from "~/components/atoms";
import { Card } from "~/components/molecules";
import { roomStatusLabels, roomStatuses, roomTypeLabels, roomTypes } from "../mockRooms";
import type { RoomSearchParams, RoomStatus, RoomType } from "../types";

interface RoomFiltersProps {
    value: RoomSearchParams;
    onChange: (value: RoomSearchParams) => void;
    onSearch: () => void;
    onReset: () => void;
    loading: boolean;
    error?: string;
}

export function RoomFilters({ value, onChange, onSearch, onReset, loading, error }: RoomFiltersProps) {
    return (
        <Card title="Bộ lọc tìm kiếm" subtitle="Tìm theo mã phòng, tên phòng, loại phòng, trạng thái và sức chứa">
            <div className="grid gap-4 lg:grid-cols-4">
                <Input
                    label="Mã / tên phòng"
                    value={value.keyword}
                    onChange={(e) => onChange({ ...value, keyword: e.target.value })}
                    placeholder="Nhập mã hoặc tên phòng"
                />
                <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-medium text-slate-700">Loại phòng</label>
                    <select
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                        value={value.type}
                        onChange={(e) => onChange({ ...value, type: e.target.value as RoomType | "" })}
                    >
                        <option value="">Tất cả loại phòng</option>
                        {roomTypes.map((type) => (
                            <option key={type} value={type}>
                                {roomTypeLabels[type]}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-medium text-slate-700">Trạng thái</label>
                    <select
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                        value={value.status}
                        onChange={(e) => onChange({ ...value, status: e.target.value as RoomStatus | "" })}
                    >
                        <option value="">Tất cả trạng thái</option>
                        {roomStatuses.map((status) => (
                            <option key={status} value={status}>
                                {roomStatusLabels[status]}
                            </option>
                        ))}
                    </select>
                </div>
                <Input
                    label="Sức chứa"
                    value={value.capacity}
                    onChange={(e) => onChange({ ...value, capacity: e.target.value })}
                    placeholder="Nhập sức chứa"
                />
            </div>

            {error && <p className="mt-3 text-sm font-medium text-error-600">{error}</p>}

            <div className="mt-5 flex flex-wrap gap-3">
                <Button onClick={onSearch} disabled={loading} className="inline-flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    {loading ? "Đang tìm..." : "Tìm kiếm"}
                </Button>
                <Button variant="outline" onClick={onReset} disabled={loading} className="inline-flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Xóa bộ lọc / Làm mới
                </Button>
            </div>
        </Card>
    );
}
