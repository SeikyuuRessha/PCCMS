import { Button, Input, Textarea } from "~/components/atoms";
import { Card } from "~/components/molecules";
import { medicineGroups, medicineUnits } from "../mockMedicines";
import type { Medicine, MedicineFormValues } from "../types";

interface MedicineFormDialogProps {
    open: boolean;
    mode: "create" | "edit";
    value: MedicineFormValues;
    loading: boolean;
    error?: string;
    onChange: (value: MedicineFormValues) => void;
    onClose: () => void;
    onSubmit: () => void;
    currentMedicine?: Medicine | null;
}

export function MedicineFormDialog({
    open,
    mode,
    value,
    loading,
    error,
    onChange,
    onClose,
    onSubmit,
    currentMedicine,
}: MedicineFormDialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
            <div className="w-full max-w-3xl">
                <Card title={mode === "create" ? "Thêm thuốc" : "Sửa thuốc"} subtitle="Nhập thông tin thuốc, tồn kho và hướng dẫn dùng mặc định">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input
                            label="Mã thuốc"
                            value={value.code}
                            onChange={(e) => onChange({ ...value, code: e.target.value })}
                            placeholder="VD: MED013"
                        />
                        <Input
                            label="Tên thuốc"
                            value={value.name}
                            onChange={(e) => onChange({ ...value, name: e.target.value })}
                            placeholder="VD: Paracetamol"
                        />
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-medium text-slate-700">Nhóm thuốc</label>
                            <select
                                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                value={value.group}
                                onChange={(e) => onChange({ ...value, group: e.target.value })}
                            >
                                <option value="">Chọn nhóm thuốc</option>
                                {medicineGroups.map((group) => (
                                    <option key={group} value={group}>
                                        {group}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-medium text-slate-700">Đơn vị tính</label>
                            <select
                                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                value={value.unit}
                                onChange={(e) => onChange({ ...value, unit: e.target.value })}
                            >
                                <option value="">Chọn đơn vị</option>
                                {medicineUnits.map((unit) => (
                                    <option key={unit} value={unit}>
                                        {unit}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Input
                            label="Số lượng tồn"
                            type="number"
                            min="0"
                            step="1"
                            value={value.stock}
                            onChange={(e) => onChange({ ...value, stock: e.target.value })}
                            placeholder="VD: 20"
                        />
                        <div className="md:col-span-2">
                            <Textarea
                                label="Hướng dẫn dùng mặc định"
                                value={value.defaultUsageGuide}
                                onChange={(e) => onChange({ ...value, defaultUsageGuide: e.target.value })}
                                placeholder="Nhập hướng dẫn dùng mặc định"
                                rows={3}
                            />
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

                    {mode === "edit" && currentMedicine?.isReferenced && (
                        <p className="mt-3 text-sm text-amber-700">
                            Thuốc này đang được tham chiếu trong đơn hoặc kho. Có thể cập nhật thông tin nhưng cần thận trọng khi xóa.
                        </p>
                    )}

                    <div className="mt-6 flex flex-wrap justify-end gap-3">
                        <Button variant="outline" onClick={onClose} disabled={loading}>
                            Hủy
                        </Button>
                        <Button onClick={onSubmit} disabled={loading}>
                            {loading ? "Đang lưu..." : mode === "create" ? "Thêm thuốc" : "Cập nhật thuốc"}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
