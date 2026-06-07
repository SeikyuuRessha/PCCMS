import { Button, Tag } from "~/components/atoms";
import { Card, EmptyState } from "~/components/molecules";
import { serviceStatusLabels } from "../mockServices";
import type { Service, ServiceStatus } from "../types";

interface ServiceTableProps {
    items: Service[];
    loading: boolean;
    onEdit: (service: Service) => void;
    onDelete: (service: Service) => void;
}

const statusTone: Record<ServiceStatus, "green" | "amber"> = {
    active: "green",
    inactive: "amber",
};

export function ServiceTable({ items, loading, onEdit, onDelete }: ServiceTableProps) {
    return (
        <Card title="Danh sách dịch vụ" subtitle="Quản lý dịch vụ khám, làm đẹp và lưu trú của trung tâm">
            {loading ? (
                <div className="py-10 text-center text-sm text-slate-500">Đang tải dữ liệu dịch vụ...</div>
            ) : items.length === 0 ? (
                <EmptyState
                    title="Không tìm thấy dịch vụ nào"
                    description="Không có dịch vụ nào thỏa mãn điều kiện tìm kiếm hiện tại."
                    className="py-12"
                />
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">STT</th>
                                <th className="px-4 py-3 font-medium">Mã dịch vụ</th>
                                <th className="px-4 py-3 font-medium">Tên dịch vụ</th>
                                <th className="px-4 py-3 font-medium">Loại dịch vụ</th>
                                <th className="px-4 py-3 font-medium">Đơn giá</th>
                                <th className="px-4 py-3 font-medium">Thời lượng dự kiến</th>
                                <th className="px-4 py-3 font-medium">Trạng thái</th>
                                <th className="px-4 py-3 font-medium">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {items.map((service, index) => (
                                <tr key={service.id}>
                                    <td className="px-4 py-3">{index + 1}</td>
                                    <td className="px-4 py-3 font-medium text-slate-900">{service.code}</td>
                                    <td className="px-4 py-3">
                                        <div className="space-y-1">
                                            <p className="font-medium text-slate-900">{service.name}</p>
                                            <p className="text-xs text-slate-500">{service.description}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{service.type}</td>
                                    <td className="px-4 py-3 font-medium">{service.price.toLocaleString("vi-VN")} đ</td>
                                    <td className="px-4 py-3">{service.durationMinutes > 0 ? `${service.durationMinutes} phút` : "-"}</td>
                                    <td className="px-4 py-3">
                                        <Tag tone={statusTone[service.status]}>{serviceStatusLabels[service.status]}</Tag>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-2">
                                            <Button variant="outline" className="px-3 py-1.5 text-xs" onClick={() => onEdit(service)}>
                                                Sửa
                                            </Button>
                                            <Button variant="ghost" className="px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50" onClick={() => onDelete(service)}>
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
