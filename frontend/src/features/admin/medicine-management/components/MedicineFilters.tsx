import { Search, RotateCcw } from "lucide-react";
import { Button, Input, Select } from "~/components/atoms";
import { Card } from "~/components/molecules";
import { medicineGroups, medicineUnits } from "../mockMedicines";
import type { MedicineFilterValues, MedicineStockStatus } from "../types";

interface MedicineFiltersProps {
    value: MedicineFilterValues;
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

export function MedicineFilters({ value, onChange, onSearch, onReset, loading, error }: MedicineFiltersProps) {
    return (
        <Card title="Bộ lọc thuốc" subtitle="Tìm theo mã thuốc, tên thuốc, nhóm thuốc và trạng thái tồn kho">
            <div className="grid gap-4 lg:grid-cols-4">
                <Input
                    label="Tìm theo mã thuốc hoặc tên thuốc"
                    value={value.keyword}
                    onChange={(e) => onChange({ ...value, keyword: e.target.value })}
                    placeholder="Nhập mã hoặc tên thuốc"
                />
                <Select
                    label="Nhóm thuốc"
                    value={value.group}
                    onChange={(e) => onChange({ ...value, group: e.target.value })}
                    options={["Tất cả nhóm thuốc", ...medicineGroups]}
                />
                <Select
                    label="Đơn vị tính"
                    value={value.unit}
                    onChange={(e) => onChange({ ...value, unit: e.target.value })}
                    options={["Tất cả đơn vị", ...medicineUnits]}
                />
                <Select
                    label="Trạng thái tồn kho"
                    value={value.stockStatus}
                    onChange={(e) => onChange({ ...value, stockStatus: e.target.value as "" | MedicineStockStatus })}
                    options={stockStatusOptions.map((item) => item.label)}
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
