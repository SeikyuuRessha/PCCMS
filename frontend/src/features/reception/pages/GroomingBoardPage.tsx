import { useMemo, useState } from "react";
import { Camera, CheckCircle2, Scissors, Sparkles, Upload } from "lucide-react";
import { Button, Input, Select, Tag } from "~/components/atoms";
import { Card, MiniGridStats } from "~/components/molecules";
import { cx } from "~/utils/cx";

type GroomingStatus = "Chờ thực hiện" | "Đang xử lý" | "Hoàn thành";

type GroomingPet = {
    id: string;
    petName: string;
    breed: string;
    servicePackage: string;
    ownerName: string;
    appointmentTime: string;
    status: GroomingStatus;
    steps: boolean[];
    beforePhotoName: string;
    afterPhotoName: string;
};

const groomingSteps = [
    "Bước 1: Kiểm tra da và lông.",
    "Bước 2: Tắm và sấy khô.",
    "Bước 3: Cắt tỉa theo yêu cầu.",
    "Bước 4: Vệ sinh tai và móng.",
];

const initialPets: GroomingPet[] = [
    {
        id: "GR001",
        petName: "Milu",
        breed: "Poodle Toy",
        servicePackage: "Cắt tỉa nghệ thuật",
        ownerName: "Nguyễn Minh Anh",
        appointmentTime: "09:00",
        status: "Chờ thực hiện",
        steps: [false, false, false, false],
        beforePhotoName: "",
        afterPhotoName: "",
    },
    {
        id: "GR002",
        petName: "Bơ",
        breed: "Mèo Anh lông ngắn",
        servicePackage: "Tắm thơm",
        ownerName: "Hoàng Ngọc Lan",
        appointmentTime: "10:30",
        status: "Đang xử lý",
        steps: [true, true, false, false],
        beforePhotoName: "bo-truoc-khi-tam.jpg",
        afterPhotoName: "",
    },
    {
        id: "GR003",
        petName: "Mít",
        breed: "Corgi",
        servicePackage: "Vệ sinh toàn diện",
        ownerName: "Lê Thanh Hà",
        appointmentTime: "13:15",
        status: "Hoàn thành",
        steps: [true, true, true, true],
        beforePhotoName: "mit-truoc-grooming.png",
        afterPhotoName: "mit-sau-grooming.png",
    },
];

const statusOptions: GroomingStatus[] = ["Chờ thực hiện", "Đang xử lý", "Hoàn thành"];

const statusTone: Record<GroomingStatus, "amber" | "blue" | "green"> = {
    "Chờ thực hiện": "amber",
    "Đang xử lý": "blue",
    "Hoàn thành": "green",
};

