import {
    CalendarDays,
    CheckCircle2,
    Dog,
    Edit3,
    HeartPulse,
    PawPrint,
    Plus,
    Save,
    Stethoscope,
    Weight,
    X,
} from "lucide-react";
import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";
import { Button, Input, Select, Textarea } from "~/components/atoms";
import { cx } from "~/utils/cx";

type ServiceStatus = "NORMAL" | "BOARDING" | "SPA" | "WAITING_VET";

interface Pet {
    id: string;
    name: string;
    species: string;
    gender: string;
    weight: number;
    breed?: string;
    dob?: string;
    color?: string;
    specialNotes?: string;
    serviceStatus: ServiceStatus;
    lastVisit?: string;
}

interface PetFormData {
    name: string;
    species: string;
    gender: string;
    weight: number | "";
    breed: string;
    dob: string;
    color: string;
    specialNotes: string;
}

const speciesOptions = ["Chó", "Mèo", "Chim", "Thỏ", "Khác"];
const genderOptions = ["Đực", "Cái", "Chưa rõ"];

const emptyForm: PetFormData = {
    name: "",
    species: "Chó",
    gender: "Đực",
    weight: "",
    breed: "",
    dob: "",
    color: "",
    specialNotes: "",
};

const MOCK_PETS: Pet[] = [
    {
        id: "1",
        name: "Milu",
        species: "Chó",
        gender: "Đực",
        weight: 4.5,
        breed: "Corgi",
        dob: "2023-08-12",
        color: "Vàng trắng",
        serviceStatus: "BOARDING",
        lastVisit: "15/04/2026",
        specialNotes: "Dị ứng thịt gà, cần báo trước khi đổi khẩu phần.",
    },
    {
        id: "2",
        name: "Mimi",
        species: "Mèo",
        gender: "Cái",
        weight: 3.2,
        breed: "Anh lông ngắn",
        dob: "2022-11-03",
        color: "Xám",
        serviceStatus: "NORMAL",
        lastVisit: "02/03/2026",
        specialNotes: "Hơi sợ tiếng ồn, nên dùng phòng chờ yên tĩnh.",
    },
    {
        id: "3",
        name: "LuLu",
        species: "Chó",
        gender: "Cái",
        weight: 2.1,
        breed: "Poodle",
        dob: "2024-02-18",
        color: "Nâu",
        serviceStatus: "WAITING_VET",
        lastVisit: "Chưa có",
    },
];

const statusMeta: Record<ServiceStatus, { label: string; className: string }> = {
    BOARDING: {
        label: "Đang lưu trú",
        className: "border-blue-100 bg-blue-50 text-blue-700",
    },
    SPA: {
        label: "Đang làm đẹp",
        className: "border-pink-100 bg-pink-50 text-pink-700",
    },
    WAITING_VET: {
        label: "Chờ khám",
        className: "border-amber-100 bg-amber-50 text-amber-700",
    },
    NORMAL: {
        label: "Bình thường",
        className: "border-emerald-100 bg-emerald-50 text-emerald-700",
    },
};

const formFromPet = (pet: Pet): PetFormData => ({
    name: pet.name,
    species: pet.species,
    gender: pet.gender,
    weight: pet.weight,
    breed: pet.breed || "",
    dob: pet.dob || "",
    color: pet.color || "",
    specialNotes: pet.specialNotes || "",
});

const formatDob = (dob?: string) => {
    if (!dob) return "Chưa cập nhật";

    return new Intl.DateTimeFormat("vi-VN").format(new Date(dob));
};

