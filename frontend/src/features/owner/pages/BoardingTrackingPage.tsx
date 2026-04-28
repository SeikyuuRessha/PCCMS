import { useMemo, useState } from "react";
import {
    AlertCircle,
    Bath,
    BedDouble,
    CalendarDays,
    Camera,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Dog,
    Droplets,
    Film,
    HeartPulse,
    Moon,
    PawPrint,
    Play,
    Search,
    Sparkles,
    Utensils,
} from "lucide-react";
import { Input, Tag } from "~/components/atoms";
import { Card, SummaryRow } from "~/components/molecules";
import { cx } from "~/utils/cx";

type BoardingStatus = "BOARDING" | "READY_TO_PICKUP" | "COMPLETED";
type MediaType = "image" | "video";

interface BoardingPet {
    id: string;
    name: string;
    breed: string;
    avatar: string;
    room: string;
    checkIn: string;
    checkOut: string;
    status: BoardingStatus;
    caretaker: string;
    specialNote: string;
}

interface CareMedia {
    type: MediaType;
    url: string;
    caption: string;
}

interface CareLog {
    id: string;
    petId: string;
    createdAt: string;
    shift: string;
    title: string;
    mealStatus: string;
    hygieneStatus: string;
    moodStatus: string;
    staffNote: string;
    caretaker: string;
    media: CareMedia[];
}

const boardingPets: BoardingPet[] = [
    {
        id: "milu",
        name: "Milu",
        breed: "Poodle, 3 tuổi",
        avatar: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=240&q=80",
        room: "Chuồng VIP C2",
        checkIn: "2026-04-26",
        checkOut: "2026-04-30",
        status: "BOARDING",
        caretaker: "Ngọc Anh",
        specialNote: "Dị ứng thịt gà, ưu tiên thức ăn hạt salmon.",
    },
    {
        id: "bo",
        name: "Bơ",
        breed: "Corgi, 2 tuổi",
        avatar: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=240&q=80",
        room: "Chuồng tiêu chuẩn A4",
        checkIn: "2026-04-27",
        checkOut: "2026-04-29",
        status: "READY_TO_PICKUP",
        caretaker: "Minh Quân",
        specialNote: "Sợ tiếng ồn lớn, cần dắt đi dạo riêng.",
    },
    {
        id: "mit",
        name: "Mít",
        breed: "Mèo Anh lông ngắn, 4 tuổi",
        avatar: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=240&q=80",
        room: "Phòng mèo B1",
        checkIn: "2026-04-28",
        checkOut: "2026-05-02",
        status: "BOARDING",
        caretaker: "Hà Linh",
        specialNote: "Ăn pate lúc 8h và 18h, không dùng cát vệ sinh mùi hương.",
    },
];