export function GroomingBoardPage() {
    const [pets, setPets] = useState<GroomingPet[]>(initialPets);
    const [selectedPetId, setSelectedPetId] = useState(initialPets[0].id);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState("Tất cả trạng thái");
    const [toastMessage, setToastMessage] = useState("");

    const selectedPet = pets.find((pet) => pet.id === selectedPetId) ?? pets[0];

    const filteredPets = useMemo(() => {
        const normalizedKeyword = searchKeyword.trim().toLowerCase();

        return pets.filter((pet) => {
            const matchesKeyword =
                !normalizedKeyword ||
                pet.petName.toLowerCase().includes(normalizedKeyword) ||
                pet.breed.toLowerCase().includes(normalizedKeyword) ||
                pet.servicePackage.toLowerCase().includes(normalizedKeyword) ||
                pet.ownerName.toLowerCase().includes(normalizedKeyword);
            const matchesStatus = statusFilter === "Tất cả trạng thái" || pet.status === statusFilter;

            return matchesKeyword && matchesStatus;
        });
    }, [pets, searchKeyword, statusFilter]);

    const stats = useMemo(
        () => ({
            waiting: pets.filter((pet) => pet.status === "Chờ thực hiện").length,
            processing: pets.filter((pet) => pet.status === "Đang xử lý").length,
            completed: pets.filter((pet) => pet.status === "Hoàn thành").length,
        }),
        [pets]
    );

    const updateSelectedPet = (updater: (pet: GroomingPet) => GroomingPet) => {
        setPets((prev) => prev.map((pet) => (pet.id === selectedPet.id ? updater(pet) : pet)));
        setToastMessage("");
    };

    const toggleStep = (stepIndex: number) => {
        updateSelectedPet((pet) => {
            const nextSteps = pet.steps.map((checked, index) => (index === stepIndex ? !checked : checked));
            const allDone = nextSteps.every(Boolean);
            const hasProgress = nextSteps.some(Boolean);

            return {
                ...pet,
                steps: nextSteps,
                status: allDone ? "Hoàn thành" : hasProgress ? "Đang xử lý" : "Chờ thực hiện",
            };
        });
    };

    const updateStatus = (status: string) => {
        updateSelectedPet((pet) => ({ ...pet, status: status as GroomingStatus }));
    };

    const updatePhotoName = (type: "beforePhotoName" | "afterPhotoName", value: string) => {
        updateSelectedPet((pet) => ({ ...pet, [type]: value }));
    };

    const completeAndNotify = () => {
        updateSelectedPet((pet) => ({
            ...pet,
            status: "Hoàn thành",
            steps: groomingSteps.map(() => true),
        }));
        setToastMessage("Dịch vụ làm đẹp đã hoàn thành, tin nhắn đã được gửi đến chủ nuôi");
    };

    return (
        <div className="space-y-6">
            {toastMessage && (
                <div className="flex items-center gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 shadow-sm">
                    <CheckCircle2 className="h-5 w-5" />
                    {toastMessage}
                </div>
            )}

            <MiniGridStats
                items={[
                    {
                        label: "Chờ thực hiện",
                        value: String(stats.waiting),
                        hint: "Thú cưng đang đợi nhân viên grooming",
                        icon: Sparkles,
                    },
                    {
                        label: "Đang xử lý",
                        value: String(stats.processing),
                        hint: "Đang thực hiện các bước làm đẹp",
                        icon: Scissors,
                    },
                    {
                        label: "Hoàn thành",
                        value: String(stats.completed),
                        hint: "Sẵn sàng thông báo cho chủ nuôi",
                        icon: CheckCircle2,
                    },
                ]}
            />

            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <Card
                    title="Danh sách thú cưng làm đẹp"
                    subtitle="Chọn một thú cưng để cập nhật quy trình grooming chi tiết."
                >
                    <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px]">
                        <Input
                            aria-label="Tìm kiếm thú cưng hoặc gói dịch vụ"
                            placeholder="Tìm theo tên, giống, gói dịch vụ"
                            value={searchKeyword}
                            onChange={(event) => setSearchKeyword(event.target.value)}
                        />
                        <Select
                            aria-label="Lọc trạng thái grooming"
                            options={["Tất cả trạng thái", ...statusOptions]}
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                        />
                    </div>

                    <div className="space-y-3">
                        {filteredPets.map((pet) => {
                            const isSelected = pet.id === selectedPet.id;

                            return (
                                <button
                                    key={pet.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedPetId(pet.id);
                                        setToastMessage("");
                                    }}
                                    className={cx(
                                        "w-full rounded-3xl border bg-white p-4 text-left transition hover:shadow-sm",
                                        isSelected
                                            ? "border-primary-300 bg-primary-50/50 shadow-sm"
                                            : "border-slate-200 hover:border-primary-200"
                                    )}
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="text-base font-semibold text-text-main">{pet.petName}</p>
                                            <p className="mt-1 text-sm text-text-muted">
                                                {pet.breed} • Chủ nuôi: {pet.ownerName}
                                            </p>
                                            <p className="mt-2 text-sm font-medium text-slate-700">
                                                {pet.servicePackage}
                                            </p>
                                        </div>
                                        <Tag tone={statusTone[pet.status]}>{pet.status}</Tag>
                                    </div>
                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-primary-600 transition-all"
                                            style={{
                                                width: `${(pet.steps.filter(Boolean).length / groomingSteps.length) * 100}%`,
                                            }}
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-text-muted">
                                        Lịch hẹn {pet.appointmentTime} • Hoàn thành {pet.steps.filter(Boolean).length}/
                                        {groomingSteps.length} bước
                                    </p>
                                </button>
                            );
                        })}

                        {filteredPets.length === 0 && (
                            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-text-muted">
                                Không tìm thấy thú cưng phù hợp với điều kiện lọc hiện tại.
                            </div>
                        )}
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card
                        title="Quy trình làm đẹp chi tiết"
                        subtitle={`Đang cập nhật cho ${selectedPet.petName} - ${selectedPet.servicePackage}.`}
                        right={<Tag tone={statusTone[selectedPet.status]}>{selectedPet.status}</Tag>}
                    >
                        <div className="mb-4 grid gap-4 md:grid-cols-2">
                            <Input
                                label="Tên thú cưng"
                                value={selectedPet.petName}
                                onChange={() => undefined}
                                readOnly
                            />
                            <Select
                                label="Trạng thái hiện tại"
                                options={statusOptions}
                                value={selectedPet.status}
                                onChange={(event) => updateStatus(event.target.value)}
                            />
                        </div>

                        <div className="space-y-3">
                            {groomingSteps.map((step, index) => (
                                <label
                                    key={step}
                                    className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-primary-200 hover:bg-primary-50/40"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedPet.steps[index]}
                                        onChange={() => toggleStep(index)}
                                        className="mt-1 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700">{step}</span>
                                </label>
                            ))}
                        </div>
                    </Card>

                    <Card
                        title="Hình ảnh trước và sau"
                        subtitle="Khu vực giả lập upload ảnh để minh họa tiến trình grooming."
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4">
                                <div className="flex items-center gap-3 text-slate-700">
                                    <Camera className="h-5 w-5 text-primary-600" />
                                    <p className="font-medium">Ảnh lúc mới nhận</p>
                                </div>
                                <Input
                                    className="mt-4"
                                    aria-label="Tên ảnh lúc mới nhận"
                                    placeholder="Ví dụ: milu-truoc-grooming.jpg"
                                    value={selectedPet.beforePhotoName}
                                    onChange={(event) => updatePhotoName("beforePhotoName", event.target.value)}
                                />
                                <Button variant="outline" className="mt-3 w-full">
                                    <span className="inline-flex items-center gap-2">
                                        <Upload className="h-4 w-4" />
                                        Chọn ảnh trước
                                    </span>
                                </Button>
                            </div>

                            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4">
                                <div className="flex items-center gap-3 text-slate-700">
                                    <Camera className="h-5 w-5 text-primary-600" />
                                    <p className="font-medium">Ảnh sau khi làm đẹp</p>
                                </div>
                                <Input
                                    className="mt-4"
                                    aria-label="Tên ảnh sau khi làm đẹp"
                                    placeholder="Ví dụ: milu-sau-grooming.jpg"
                                    value={selectedPet.afterPhotoName}
                                    onChange={(event) => updatePhotoName("afterPhotoName", event.target.value)}
                                />
                                <Button variant="outline" className="mt-3 w-full">
                                    <span className="inline-flex items-center gap-2">
                                        <Upload className="h-4 w-4" />
                                        Chọn ảnh sau
                                    </span>
                                </Button>
                            </div>
                        </div>
                    </Card>

                    <Card title="Xác nhận và thông báo">
                        <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="font-semibold text-text-main">Hoàn tất dịch vụ làm đẹp</p>
                                <p className="mt-1 text-sm text-text-muted">
                                    Khi xác nhận, hệ thống mock sẽ chuyển trạng thái sang Hoàn thành và hiển thị thông báo.
                                </p>
                            </div>
                            <Button className="shrink-0" onClick={completeAndNotify}>
                                Hoàn tất & Thông báo cho chủ nuôi
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