export function PetProfilesPage() {
    const [pets, setPets] = useState<Pet[]>(MOCK_PETS);
    const [editingPetId, setEditingPetId] = useState<string | null>(null);
    const [formData, setFormData] = useState<PetFormData>(emptyForm);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const pageStats = useMemo(
        () => [
            {
                label: "Tổng hồ sơ",
                value: pets.length,
                icon: PawPrint,
            },
            {
                label: "Đang dùng dịch vụ",
                value: pets.filter((pet) => pet.serviceStatus !== "NORMAL").length,
                icon: Stethoscope,
            },
            {
                label: "Cần lưu ý",
                value: pets.filter((pet) => Boolean(pet.specialNotes)).length,
                icon: HeartPulse,
            },
        ],
        [pets]
    );

    const handleChange = (
        event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "weight" ? (value === "" ? "" : Number(value)) : value,
        }));
    };

    const openCreateModal = () => {
        setEditingPetId(null);
        setFormData(emptyForm);
        setIsModalOpen(true);
    };

    const openEditModal = (pet: Pet) => {
        setEditingPetId(pet.id);
        setFormData(formFromPet(pet));
        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (isSaving) return;
        setIsModalOpen(false);
        setEditingPetId(null);
        setFormData(emptyForm);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!formData.name.trim() || !formData.species || !formData.weight) return;

        const normalizedWeight = Number(formData.weight);
        if (!Number.isFinite(normalizedWeight) || normalizedWeight <= 0) return;

        setIsSaving(true);

        window.setTimeout(() => {
            if (editingPetId) {
                setPets((currentPets) =>
                    currentPets.map((pet) =>
                        pet.id === editingPetId
                            ? {
                                ...pet,
                                ...formData,
                                name: formData.name.trim(),
                                breed: formData.breed.trim(),
                                color: formData.color.trim(),
                                specialNotes: formData.specialNotes.trim(),
                                weight: normalizedWeight,
                            }
                            : pet
                    )
                );
            } else {
                const newPet: Pet = {
                    id: crypto.randomUUID(),
                    ...formData,
                    name: formData.name.trim(),
                    breed: formData.breed.trim(),
                    color: formData.color.trim(),
                    specialNotes: formData.specialNotes.trim(),
                    weight: normalizedWeight,
                    serviceStatus: "NORMAL",
                    lastVisit: "Chưa có",
                };

                setPets((currentPets) => [newPet, ...currentPets]);
            }

            setIsSaving(false);
            setIsModalOpen(false);
            setEditingPetId(null);
            setFormData(emptyForm);
        }, 350);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                        Hồ sơ thú cưng
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm text-slate-500">
                        Quản lý thông tin, ghi chú chăm sóc và cập nhật hồ sơ thú cưng bằng mock data.
                    </p>
                </div>
                <Button onClick={openCreateModal} className="w-full justify-center lg:w-auto">
                    <span className="inline-flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Thêm thú cưng
                    </span>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {pageStats.map((item) => (
                    <div
                        key={item.label}
                        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-950">{item.value}</p>
                            </div>
                            <div className="rounded-2xl bg-primary-50 p-3 text-primary-700">
                                <item.icon className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <section className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-950">Danh sách hồ sơ</h3>
                        <p className="text-sm text-slate-500">
                            Hồ sơ được hiển thị trực tiếp trên card. Thêm hoặc chỉnh sửa sẽ mở popup.
                        </p>
                    </div>
                    <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {pets.length} hồ sơ
                    </span>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {pets.map((pet) => {
                        const status = statusMeta[pet.serviceStatus];

                        return (
                            <article
                                key={pet.id}
                                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md"
                            >
                                <div className="bg-linear-to-br from-primary-50 via-white to-emerald-50 p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-primary-700 shadow-sm">
                                                <Dog className="h-7 w-7" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="truncate text-xl font-semibold text-slate-950">
                                                    {pet.name}
                                                </h4>
                                                <p className="truncate text-sm font-medium text-slate-500">
                                                    {pet.breed || pet.species} • {pet.gender}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={cx(
                                                "shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold",
                                                status.className
                                            )}
                                        >
                                            {status.label}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid gap-3 p-5 sm:grid-cols-2">
                                    <ProfileFact
                                        icon={Weight}
                                        label="Cân nặng"
                                        value={`${pet.weight} kg`}
                                    />
                                    <ProfileFact
                                        icon={CalendarDays}
                                        label="Ngày sinh"
                                        value={formatDob(pet.dob)}
                                    />
                                    <ProfileFact
                                        icon={Stethoscope}
                                        label="Lần khám gần nhất"
                                        value={pet.lastVisit || "Chưa có"}
                                    />
                                    <ProfileFact
                                        icon={PawPrint}
                                        label="Màu lông"
                                        value={pet.color || "Chưa cập nhật"}
                                    />
                                </div>

                                <div className="border-t border-slate-100 px-5 py-4">
                                    <div className="min-h-16 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                        {pet.specialNotes || "Chưa có ghi chú chăm sóc đặc biệt."}
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="mt-4 w-full justify-center"
                                        onClick={() => openEditModal(pet)}
                                    >
                                        <span className="inline-flex items-center justify-center gap-2">
                                            <Edit3 className="h-4 w-4" />
                                            Chỉnh sửa hồ sơ
                                        </span>
                                    </Button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>

            {isModalOpen && (
                <PetFormModal
                    formData={formData}
                    isEditing={Boolean(editingPetId)}
                    isSaving={isSaving}
                    onChange={handleChange}
                    onClose={closeModal}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
}

interface PetFormModalProps {
    formData: PetFormData;
    isEditing: boolean;
    isSaving: boolean;
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onClose: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function PetFormModal({
    formData,
    isEditing,
    isSaving,
    onChange,
    onClose,
    onSubmit,
}: PetFormModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                            <Dog className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-950">
                                {isEditing ? "Chỉnh sửa hồ sơ thú cưng" : "Thêm thú cưng mới"}
                            </h3>
                            <p className="text-sm text-slate-500">
                                {isEditing
                                    ? "Cập nhật thông tin ngay trên mock data."
                                    : "Tạo hồ sơ mới trong danh sách mock data."}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Đóng popup"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="max-h-[calc(92vh-86px)] overflow-y-auto p-5 sm:p-6">

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                            label="Tên thú cưng"
                            name="name"
                            value={formData.name}
                            onChange={onChange}
                            placeholder="Milu"
                            required
                        />
                        <Select
                            label="Loài"
                            name="species"
                            options={speciesOptions}
                            value={formData.species}
                            onChange={onChange}
                            required
                        />
                        <Input
                            label="Cân nặng (kg)"
                            name="weight"
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={formData.weight}
                            onChange={onChange}
                            placeholder="4.5"
                            required
                        />
                        <Select
                            label="Giới tính"
                            name="gender"
                            options={genderOptions}
                            value={formData.gender}
                            onChange={onChange}
                            required
                        />
                        <Input
                            label="Giống"
                            name="breed"
                            value={formData.breed}
                            onChange={onChange}
                            placeholder="Poodle, Corgi..."
                        />
                        <Input
                            label="Ngày sinh"
                            name="dob"
                            type="date"
                            value={formData.dob}
                            onChange={onChange}
                        />
                    </div>

                    <div className="mt-4 gap-4">
                        <Input
                            label="Màu lông"
                            name="color"
                            value={formData.color}
                            onChange={onChange}
                            placeholder="Nâu, xám, vàng trắng..."
                        />
                    </div>

                    <div className="mt-4 gap-4">
                        <Textarea
                            label="Ghi chú chăm sóc"
                            name="specialNotes"
                            value={formData.specialNotes}
                            onChange={onChange}
                            rows={4}
                            placeholder="Dị ứng, thói quen ăn uống, tiền sử bệnh..."
                        />
                    </div>

                    <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                        <Button type="button" variant="outline" onClick={onClose} className="sm:w-32">
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSaving} className="sm:min-w-40">
                            <span className="inline-flex items-center justify-center gap-2">
                                {isEditing ? <Save className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                {isSaving ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Tạo hồ sơ"}
                            </span>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface ProfileFactProps {
    icon: typeof Weight;
    label: string;
    value: string;
}

function ProfileFact({ icon: Icon, label, value }: ProfileFactProps) {
    return (
        <div className="flex min-h-20 items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="truncate text-sm font-semibold text-slate-900">{value}</p>
            </div>
        </div>
    );
}