const careLogs: CareLog[] = [
    {
        id: "log-001",
        petId: "milu",
        createdAt: "2026-04-28T16:20:00",
        shift: "Chiều",
        title: "Ăn tốt, vận động nhẹ sau bữa chiều",
        mealStatus: "Ăn hết 90% khẩu phần, uống nước bình thường",
        hygieneStatus: "Vệ sinh sạch, thay lót chuồng lúc 15:50",
        moodStatus: "Nhanh nhẹn, thân thiện với nhân viên",
        staffNote:
            "Milu đi dạo 15 phút trong khu sân nhỏ, phản ứng tốt khi được chải lông. Không ghi nhận ho, nôn hoặc tiêu chảy.",
        caretaker: "Ngọc Anh",
        media: [
            {
                type: "image",
                url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=960&q=80",
                caption: "Milu đi dạo sau bữa chiều",
            },
            {
                type: "video",
                url: "https://images.unsplash.com/photo-1537151672256-6caf2e9f8c95?auto=format&fit=crop&w=960&q=80",
                caption: "Video kiểm tra vận động",
            },
            {
                type: "image",
                url: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=960&q=80",
                caption: "Khu chuồng đã vệ sinh",
            },
        ],
    },
    {
        id: "log-002",
        petId: "bo",
        createdAt: "2026-04-28T11:10:00",
        shift: "Sáng",
        title: "Tắm khô, chuẩn bị bàn giao",
        mealStatus: "Ăn hết khẩu phần sáng, uống nước tốt",
        hygieneStatus: "Đã vệ sinh tai, móng và thay khăn nằm",
        moodStatus: "Vui vẻ, hơi phấn khích khi nghe tiếng chuông",
        staffNote:
            "Bơ đã được chải lông và kiểm tra da. Nhân viên sẽ nhắc chủ nuôi đón trước 18:00 để hoàn tất bàn giao.",
        caretaker: "Minh Quân",
        media: [
            {
                type: "image",
                url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=960&q=80",
                caption: "Bơ sau khi chải lông",
            },
            {
                type: "video",
                url: "https://images.unsplash.com/photo-1597633425046-08f5110420b5?auto=format&fit=crop&w=960&q=80",
                caption: "Video bàn giao cuối ngày",
            },
        ],
    },
    {
        id: "log-003",
        petId: "milu",
        createdAt: "2026-04-28T08:35:00",
        shift: "Sáng",
        title: "Theo dõi ăn uống buổi sáng",
        mealStatus: "Ăn khoảng 70% khẩu phần, uống nước tốt",
        hygieneStatus: "Đi vệ sinh bình thường",
        moodStatus: "Ổn định, thích nằm gần cửa chuồng",
        staffNote:
            "Milu ăn chậm hơn hôm qua nhưng vẫn tỉnh táo. Nhân viên sẽ chia nhỏ khẩu phần chiều để bé dễ ăn hơn.",
        caretaker: "Ngọc Anh",
        media: [
            {
                type: "image",
                url: "https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=960&q=80",
                caption: "Bữa sáng của Milu",
            },
        ],
    },
];

const statusMeta: Record<BoardingStatus, { label: string; tone: "green" | "blue" | "default" }> = {
    BOARDING: { label: "Đang lưu trú", tone: "blue" },
    READY_TO_PICKUP: { label: "Sẵn sàng đón", tone: "green" },
    COMPLETED: { label: "Đã hoàn tất", tone: "default" },
};

const formatDate = (value: string) => new Intl.DateTimeFormat("vi-VN").format(new Date(value));

const formatDateTime = (value: string) =>
    new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));

