import { Button, Tag } from "~/components/atoms";
import { Card, EmptyState } from "~/components/molecules";
import { stockStatusLabels } from "../mockMedicines";
import type { Medicine, MedicineStockStatus } from "../types";

interface MedicineTableProps {
    items: Medicine[];
    loading: boolean;
    onEdit: (medicine: Medicine) => void;
    onDelete: (medicine: Medicine) => void;
}

const getStockStatus = (stock: number): MedicineStockStatus => {
    if (stock === 0) return "outOfStock";
    if (stock <= 20) return "lowStock";
    return "inStock";
};

const statusTone: Record<MedicineStockStatus, "green" | "amber" | "red"> = {
    inStock: "green",
    lowStock: "amber",
    outOfStock: "red",
};

export function MedicineTable({ items, loading, onEdit, onDelete }: MedicineTableProps) {
    return (
        <Card title="Danh sách thuốc" subtitle="Cập nhật nhanh tồn kho, hướng dẫn dùng và thông tin thuốc">
            {loading ? (
                <div className="py-10 text-center text-sm text-slate-500">Đang tải dữ liệu thuốc...</div>
            ) : items.length === 0 ? (
                <EmptyState
                    title="Không tìm thấy thuốc nào"
                    description="Không có thuốc nào thỏa mãn điều kiện tìm kiếm hiện tại."
                    className="py-12"
                />
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">STT</th>
                                <th className="px-4 py-3 font-medium">Mã thuốc</th>
                                <th className="px-4 py-3 font-medium">Tên thuốc</th>
                                <th className="px-4 py-3 font-medium">Nhóm thuốc</th>
                                <th className="px-4 py-3 font-medium">Đơn vị tính</th>
                                <th className="px-4 py-3 font-medium">Tồn kho</th>
                                <th className="px-4 py-3 font-medium">Hướng dẫn dùng mặc định</th>
                                <th className="px-4 py-3 font-medium">Trạng thái</th>
                                <th className="px-4 py-3 font-medium">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {items.map((medicine, index) => {
                                const stockStatus = getStockStatus(medicine.stock);
                                return (
                                    <tr key={medicine.id}>
                                        <td className="px-4 py-3">{index + 1}</td>
                                        <td className="px-4 py-3 font-medium text-slate-900">{medicine.code}</td>
                                        <td className="px-4 py-3">{medicine.name}</td>
                                        <td className="px-4 py-3">{medicine.group}</td>
                                        <td className="px-4 py-3">{medicine.unit}</td>
                                        <td className="px-4 py-3 font-medium">{medicine.stock}</td>
                                        <td className="px-4 py-3">{medicine.defaultUsageGuide}</td>
                                        <td className="px-4 py-3">
                                            <Tag tone={statusTone[stockStatus]}>{stockStatusLabels[stockStatus]}</Tag>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-2">
                                                <Button variant="outline" className="px-3 py-1.5 text-xs" onClick={() => onEdit(medicine)}>
                                                    Sửa
                                                </Button>
                                                <Button variant="ghost" className="px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50" onClick={() => onDelete(medicine)}>
                                                    Xóa
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
}
