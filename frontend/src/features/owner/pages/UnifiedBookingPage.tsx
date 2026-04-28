import { useMemo, useState } from "react";
import {
    AlertCircle,
    Building2,
    CheckCircle2,
    Clock3,
    HeartPulse,
    PawPrint,
    Scissors,
    Stethoscope,
} from "lucide-react";
import { Stepper } from "~/components/molecules/Stepper";
import { Button, Input, Select, Tag, Textarea } from "~/components/atoms";
import { Card, SummaryRow } from "~/components/molecules";
import { cx } from "~/utils/cx";

type BookingType = "clinic" | "grooming" | "boarding";

interface FormState {
    type: BookingType;
    pet: string;
    clinicDate: string;
    clinicSlot: string;
    doctor: string;
    symptoms: string;
    groomingService: string;
    groomingDate: string;
    groomingSlot: string;
    boardingStart: string;
    boardingEnd: string;
    room: string;
    note: string;
}

const todayIso = "2026-04-28";

const bookingSteps = [
    { label: "Nhu cầu" },
    { label: "Thông tin" },
    { label: "Xác nhận" },
];

const bookingTypes = [
    {
        id: "clinic",
        title: "Đặt lịch khám",
        description: "Chọn ngày, giờ khám, bác sĩ mong muốn và mô tả triệu chứng ban đầu.",
        icon: Stethoscope,
    },
    {
        id: "grooming",
        title: "Dịch vụ làm đẹp",
        description: "Đặt lịch tắm, sấy, cắt tỉa hoặc vệ sinh cho thú cưng.",
        icon: Scissors,
    },
    {
        id: "boarding",
        title: "Đặt phòng lưu trú",
        description: "Chọn ngày gửi, ngày đón và loại chuồng còn trống.",
        icon: Building2,
    },
] satisfies Array<{
    id: BookingType;
    title: string;
    description: string;
    icon: typeof Stethoscope;
}>;

const petOptions = [
    "Milu - Poodle, 3 tuổi",
    "Bơ - Corgi, 2 tuổi",
    "Mít - Mèo Anh lông ngắn, 4 tuổi",
];

const doctorOptions = [
    "Tự động xếp bác sĩ phù hợp",
    "BS. Trần Văn An - Nội tổng quát",
    "BS. Nguyễn Minh Hà - Da liễu",
    "BS. Lê Hoàng Nam - Cấp cứu",
];

const groomingServices = [
    { name: "Tắm + Sấy + Chải lông", duration: "60 phút", price: 180000 },
    { name: "Tắm + Sấy + Cắt tỉa", duration: "90 phút", price: 280000 },
    { name: "Vệ sinh tai, móng, tuyến hôi", duration: "45 phút", price: 150000 },
];

const clinicSlots = [
    { time: "08:30 - 09:00", available: true, staff: "2 bác sĩ trống" },
    { time: "09:00 - 09:30", available: true, staff: "1 phòng khám trống" },
    { time: "10:00 - 10:30", available: false, staff: "Kín lịch" },
    { time: "14:00 - 14:30", available: true, staff: "3 bác sĩ trống" },
    { time: "16:00 - 16:30", available: false, staff: "Kín lịch" },
];

const groomingSlots = [
    { time: "09:00 - 10:00", available: true, staff: "Còn 2 lượt" },
    { time: "10:30 - 11:30", available: false, staff: "Kín lịch dịch vụ" },
    { time: "14:00 - 15:00", available: true, staff: "Còn 1 lượt" },
    { time: "15:30 - 16:30", available: true, staff: "Còn 3 lượt" },
];

