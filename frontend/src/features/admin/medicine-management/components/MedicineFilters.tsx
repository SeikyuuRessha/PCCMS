import { Search, RotateCcw } from "lucide-react";
import { Button, Input, Select } from "~/components/atoms";
import { Card } from "~/components/molecules";
import { medicineUnits } from "../mockMedicines";
import type { MedicineFilterValues, MedicineStockStatus } from "../types";

interface MedicineFiltersProps {
    value: MedicineFilterValues;
    categoryOptions: Array<{ id: string; name: string }>;
    onChange: (value: MedicineFilterValues) => void;
    onSearch: () => void;
    onReset: () => void;
    loading: boolean;
    error?: string;
}

const stockStatusOptions: Array<{ value: "" | MedicineStockStatus; label: string }> = [
    { value: "", label: "Tất cả" },
    { value: "inStock", label: "Còn hàng" },
    { value: "lowStock", label: "Sắp hết" },
    { value: "outOfStock", label: "Hết hàng" },
];

export function MedicineFilters({ value, categoryOptions, onChange, onSearch, onReset, loading, error }: MedicineFiltersProps) {
    return (
        <Card title="Bộ lọc thuốc" subtitle="Tìm theo mã thuốc, tên thuốc, nhóm thuốc và trạng thái tồn kho">
            <div className="grid gap-4 lg:grid-cols-4">
                <Input
                    label="Tìm theo mã thuốc hoặc tên thuốc"
                    value={value.keyword}
                    onChange={(e) => onChange({ ...value, keyword: e.target.value })}
                    placeholder="Nhập mã hoặc tên thuốc"
                />
                <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-medium text-slate-700">Nhóm thuốc</label>
                    <select
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                        value={value.group}
                        onChange={(e) => onChange({ ...value, group: e.target.value })}
                    >
                        <option value="">Tất cả nhóm thuốc</option>
                        {categoryOptions.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
                <Select
                    label="Đơn vị tính"
                    value={value.unit}
                    onChange={(e) => onChange({ ...value, unit: e.target.value })}
                    options={["Tất cả đơn vị", ...medicineUnits]}
                />
                <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-medium text-slate-700">Trạng thái tồn kho</label>
                    <select
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                        value={value.stockStatus}
                        onChange={(e) => onChange({ ...value, stockStatus: e.target.value as "" | MedicineStockStatus })}
                    >
                        {stockStatusOptions.map((item) => (
                            <option key={item.value || "all"} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                </div>
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