export function BoardingTrackingPage() {
    const activePets = boardingPets.filter((pet) => pet.status !== "COMPLETED");
    const [selectedPetId, setSelectedPetId] = useState(activePets[0]?.id ?? "");
    const [selectedLogId, setSelectedLogId] = useState(careLogs[0]?.id ?? "");
    const [mediaIndex, setMediaIndex] = useState(0);
    const [query, setQuery] = useState("");

    const selectedPet = activePets.find((pet) => pet.id === selectedPetId) ?? activePets[0];

    const visibleLogs = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return careLogs
            .filter((log) => log.petId === selectedPet?.id)
            .filter((log) => {
                if (!normalizedQuery) return true;

                return [log.title, log.mealStatus, log.hygieneStatus, log.moodStatus, log.staffNote]
                    .join(" ")
                    .toLowerCase()
                    .includes(normalizedQuery);
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [query, selectedPet?.id]);

    const selectedLog = visibleLogs.find((log) => log.id === selectedLogId) ?? visibleLogs[0];
    const activeMedia = selectedLog?.media[mediaIndex] ?? selectedLog?.media[0];

    const selectPet = (petId: string) => {
        const nextLog = careLogs
            .filter((log) => log.petId === petId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

        setSelectedPetId(petId);
        setSelectedLogId(nextLog?.id ?? "");
        setMediaIndex(0);
        setQuery("");
    };

    const selectLog = (logId: string) => {
        setSelectedLogId(logId);
        setMediaIndex(0);
    };

    const showPreviousMedia = () => {
        if (!selectedLog?.media.length) return;
        setMediaIndex((current) => (current === 0 ? selectedLog.media.length - 1 : current - 1));
    };

    const showNextMedia = () => {
        if (!selectedLog?.media.length) return;
        setMediaIndex((current) => (current + 1) % selectedLog.media.length);
    };

    if (activePets.length === 0) {
        return (
            <EmptyState
                title="Bạn hiện không có thú cưng nào đang lưu trú tại trung tâm"
                description="Khi có booking lưu trú đang hoạt động, nhật ký chăm sóc sẽ xuất hiện tại đây."
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-950">Theo dõi tình trạng thú cưng</h1>
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                        Cập nhật nhật ký ăn uống, vệ sinh, ghi chú chăm sóc và hình ảnh trong thời gian lưu trú.
                    </p>
                </div>
                <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                    <QuickMetric icon={BedDouble} label="Đang lưu trú" value={activePets.length.toString()} />
                    <QuickMetric icon={Camera} label="Nhật ký" value={careLogs.length.toString()} />
                    <QuickMetric icon={HeartPulse} label="Cần lưu ý" value="2" />
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
                <div className="space-y-4">
                    <Card title="Thú cưng đang lưu trú" subtitle="Theo tài khoản chủ nuôi hiện tại.">
                        <div className="space-y-3">
                            {activePets.map((pet) => {
                                const isSelected = pet.id === selectedPet?.id;
                                const meta = statusMeta[pet.status];
                                const logCount = careLogs.filter((log) => log.petId === pet.id).length;

                                return (
                                    <button
                                        key={pet.id}
                                        type="button"
                                        onClick={() => selectPet(pet.id)}
                                        className={cx(
                                            "w-full rounded-2xl border p-3 text-left transition",
                                            isSelected
                                                ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/15"
                                                : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/50"
                                        )}
                                    >
                                        <div className="flex gap-3">
                                            <img
                                                src={pet.avatar}
                                                alt={pet.name}
                                                className="h-16 w-16 rounded-2xl object-cover"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold text-slate-950">
                                                            {pet.name}
                                                        </p>
                                                        <p className="mt-0.5 truncate text-sm text-slate-500">
                                                            {pet.breed}
                                                        </p>
                                                    </div>
                                                    <Tag tone={meta.tone}>{meta.label}</Tag>
                                                </div>
                                                <div className="mt-3 grid gap-2 text-xs text-slate-500">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <BedDouble className="h-3.5 w-3.5" />
                                                        {pet.room}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <CalendarDays className="h-3.5 w-3.5" />
                                                        {formatDate(pet.checkIn)} - {formatDate(pet.checkOut)}
                                                    </span>
                                                </div>
                                                <p className="mt-3 text-xs font-medium text-slate-600">
                                                    {logCount > 0
                                                        ? `${logCount} nhật ký đã cập nhật`
                                                        : "Nhật ký chăm sóc đang được cập nhật"}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </Card>

                    {selectedPet && (
                        <Card title="Thông tin lưu trú" right={<Dog className="h-5 w-5 text-emerald-600" />}>
                            <div className="space-y-3 text-sm">
                                <SummaryRow label="Thú cưng" value={selectedPet.name} />
                                <SummaryRow label="Phòng/chuồng" value={selectedPet.room} />
                                <SummaryRow label="Nhân viên phụ trách" value={selectedPet.caretaker} />
                                <SummaryRow label="Ngày đón dự kiến" value={formatDate(selectedPet.checkOut)} />
                            </div>
                            <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                                <span className="font-semibold">Lưu ý chăm sóc: </span>
                                {selectedPet.specialNote}
                            </div>
                        </Card>
                    )}
                </div>

                <div className="space-y-4">
                    <Card
                        title="Nhật ký chăm sóc"
                        subtitle="Sắp xếp từ mới nhất đến cũ nhất."
                        right={<Tag tone="blue">{selectedPet?.name ?? "Thú cưng"}</Tag>}
                    >
                        <div className="mb-4">
                            <Input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Tìm theo ăn uống, vệ sinh, ghi chú..."
                                className="pl-9"
                            />
                            <Search className="pointer-events-none -mt-7 ml-3 h-4 w-4 text-slate-400" />
                        </div>

                        {visibleLogs.length === 0 ? (
                            <EmptyState
                                compact
                                title="Nhật ký chăm sóc đang được cập nhật"
                                description="Nhân viên chưa đăng nhật ký phù hợp với thú cưng hoặc từ khóa đang chọn."
                            />
                        ) : (
                            <div className="grid gap-3 lg:grid-cols-2">
                                {visibleLogs.map((log) => {
                                    const isSelected = selectedLog?.id === log.id;

                                    return (
                                        <button
                                            key={log.id}
                                            type="button"
                                            onClick={() => selectLog(log.id)}
                                            className={cx(
                                                "rounded-2xl border p-4 text-left transition",
                                                isSelected
                                                    ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/15"
                                                    : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/50"
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-semibold text-slate-950">{log.title}</p>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {formatDateTime(log.createdAt)} · {log.shift}
                                                    </p>
                                                </div>
                                                <Tag tone={log.media.some((item) => item.type === "video") ? "blue" : "green"}>
                                                    {log.media.length} media
                                                </Tag>
                                            </div>
                                            <div className="mt-4 grid gap-2 text-sm text-slate-600">
                                                <LogPill icon={Utensils} text={log.mealStatus} />
                                                <LogPill icon={Droplets} text={log.hygieneStatus} />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </Card>

                    {selectedLog && activeMedia && (
                        <Card
                            title="Chi tiết nhật ký"
                            subtitle={`${formatDateTime(selectedLog.createdAt)} · Nhân viên ${selectedLog.caretaker}`}
                        >
                            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
                                <div className="space-y-3">
                                    <div className="relative overflow-hidden rounded-2xl bg-slate-100">
                                        <img
                                            src={activeMedia.url}
                                            alt={activeMedia.caption}
                                            className="h-72 w-full object-cover"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-slate-950/70 to-transparent p-4 text-white">
                                            <div className="flex items-end justify-between gap-3">
                                                <div>
                                                    <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
                                                        {activeMedia.type === "video" ? (
                                                            <Film className="h-3.5 w-3.5" />
                                                        ) : (
                                                            <Camera className="h-3.5 w-3.5" />
                                                        )}
                                                        {activeMedia.type === "video" ? "Video" : "Hình ảnh"}
                                                    </div>
                                                    <p className="font-semibold">{activeMedia.caption}</p>
                                                </div>
                                                {activeMedia.type === "video" && (
                                                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-emerald-700 shadow-lg">
                                                        <Play className="h-5 w-5 fill-current" />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <button
                                            type="button"
                                            onClick={showPreviousMedia}
                                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                                            aria-label="Xem media trước"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <div className="flex gap-2">
                                            {selectedLog.media.map((item, index) => (
                                                <button
                                                    key={`${item.url}-${index}`}
                                                    type="button"
                                                    onClick={() => setMediaIndex(index)}
                                                    className={cx(
                                                        "h-2.5 rounded-full transition",
                                                        index === mediaIndex
                                                            ? "w-8 bg-emerald-600"
                                                            : "w-2.5 bg-slate-300 hover:bg-slate-400"
                                                    )}
                                                    aria-label={`Chọn media ${index + 1}`}
                                                />
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={showNextMedia}
                                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                                            aria-label="Xem media tiếp theo"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <DetailTile icon={Utensils} label="Tình trạng ăn uống" value={selectedLog.mealStatus} />
                                    <DetailTile icon={Bath} label="Tình trạng vệ sinh" value={selectedLog.hygieneStatus} />
                                    <DetailTile icon={Sparkles} label="Tinh thần" value={selectedLog.moodStatus} />
                                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                                        <div className="flex items-center gap-2 font-semibold text-emerald-900">
                                            <PawPrint className="h-4 w-4" />
                                            Ghi chú của nhân viên
                                        </div>
                                        <p className="mt-3 text-sm leading-6 text-emerald-900">
                                            {selectedLog.staffNote}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

function QuickMetric({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Moon;
    label: string;
    value: string;
}) {
    return (
        <div className="min-w-24 rounded-xl bg-slate-50 px-3 py-2">
            <div className="flex items-center gap-2 text-slate-500">
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{label}</span>
            </div>
            <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
        </div>
    );
}

function LogPill({ icon: Icon, text }: { icon: typeof Clock3; text: string }) {
    return (
        <span className="inline-flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span className="line-clamp-2">{text}</span>
        </span>
    );
}

function DetailTile({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Icon className="h-4 w-4 text-emerald-600" />
                {label}
            </div>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">{value}</p>
        </div>
    );
}

function EmptyState({
    title,
    description,
    compact = false,
}: {
    title: string;
    description: string;
    compact?: boolean;
}) {
    return (
        <div
            className={cx(
                "flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center",
                compact ? "min-h-56 p-6" : "min-h-96 p-10"
            )}
        >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
                <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-slate-950">{title}</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
        </div>
    );
}
