import { Search, RotateCcw } from "lucide-react";
import { Button, Input } from "~/components/atoms";
import { Card } from "~/components/molecules";
import { serviceStatuses, serviceTypes, serviceTypeLabels, serviceStatusLabels } from "../mockServices";
import type { ServiceSearchParams, ServiceStatus, ServiceType } from "../types";

interface ServiceFiltersProps {
    value: ServiceSearchParams;
    onChange: (value: ServiceSearchParams) => void;
    onSearch: () => void;
    onReset: () => void;
    loading: boolean;
    error?: string;
}

export function ServiceFilters({ value, onChange, onSearch, onReset, loading, error }: ServiceFiltersProps) {
    return (
        <Card title="Bộ lọc tìm kiếm" subtitle="Tìm theo mã dịch vụ, tên dịch vụ, loại và trạng thái">
            <div className="grid gap-4 lg:grid-cols-3">
                <Input
                    label="Mã / tên dịch vụ"
                    value={value.keyword}
                    onChange={(e) => onChange({ ...value, keyword: e.target.value })}
                    placeholder="Nhập mã hoặc tên dịch vụ"
                />
                <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-medium text-slate-700">Loại dịch vụ</label>
                    <select
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                        value={value.type}
                        onChange={(e) => onChange({ ...value, type: e.target.value as ServiceType | "" })}
                    >
                        <option value="">Tất cả loại dịch vụ</option>
                        {serviceTypes.map((type) => (
                            <option key={type} value={type}>
                                {serviceTypeLabels[type]}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-medium text-slate-700">Trạng thái</label>
                    <select
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                        value={value.status}
                        onChange={(e) => onChange({ ...value, status: e.target.value as ServiceStatus | "" })}
                    >
                        <option value="">Tất cả trạng thái</option>
                        {serviceStatuses.map((status) => (
                            <option key={status} value={status}>
                                {serviceStatusLabels[status]}
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