const roomOptions = [
    {
        name: "Chuồng tiêu chuẩn",
        capacity: "1 thú cưng",
        features: "Có quạt, vệ sinh 2 lần/ngày",
        pricePerDay: 180000,
        available: true,
    },
    {
        name: "Chuồng VIP có camera",
        capacity: "1 thú cưng",
        features: "Camera theo dõi, đệm riêng, cập nhật ảnh hằng ngày",
        pricePerDay: 320000,
        available: true,
    },
    {
        name: "Khu cách ly y tế",
        capacity: "1 thú cưng",
        features: "Theo dõi riêng cho thú cưng cần chăm sóc đặc biệt",
        pricePerDay: 260000,
        available: false,
    },
];

const initialForm: FormState = {
    type: "clinic",
    pet: "",
    clinicDate: "2026-05-22",
    clinicSlot: "",
    doctor: "Tự động xếp bác sĩ phù hợp",
    symptoms: "",
    groomingService: groomingServices[0].name,
    groomingDate: "2026-05-24",
    groomingSlot: "",
    boardingStart: "2026-05-20",
    boardingEnd: "2026-05-23",
    room: "",
    note: "",
};

function formatCurrency(value: number) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value);
}

function formatDate(value: string) {
    if (!value) return "---";
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
}

function diffDays(start: string, end: string) {
    if (!start || !end) return 0;
    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T00:00:00`);
    const diff = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000);
    return Math.max(diff, 1);
}

export function UnifiedBookingPage() {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<FormState>(initialForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);

    const selectedType = bookingTypes.find((item) => item.id === form.type) ?? bookingTypes[0];
    const selectedGroomingService = groomingServices.find((item) => item.name === form.groomingService);
    const selectedRoom = roomOptions.find((item) => item.name === form.room);
    const activeSlots = form.type === "clinic" ? clinicSlots : groomingSlots;

    const stayDays = useMemo(
        () => diffDays(form.boardingStart, form.boardingEnd),
        [form.boardingEnd, form.boardingStart]
    );

    const estimatedTotal = useMemo(() => {
        if (form.type === "clinic") return 180000;
        if (form.type === "grooming") return selectedGroomingService?.price ?? 0;
        return (selectedRoom?.pricePerDay ?? 0) * stayDays;
    }, [form.type, selectedGroomingService?.price, selectedRoom?.pricePerDay, stayDays]);

    const updateForm = (field: keyof FormState, value: string) => {
        setSubmitted(false);
        setErrors((current) => ({ ...current, [field]: "" }));
        setForm((current) => ({ ...current, [field]: value }));
    };

    const validateCurrentStep = (targetStep = step) => {
        const nextErrors: Record<string, string> = {};

        if (targetStep >= 0 && !form.pet) {
            nextErrors.pet = "Vui lòng chọn thú cưng cần sử dụng dịch vụ.";
        }

        if (targetStep >= 1) {
            if (form.type === "clinic") {
                if (!form.clinicDate) nextErrors.clinicDate = "Vui lòng chọn ngày khám.";
                if (form.clinicDate && form.clinicDate < todayIso) {
                    nextErrors.clinicDate = "Thời gian hẹn không hợp lệ vì thuộc về quá khứ.";
                }
                if (!form.clinicSlot) nextErrors.clinicSlot = "Vui lòng chọn khung giờ khám còn trống.";
                if (!form.symptoms.trim()) {
                    nextErrors.symptoms = "Vui lòng nhập triệu chứng ban đầu để bác sĩ chuẩn bị.";
                }
                if (form.symptoms.length > 500) {
                    nextErrors.symptoms = "Triệu chứng ban đầu tối đa 500 ký tự.";
                }
            }

            if (form.type === "grooming") {
                if (!form.groomingService) nextErrors.groomingService = "Vui lòng chọn dịch vụ làm đẹp.";
                if (!form.groomingDate) nextErrors.groomingDate = "Vui lòng chọn ngày sử dụng dịch vụ.";
                if (form.groomingDate && form.groomingDate < todayIso) {
                    nextErrors.groomingDate = "Thời gian đăng ký không hợp lệ.";
                }
                if (!form.groomingSlot) nextErrors.groomingSlot = "Vui lòng chọn khung giờ còn chỗ.";
            }

            if (form.type === "boarding") {
                if (!form.boardingStart) nextErrors.boardingStart = "Vui lòng chọn ngày gửi.";
                if (!form.boardingEnd) nextErrors.boardingEnd = "Vui lòng chọn ngày đón.";
                if (form.boardingStart && form.boardingStart < todayIso) {
                    nextErrors.boardingStart = "Ngày gửi không được thuộc về quá khứ.";
                }
                if (form.boardingStart && form.boardingEnd && form.boardingEnd < form.boardingStart) {
                    nextErrors.boardingEnd = "Ngày đón phải lớn hơn hoặc bằng ngày gửi.";
                }
                if (!form.room) nextErrors.room = "Vui lòng chọn loại chuồng còn trống.";
            }

            if (form.note.length > 500) {
                nextErrors.note = "Ghi chú tối đa 500 ký tự.";
            }
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const nextStep = () => {
        if (!validateCurrentStep(step)) return;
        setStep((current) => Math.min(current + 1, 2));
    };

    const prevStep = () => {
        setStep((current) => Math.max(current - 1, 0));
    };

    const submitBooking = () => {
        if (!validateCurrentStep(2)) return;
        setSubmitted(true);
    };

    const serviceDate =
        form.type === "boarding"
            ? `${formatDate(form.boardingStart)} - ${formatDate(form.boardingEnd)}`
            : formatDate(form.type === "clinic" ? form.clinicDate : form.groomingDate);

    const serviceTime =
        form.type === "clinic"
            ? form.clinicSlot || "---"
            : form.type === "grooming"
              ? form.groomingSlot || "---"
              : `${stayDays} ngày lưu trú`;

    const primaryDetail =
        form.type === "clinic"
            ? form.doctor
            : form.type === "grooming"
              ? form.groomingService
              : form.room || "Chưa chọn loại chuồng";

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-950">Đặt lịch hẹn</h1>
                    <p className="mt-1 max-w-3xl text-sm text-slate-500">
                        Tạo yêu cầu khám, làm đẹp hoặc lưu trú cho thú cưng. Phiếu sau khi gửi sẽ ở trạng thái
                        Chờ tiếp nhận.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="space-y-5">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <Stepper steps={bookingSteps} currentStep={step} />
                    </div>

                    <Card className="min-h-100">
                        {step === 0 && (
                            <div className="space-y-6">
                                <SectionHeader
                                    icon={PawPrint}
                                    title="Chọn nhu cầu và thú cưng"
                                    description="Theo đặc tả, chủ nuôi phải đăng nhập và có ít nhất một hồ sơ thú cưng trước khi đặt lịch."
                                />

                                <div className="grid gap-3 lg:grid-cols-3">
                                    {bookingTypes.map((item) => {
                                        const Icon = item.icon;
                                        const isSelected = form.type === item.id;

                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => {
                                                    updateForm("type", item.id);
                                                    updateForm("clinicSlot", "");
                                                    updateForm("groomingSlot", "");
                                                    updateForm("room", "");
                                                }}
                                                className={cx(
                                                    "rounded-2xl border p-4 text-left transition hover:border-primary-300 hover:bg-primary-50",
                                                    isSelected
                                                        ? "border-primary-500 bg-primary-50 ring-2 ring-primary-500/15"
                                                        : "border-slate-200 bg-white"
                                                )}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <span
                                                        className={cx(
                                                            "rounded-xl p-2",
                                                            isSelected
                                                                ? "bg-primary-600 text-white"
                                                                : "bg-slate-100 text-slate-600"
                                                        )}
                                                    >
                                                        <Icon className="h-5 w-5" />
                                                    </span>
                                                </div>
                                                <h2 className="mt-4 text-base font-semibold text-slate-950">
                                                    {item.title}
                                                </h2>
                                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                                    {item.description}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>

                                <Select
                                    label="Thú cưng"
                                    value={form.pet}
                                    onChange={(event) => updateForm("pet", event.target.value)}
                                    options={["Chọn thú cưng...", ...petOptions]}
                                    error={errors.pet}
                                    required
                                />
                            </div>
                        )}

                        {step === 1 && (
                            <div className="space-y-6">
                                <SectionHeader
                                    icon={selectedType.icon}
                                    title={selectedType.title}
                                    description="Nhập các trường bắt buộc theo đặc tả. Các khung giờ hoặc loại chuồng hết chỗ đã bị khóa."
                                />

                                {form.type === "clinic" && (
                                    <div className="space-y-5">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <Input
                                                label="Ngày khám"
                                                type="date"
                                                min={todayIso}
                                                value={form.clinicDate}
                                                onChange={(event) => updateForm("clinicDate", event.target.value)}
                                                error={errors.clinicDate}
                                                required
                                            />
                                            <Select
                                                label="Bác sĩ thú y"
                                                value={form.doctor}
                                                onChange={(event) => updateForm("doctor", event.target.value)}
                                                options={doctorOptions}
                                                helperText="Có thể để hệ thống tự động xếp bác sĩ phù hợp."
                                            />
                                        </div>

                                        <SlotPicker
                                            label="Giờ khám"
                                            slots={activeSlots}
                                            value={form.clinicSlot}
                                            onChange={(value) => updateForm("clinicSlot", value)}
                                            error={errors.clinicSlot}
                                        />

                                        <Textarea
                                            label="Triệu chứng ban đầu"
                                            value={form.symptoms}
                                            onChange={(event) => updateForm("symptoms", event.target.value)}
                                            placeholder="Ví dụ: Bỏ ăn 2 ngày nay, nôn mửa, lờ đờ..."
                                            rows={4}
                                            error={errors.symptoms}
                                            required
                                        />
                                    </div>
                                )}

                                {form.type === "grooming" && (
                                    <div className="space-y-5">
                                        <Select
                                            label="Dịch vụ làm đẹp"
                                            value={form.groomingService}
                                            onChange={(event) => updateForm("groomingService", event.target.value)}
                                            options={groomingServices.map((item) => item.name)}
                                            error={errors.groomingService}
                                            required
                                        />

                                        <div className="grid gap-3 md:grid-cols-3">
                                            {groomingServices.map((item) => (
                                                <div
                                                    key={item.name}
                                                    className={cx(
                                                        "rounded-2xl border p-4",
                                                        item.name === form.groomingService
                                                            ? "border-primary-300 bg-primary-50"
                                                            : "border-slate-200 bg-white"
                                                    )}
                                                >
                                                    <p className="font-semibold text-slate-900">{item.name}</p>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        Thời lượng dự kiến: {item.duration}
                                                    </p>
                                                    <p className="mt-3 text-sm font-semibold text-primary-700">
                                                        {formatCurrency(item.price)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        <Input
                                            label="Ngày sử dụng dịch vụ"
                                            type="date"
                                            min={todayIso}
                                            value={form.groomingDate}
                                            onChange={(event) => updateForm("groomingDate", event.target.value)}
                                            error={errors.groomingDate}
                                            required
                                        />

                                        <SlotPicker
                                            label="Giờ sử dụng dịch vụ"
                                            slots={activeSlots}
                                            value={form.groomingSlot}
                                            onChange={(value) => updateForm("groomingSlot", value)}
                                            error={errors.groomingSlot}
                                        />
                                    </div>
                                )}

                                {form.type === "boarding" && (
                                    <div className="space-y-5">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <Input
                                                label="Ngày gửi"
                                                type="date"
                                                min={todayIso}
                                                value={form.boardingStart}
                                                onChange={(event) => updateForm("boardingStart", event.target.value)}
                                                error={errors.boardingStart}
                                                required
                                            />
                                            <Input
                                                label="Ngày đón"
                                                type="date"
                                                min={form.boardingStart || todayIso}
                                                value={form.boardingEnd}
                                                onChange={(event) => updateForm("boardingEnd", event.target.value)}
                                                error={errors.boardingEnd}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-caption font-medium text-slate-700">
                                                    Loại chuồng còn trống <span className="text-error-500">*</span>
                                                </p>
                                                <span className="text-xs text-slate-500">
                                                    Dự kiến {stayDays} ngày
                                                </span>
                                            </div>
                                            <div className="grid gap-3 md:grid-cols-3">
                                                {roomOptions.map((room) => {
                                                    const isSelected = form.room === room.name;

                                                    return (
                                                        <button
                                                            key={room.name}
                                                            type="button"
                                                            disabled={!room.available}
                                                            onClick={() => updateForm("room", room.name)}
                                                            className={cx(
                                                                "rounded-2xl border p-4 text-left transition",
                                                                room.available &&
                                                                    "hover:border-primary-300 hover:bg-primary-50",
                                                                isSelected
                                                                    ? "border-primary-500 bg-primary-50 ring-2 ring-primary-500/15"
                                                                    : "border-slate-200 bg-white",
                                                                !room.available && "cursor-not-allowed bg-slate-50 opacity-70"
                                                            )}
                                                        >
                                                            <div className="flex items-start justify-between gap-3">
                                                                <p className="font-semibold text-slate-900">
                                                                    {room.name}
                                                                </p>
                                                                <Tag tone={room.available ? "green" : "red"}>
                                                                    {room.available ? "Còn trống" : "Hết chỗ"}
                                                                </Tag>
                                                            </div>
                                                            <p className="mt-2 text-sm text-slate-500">
                                                                {room.capacity}
                                                            </p>
                                                            <p className="mt-1 min-h-10 text-sm text-slate-500">
                                                                {room.features}
                                                            </p>
                                                            <p className="mt-3 text-sm font-semibold text-primary-700">
                                                                {formatCurrency(room.pricePerDay)}/ngày
                                                            </p>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {errors.room && (
                                                <p className="text-[12px] font-medium text-error-600">{errors.room}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <Textarea
                                    label={form.type === "boarding" ? "Ghi chú lưu trú" : "Ghi chú thêm"}
                                    value={form.note}
                                    onChange={(event) => updateForm("note", event.target.value)}
                                    placeholder={
                                        form.type === "boarding"
                                            ? "Ví dụ: Bé sợ tiếng ồn, ăn hạt lúc 7h sáng và 6h tối..."
                                            : "Yêu cầu đặc biệt, dị ứng, tính cách cần lưu ý..."
                                    }
                                    rows={3}
                                    error={errors.note}
                                />
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <SectionHeader
                                    icon={CheckCircle2}
                                    title="Xác nhận thông tin"
                                    description="Kiểm tra lại trước khi gửi. Hệ thống mock sẽ tạo phiếu ở trạng thái Chờ tiếp nhận."
                                />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <ReviewItem label="Yêu cầu" value={`${selectedType.title}`} />
                                    <ReviewItem label="Thú cưng" value={form.pet || "---"} />
                                    <ReviewItem label="Ngày sử dụng" value={serviceDate} />
                                    <ReviewItem label="Thời gian" value={serviceTime} />
                                    <ReviewItem label="Chi tiết dịch vụ" value={primaryDetail} />
                                    <ReviewItem label="Chi phí dự kiến" value={formatCurrency(estimatedTotal)} />
                                </div>

                                {form.type === "clinic" && (
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <p className="text-sm font-semibold text-slate-900">Triệu chứng ban đầu</p>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">{form.symptoms || "---"}</p>
                                    </div>
                                )}

                                <div className="rounded-2xl border border-warning-500/20 bg-warning-50 p-4">
                                    <div className="flex gap-3">
                                        <AlertCircle className="mt-0.5 h-5 w-5 flex-none text-warning-600" />
                                        <div>
                                            <p className="text-sm font-semibold text-warning-600">
                                                Trạng thái sau khi gửi
                                            </p>
                                            <p className="mt-1 text-sm leading-6 text-slate-600">
                                                Phiếu được tạo với trạng thái Chờ tiếp nhận để Nhân viên hoặc Lễ tân
                                                kiểm tra và xác nhận.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {submitted && (
                                    <div className="rounded-2xl border border-success-500/20 bg-success-50 p-4">
                                        <div className="flex gap-3">
                                            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-success-600" />
                                            <div>
                                                <p className="text-sm font-semibold text-success-600">
                                                    {form.type === "boarding"
                                                        ? "Đặt phòng lưu trú thành công"
                                                        : form.type === "grooming"
                                                          ? "Đăng ký dịch vụ làm đẹp thành công"
                                                          : "Đặt lịch khám thành công"}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-600">
                                                    Mã phiếu mock: BK-2026-052. Trạng thái: Chờ tiếp nhận.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <Button variant="outline" onClick={prevStep} disabled={step === 0}>
                            Quay lại
                        </Button>
                        {step < 2 ? (
                            <Button variant="primary" onClick={nextStep}>
                                Tiếp tục
                            </Button>
                        ) : (
                            <Button variant="primary" onClick={submitBooking}>
                                Xác nhận đặt lịch
                            </Button>
                        )}
                    </div>
                </div>

                <aside className="space-y-4 xl:sticky xl:top-24 xl:h-fit">
                    <Card title="Tóm tắt phiếu hẹn">
                        <div className="space-y-3 text-sm">
                            <SummaryRow label="Loại yêu cầu" value={selectedType.title} />
                            <SummaryRow label="Thú cưng" value={form.pet || "Chưa chọn"} />
                            <SummaryRow label="Ngày" value={serviceDate} />
                            <SummaryRow label="Khung giờ" value={serviceTime} />
                            <SummaryRow label="Chi tiết" value={primaryDetail} />
                            <div className="h-px bg-slate-200" />
                            <SummaryRow
                                label="Trạng thái"
                                value={<Tag tone="amber">Chờ tiếp nhận</Tag>}
                            />
                            <SummaryRow label="Tạm tính" value={formatCurrency(estimatedTotal)} />
                        </div>
                    </Card>
                </aside>
            </div>
        </div>
    );
}

function SectionHeader({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof PawPrint;
    title: string;
    description: string;
}) {
    return (
        <div className="flex gap-3">
            <div className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
            </div>
        </div>
    );
}

function SlotPicker({
    label,
    slots,
    value,
    onChange,
    error,
}: {
    label: string;
    slots: Array<{ time: string; available: boolean; staff: string }>;
    value: string;
    onChange: (value: string) => void;
    error?: string;
}) {
    return (
        <div className="space-y-2">
            <p className="text-caption font-medium text-slate-700">
                {label} <span className="text-error-500">*</span>
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {slots.map((slot) => {
                    const isSelected = value === slot.time;

                    return (
                        <button
                            key={slot.time}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => onChange(slot.time)}
                            className={cx(
                                "min-h-20 rounded-2xl border p-3 text-left transition",
                                slot.available && "hover:border-primary-300 hover:bg-primary-50",
                                isSelected
                                    ? "border-primary-500 bg-primary-50 ring-2 ring-primary-500/15"
                                    : "border-slate-200 bg-white",
                                !slot.available && "cursor-not-allowed bg-slate-50 opacity-70"
                            )}
                        >
                            <div className="flex items-center gap-2 font-semibold text-slate-900">
                                <Clock3 className="h-4 w-4 text-primary-600" />
                                {slot.time}
                            </div>
                            <p className="mt-2 text-sm text-slate-500">{slot.staff}</p>
                        </button>
                    );
                })}
            </div>
            {error && <p className="text-[12px] font-medium text-error-600">{error}</p>}
        </div>
    );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{value}</p>
        </div>
    );
}