import { useMemo, useState } from "react";
import { CheckCircle2, FileText, HeartPulse, Pill, Trash2 } from "lucide-react";
import { Button, Input, Select, Tag, Textarea } from "~/components/atoms";
import { Card, DataTable, MiniGridStats } from "~/components/molecules";

type Medicine = {
    name: string;
    unit: string;
    stock: number;
};

type PrescriptionItem = {
    id: number;
    medicineName: string;
    unit: string;
    quantity: number;
    instruction: string;
};

const medicineCatalog: Medicine[] = [
    { name: "Amoxicillin 250mg", unit: "viên", stock: 120 },
    { name: "Metronidazole 500mg", unit: "viên", stock: 86 },
    { name: "Vitamin tổng hợp PetPlus", unit: "lọ", stock: 24 },
    { name: "Men tiêu hóa BioPet", unit: "gói", stock: 60 },
    { name: "Dung dịch sát khuẩn Betadine", unit: "lọ", stock: 18 },
];

const medicalSummary = {
    petName: "Milu",
    breed: "Poodle Toy",
    weight: "4.5 kg",
    diagnosis: "Viêm đường hô hấp",
};

export function MedicalRecordPage() {
    const [selectedMedicine, setSelectedMedicine] = useState(medicineCatalog[0].name);
    const [quantity, setQuantity] = useState("1");
    const [instruction, setInstruction] = useState("Ngày uống 2 lần, mỗi lần 1 viên sau ăn");
    const [doctorNote, setDoctorNote] = useState("");
    const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([
        {
            id: 1,
            medicineName: "Amoxicillin 250mg",
            unit: "viên",
            quantity: 6,
            instruction: "Ngày uống 2 lần, mỗi lần 1 viên sau ăn",
        },
    ]);
    const [successMessage, setSuccessMessage] = useState("");

    const currentMedicine = useMemo(
        () => medicineCatalog.find((medicine) => medicine.name === selectedMedicine) ?? medicineCatalog[0],
        [selectedMedicine]
    );

    const totalQuantity = useMemo(
        () => prescriptionItems.reduce((total, item) => total + item.quantity, 0),
        [prescriptionItems]
    );

    const addMedicine = () => {
        const parsedQuantity = Number(quantity);

        if (!selectedMedicine || !instruction.trim() || Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
            return;
        }

        setPrescriptionItems((prev) => [
            ...prev,
            {
                id: Date.now(),
                medicineName: currentMedicine.name,
                unit: currentMedicine.unit,
                quantity: parsedQuantity,
                instruction: instruction.trim(),
            },
        ]);
        setQuantity("1");
        setInstruction("");
        setSuccessMessage("");
    };

    const removeMedicine = (id: number) => {
        setPrescriptionItems((prev) => prev.filter((item) => item.id !== id));
        setSuccessMessage("");
    };

    const completePrescription = () => {
        setSuccessMessage("Lưu đơn thuốc thành công");
    };

    const rows = prescriptionItems.map((item, index) => [
        String(index + 1),
        <span key={`${item.id}-name`} className="font-semibold text-text-main">
            {item.medicineName}
        </span>,
        item.unit,
        String(item.quantity),
        <span key={`${item.id}-instruction`} className="text-slate-600">
            {item.instruction}
        </span>,
        <Button
            key={`${item.id}-delete`}
            variant="outline"
            className="px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50"
            onClick={() => removeMedicine(item.id)}
        >
            <span className="inline-flex items-center gap-1.5">
                <Trash2 className="h-3.5 w-3.5" />
                Xóa
            </span>
        </Button>,
    ]);

    return (
        <div className="space-y-6">
            {successMessage && (
                <div className="flex items-center gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 shadow-sm">
                    <CheckCircle2 className="h-5 w-5" />
                    {successMessage}
                </div>
            )}

            <MiniGridStats
                items={[
                    {
                        label: "Thuốc đã chọn",
                        value: String(prescriptionItems.length),
                        hint: "Số loại thuốc trong đơn hiện tại",
                        icon: Pill,
                    },
                    {
                        label: "Tổng số lượng",
                        value: String(totalQuantity),
                        hint: "Tổng viên/lọ/gói cần cấp phát",
                        icon: FileText,
                    },
                    {
                        label: "Trạng thái bệnh án",
                        value: "Đang kê",
                        hint: "Bác sĩ đang hoàn thiện đơn thuốc",
                        icon: HeartPulse,
                    },
                ]}
            />

            <Card
                title="Thông tin bệnh án tóm tắt"
                subtitle="Dữ liệu mẫu phục vụ kê đơn thuốc cho lượt khám hiện tại."
                right={<Tag tone="blue">Bệnh án hôm nay</Tag>}
            >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Tên thú cưng</p>
                        <p className="mt-2 text-lg font-semibold text-text-main">{medicalSummary.petName}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Giống</p>
                        <p className="mt-2 text-lg font-semibold text-text-main">{medicalSummary.breed}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Cân nặng</p>
                        <p className="mt-2 text-lg font-semibold text-text-main">{medicalSummary.weight}</p>
                    </div>
                    <div className="rounded-2xl bg-primary-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-primary-700">Chẩn đoán</p>
                        <p className="mt-2 text-lg font-semibold text-primary-700">{medicalSummary.diagnosis}</p>
                    </div>
                </div>
            </Card>

            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <Card
                    title="Khu vực kê đơn"
                    subtitle="Chọn thuốc, nhập số lượng và hướng dẫn dùng thuốc cho chủ nuôi."
                >
                    <div className="space-y-4">
                        <Select
                            label="Tên thuốc"
                            options={medicineCatalog.map((medicine) => medicine.name)}
                            value={selectedMedicine}
                            onChange={(event) => setSelectedMedicine(event.target.value)}
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                            <Input
                                label="Số lượng"
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(event) => setQuantity(event.target.value)}
                            />
                            <Input label="Đơn vị" value={currentMedicine.unit} onChange={() => undefined} readOnly />
                        </div>

                        <Textarea
                            label="Liều dùng và cách dùng"
                            rows={4}
                            placeholder="Ví dụ: Ngày uống 2 lần, mỗi lần 1 viên sau ăn"
                            value={instruction}
                            onChange={(event) => setInstruction(event.target.value)}
                        />

                        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                            Tồn kho hiện tại: <span className="font-semibold">{currentMedicine.stock}</span>{" "}
                            {currentMedicine.unit}
                        </div>

                        <Button className="w-full py-3" onClick={addMedicine}>
                            Thêm vào đơn thuốc
                        </Button>
                    </div>
                </Card>

                <Card
                    title="Danh sách thuốc đã chọn"
                    subtitle="Danh sách này chỉ được lưu trong state để mô phỏng thao tác kê đơn."
                >
                    <DataTable
                        columns={["STT", "Tên thuốc", "Đơn vị", "Số lượng", "Liều dùng", "Thao tác"]}
                        rows={rows}
                    />

                    {prescriptionItems.length === 0 && (
                        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-text-muted">
                            Chưa có thuốc nào trong đơn. Hãy chọn thuốc và bấm Thêm vào đơn thuốc.
                        </div>
                    )}
                </Card>
            </div>

            <Card title="Ghi chú của bác sĩ & hoàn tất">
                <Textarea
                    label="Dặn dò thêm"
                    rows={5}
                    placeholder="Ví dụ: Tái khám sau 5 ngày, theo dõi ho và nhịp thở tại nhà."
                    value={doctorNote}
                    onChange={(event) => setDoctorNote(event.target.value)}
                />
                <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-text-muted md:flex-row md:items-center md:justify-between">
                    <p>
                        Kiểm tra kỹ tên thuốc, số lượng và hướng dẫn trước khi xác nhận in đơn cho chủ nuôi.
                    </p>
                    <Button onClick={completePrescription}>Xác nhận và In đơn thuốc</Button>
                </div>
            </Card>
        </div>
    );
}
