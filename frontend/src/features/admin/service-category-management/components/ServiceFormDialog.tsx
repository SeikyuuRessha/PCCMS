import { Button, Input, Textarea } from "~/components/atoms";
import { Card } from "~/components/molecules";
import { serviceStatusLabels, serviceTypes } from "../mockServices";
import type { Service, ServiceFormValues } from "../types";

interface ServiceFormDialogProps {
    open: boolean;
    mode: "create" | "edit";
    value: ServiceFormValues;
    loading: boolean;
    error?: string;
    onChange: (value: ServiceFormValues) => void;
    onClose: () => void;
    onSubmit: () => void;
    currentService?: Service | null;
}

export function ServiceFormDialog({
    open,
    mode,
    value,
    loading,
    error,
    onChange,
    onClose,
    onSubmit,
    currentService,
}: ServiceFormDialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
            <div className="w-full max-w-3xl">
                <Card title={mode === "create" ? "Thêm dịch vụ" : "Sửa dịch vụ"} subtitle="Nhập thông tin dịch vụ, đơn giá và trạng thái áp dụng">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input
                            label="Mã dịch vụ"
                            value={value.code}
                            onChange={(e) => onChange({ ...value, code: e.target.value })}
                            placeholder="VD: DV009"
                        />
                        <Input
                            label="Tên dịch vụ"
                            value={value.name}
                            onChange={(e) => onChange({ ...value, name: e.target.value })}
                            placeholder="VD: Vệ sinh tai"
                        />
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-medium text-slate-700">Loại dịch vụ</label>
                            <select
                                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                value={value.type}
                                onChange={(e) => onChange({ ...value, type: e.target.value as ServiceFormValues["type"] })}
                            >
                                <option value="">Chọn loại dịch vụ</option>
                                {serviceTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Input
                            label="Đơn giá"
                            type="number"
                            min="1"
                            step="1"
                            value={value.price}
                            onChange={(e) => onChange({ ...value, price: e.target.value })}
                            placeholder="VD: 120000"
                        />
                        <Input
                            label="Thời lượng dự kiến (phút)"
                            type="number"
                            min="0"
                            step="1"
                            value={value.durationMinutes}
                            onChange={(e) => onChange({ ...value, durationMinutes: e.target.value })}
                            placeholder="VD: 60"
                        />
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-medium text-slate-700">Trạng thái</label>
                            <select
                                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                value={value.status}
                                onChange={(e) => onChange({ ...value, status: e.target.value as ServiceFormValues["status"] })}
                            >
                                <option value="">Chọn trạng thái</option>
                                <option value="active">{serviceStatusLabels.active}</option>
                                <option value="inactive">{serviceStatusLabels.inactive}</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <Textarea
                                label="Mô tả"
                                value={value.description}
                                onChange={(e) => onChange({ ...value, description: e.target.value })}
                                placeholder="Nhập mô tả dịch vụ"
                                rows={3}
                            />
                        </div>
                    </div>

                    {error && <p className="mt-3 text-sm font-medium text-error-600">{error}</p>}

                    {mode === "edit" && currentService?.isReferenced && (
                        <p className="mt-3 text-sm text-amber-700">
                            Dịch vụ này đang được sử dụng. Có thể cập nhật thông tin nhưng sẽ không thể xóa.
                        </p>
                    )}

                    <div className="mt-6 flex flex-wrap justify-end gap-3">
                        <Button variant="outline" onClick={onClose} disabled={loading}>
                            Hủy
                        </Button>
                        <Button onClick={onSubmit} disabled={loading}>
                            {loading ? "Đang lưu..." : mode === "create" ? "Thêm dịch vụ" : "Cập nhật dịch vụ"}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
