import { useMemo, useState } from "react";
import {
    ArrowDownUp,
    Ban,
    CheckCircle2,
    Clock3,
    CreditCard,
    Download,
    Eye,
    FileText,
    Pill,
    ReceiptText,
    Search,
    Sparkles,
    Stethoscope,
    WalletCards,
} from "lucide-react";
import { Button, Input, Select, Tag } from "~/components/atoms";
import { Card, MiniGridStats, SummaryRow } from "~/components/molecules";
import { cx } from "~/utils/cx";

type PaymentStatus = "PAID" | "CANCELED";
type ServiceType = "Khám bệnh" | "Spa" | "Lưu trú";

interface PaymentInvoice {
    id: string;
    date: string;
    petName: string;
    serviceType: ServiceType;
    serviceName: string;
    status: PaymentStatus;
    method: string;
    staff: string;
    note: string;
    serviceFee: number;
    medicineFee: number;
    extraFee: number;
    discount: number;
}

const invoices: PaymentInvoice[] = [
    {
        id: "HD-2026-049",
        date: "2026-05-24T10:35:00",
        petName: "Milu",
        serviceType: "Lưu trú",
        serviceName: "Chuồng VIP có camera - 4 ngày",
        status: "PAID",
        method: "Ví điện tử",
        staff: "Ngọc Anh",
        note: "Đã bao gồm phí vệ sinh chuồng cuối kỳ.",
        serviceFee: 1280000,
        medicineFee: 0,
        extraFee: 120000,
        discount: 140000,
    },
    {
        id: "HD-2026-043",
        date: "2026-05-20T15:20:00",
        petName: "Bơ",
        serviceType: "Khám bệnh",
        serviceName: "Khám tổng quát và xét nghiệm da",
        status: "PAID",
        method: "Thẻ ngân hàng",
        staff: "BS. Nguyễn Minh Hà",
        note: "Tái khám sau 7 ngày nếu còn ngứa hoặc rụng lông.",
        serviceFee: 350000,
        medicineFee: 245000,
        extraFee: 80000,
        discount: 0,
    },
    {
        id: "HD-2026-038",
        date: "2026-05-14T09:05:00",
        petName: "Mít",
        serviceType: "Spa",
        serviceName: "Tắm sấy và vệ sinh tai móng",
        status: "PAID",
        method: "Tiền mặt",
        staff: "Minh Quân",
        note: "Mít hợp tác tốt, nên đặt lịch lại sau 3 tuần.",
        serviceFee: 280000,
        medicineFee: 0,
        extraFee: 40000,
        discount: 20000,
    },
    {
        id: "HD-2026-031",
        date: "2026-05-08T18:10:00",
        petName: "Milu",
        serviceType: "Khám bệnh",
        serviceName: "Khám tiêu hóa và kê đơn",
        status: "PAID",
        method: "Chuyển khoản",
        staff: "BS. Trần Văn An",
        note: "Theo dõi ăn uống trong 48 giờ sau khi dùng thuốc.",
        serviceFee: 220000,
        medicineFee: 185000,
        extraFee: 0,
        discount: 0,
    },
    {
        id: "HD-2026-026",
        date: "2026-05-01T11:45:00",
        petName: "Bơ",
        serviceType: "Spa",
        serviceName: "Cắt tỉa lông tạo kiểu",
        status: "CANCELED",
        method: "Chưa thanh toán",
        staff: "Lễ tân",
        note: "Chủ nuôi hủy lịch trước giờ hẹn, không phát sinh phí.",
        serviceFee: 320000,
        medicineFee: 0,
        extraFee: 0,
        discount: 320000,
    },
];

const statusMeta: Record<PaymentStatus, { label: string; tone: "green" | "red" }> = {
    PAID: { label: "Đã thanh toán", tone: "green" },
    CANCELED: { label: "Đã hủy", tone: "red" },
};

const serviceIcons: Record<ServiceType, typeof Stethoscope> = {
    "Khám bệnh": Stethoscope,
    Spa: Sparkles,
    "Lưu trú": WalletCards,
};

function formatCurrency(value: number) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value);
}

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function getInvoiceTotal(invoice: PaymentInvoice) {
    return invoice.serviceFee + invoice.medicineFee + invoice.extraFee - invoice.discount;
}

export function PaymentsPage() {
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("Tất cả trạng thái");
    const [serviceFilter, setServiceFilter] = useState("Tất cả dịch vụ");
    const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoices[0]?.id ?? "");

    const sortedInvoices = useMemo(
        () => [...invoices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        []
    );

    const filteredInvoices = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return sortedInvoices.filter((invoice) => {
            const matchesQuery = normalizedQuery
                ? [
                      invoice.id,
                      invoice.petName,
                      invoice.serviceType,
                      invoice.serviceName,
                      invoice.method,
                      invoice.staff,
                  ]
                      .join(" ")
                      .toLowerCase()
                      .includes(normalizedQuery)
                : true;

            const matchesStatus =
                statusFilter === "Tất cả trạng thái" ||
                statusMeta[invoice.status].label === statusFilter;
            const matchesService =
                serviceFilter === "Tất cả dịch vụ" || invoice.serviceType === serviceFilter;

            return matchesQuery && matchesStatus && matchesService;
        });
    }, [query, serviceFilter, sortedInvoices, statusFilter]);

    const selectedInvoice =
        filteredInvoices.find((invoice) => invoice.id === selectedInvoiceId) ??
        filteredInvoices[0] ??
        null;

    const paidInvoices = invoices.filter((invoice) => invoice.status === "PAID");
    const paidTotal = paidInvoices.reduce((total, invoice) => total + getInvoiceTotal(invoice), 0);
    const latestPaidInvoice = paidInvoices
        .slice()
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-950">Lịch sử thanh toán</h1>
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                        Tra cứu hóa đơn khám bệnh, spa và lưu trú của thú cưng. Dữ liệu đang dùng mock data theo UC009.
                    </p>
                </div>
                <Button variant="outline" className="inline-flex items-center justify-center gap-2">
                    <Download className="h-4 w-4" />
                    Xuất lịch sử
                </Button>
            </div>

            <MiniGridStats
                items={[
                    {
                        label: "Đã thanh toán",
                        value: paidInvoices.length.toString(),
                        hint: "Hóa đơn hoàn tất",
                        icon: CheckCircle2,
                    },
                    {
                        label: "Đã hủy",
                        value: invoices.filter((invoice) => invoice.status === "CANCELED").length.toString(),
                        hint: "Không phát sinh thu",
                        icon: Ban,
                    },
                    {
                        label: "Tổng chi tiêu",
                        value: formatCurrency(paidTotal),
                        hint: "Khám + spa + lưu trú",
                        icon: CreditCard,
                    },
                    {
                        label: "Gần nhất",
                        value: latestPaidInvoice?.id ?? "---",
                        hint: latestPaidInvoice ? formatDateTime(latestPaidInvoice.date) : "Chưa có giao dịch",
                        icon: Clock3,
                    },
                ]}
            />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="space-y-4">
                    <Card title="Hóa đơn của tôi" subtitle="Danh sách được sắp xếp theo giao dịch mới nhất.">
                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_190px_170px]">
                            <div className="relative">
                                <Input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Tìm mã hóa đơn, thú cưng, dịch vụ..."
                                    className="pl-9"
                                />
                                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            </div>
                            <Select
                                value={serviceFilter}
                                onChange={(event) => setServiceFilter(event.target.value)}
                                options={["Tất cả dịch vụ", "Khám bệnh", "Spa", "Lưu trú"]}
                            />
                            <Select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                options={["Tất cả trạng thái", "Đã thanh toán", "Đã hủy"]}
                            />
                        </div>

                        <div className="mt-4 hidden overflow-hidden rounded-3xl border border-slate-200 lg:block">
                            <div className="grid grid-cols-[1.1fr_1fr_1.25fr_0.9fr_0.9fr_112px] bg-slate-50 px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                                <span>Mã hóa đơn</span>
                                <span>Ngày giao dịch</span>
                                <span>Tên dịch vụ</span>
                                <span>Tổng tiền</span>
                                <span>Trạng thái</span>
                                <span className="text-right">Chi tiết</span>
                            </div>
                            {filteredInvoices.length === 0 ? (
                                <PaymentEmptyState />
                            ) : (
                                <div className="divide-y divide-slate-200 bg-white">
                                    {filteredInvoices.map((invoice) => (
                                        <InvoiceRow
                                            key={invoice.id}
                                            invoice={invoice}
                                            selected={invoice.id === selectedInvoice?.id}
                                            onSelect={() => setSelectedInvoiceId(invoice.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-4 space-y-3 lg:hidden">
                            {filteredInvoices.length === 0 ? (
                                <PaymentEmptyState />
                            ) : (
                                filteredInvoices.map((invoice) => (
                                    <InvoiceCard
                                        key={invoice.id}
                                        invoice={invoice}
                                        selected={invoice.id === selectedInvoice?.id}
                                        onSelect={() => setSelectedInvoiceId(invoice.id)}
                                    />
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                <aside className="xl:sticky xl:top-24 xl:h-fit">
                    {selectedInvoice ? (
                        <InvoiceDetail invoice={selectedInvoice} />
                    ) : (
                        <Card title="Chi tiết hóa đơn">
                            <PaymentEmptyState />
                        </Card>
                    )}
                </aside>
            </div>
        </div>
    );
}

function InvoiceRow({
    invoice,
    selected,
    onSelect,
}: {
    invoice: PaymentInvoice;
    selected: boolean;
    onSelect: () => void;
}) {
    const Icon = serviceIcons[invoice.serviceType];

    return (
        <button
            type="button"
            onClick={onSelect}
            className={cx(
                "grid w-full grid-cols-[1.1fr_1fr_1.25fr_0.9fr_0.9fr_112px] items-center px-4 py-4 text-left text-sm transition",
                selected ? "bg-emerald-50" : "hover:bg-slate-50"
            )}
        >
            <span className="font-semibold text-slate-950">{invoice.id}</span>
            <span className="text-slate-600">{formatDateTime(invoice.date)}</span>
            <span className="flex min-w-0 items-center gap-2 text-slate-700">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-slate-100 text-emerald-700">
                    <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                    <span className="block truncate font-medium text-slate-900">{invoice.serviceName}</span>
                    <span className="block text-xs text-slate-500">{invoice.petName} · {invoice.serviceType}</span>
                </span>
            </span>
            <span className="font-semibold text-slate-950">{formatCurrency(getInvoiceTotal(invoice))}</span>
            <span>
                <Tag tone={statusMeta[invoice.status].tone}>{statusMeta[invoice.status].label}</Tag>
            </span>
            <span className="inline-flex justify-end">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                    <Eye className="h-3.5 w-3.5" />
                    Xem
                </span>
            </span>
        </button>
    );
}

function InvoiceCard({
    invoice,
    selected,
    onSelect,
}: {
    invoice: PaymentInvoice;
    selected: boolean;
    onSelect: () => void;
}) {
    const Icon = serviceIcons[invoice.serviceType];

    return (
        <button
            type="button"
            onClick={onSelect}
            className={cx(
                "w-full rounded-2xl border p-4 text-left transition",
                selected
                    ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/15"
                    : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/50"
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                    <span className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-slate-100 text-emerald-700">
                        <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                        <p className="font-semibold text-slate-950">{invoice.id}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{invoice.serviceName}</p>
                    </div>
                </div>
                <Tag tone={statusMeta[invoice.status].tone}>{statusMeta[invoice.status].label}</Tag>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <SummaryRow label="Ngày" value={formatDateTime(invoice.date)} />
                <SummaryRow label="Tổng tiền" value={formatCurrency(getInvoiceTotal(invoice))} />
            </div>
        </button>
    );
}

function InvoiceDetail({ invoice }: { invoice: PaymentInvoice }) {
    const total = getInvoiceTotal(invoice);

    return (
        <Card
            title="Chi tiết hóa đơn"
            subtitle={invoice.id}
            right={<Tag tone={statusMeta[invoice.status].tone}>{statusMeta[invoice.status].label}</Tag>}
        >
            <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                        <ReceiptText className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="font-semibold leading-6 text-slate-950">{invoice.serviceName}</p>
                        <p className="mt-1 text-sm text-slate-500">
                            {invoice.petName} · {invoice.serviceType} · {formatDateTime(invoice.date)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-4 space-y-3 text-sm">
                <SummaryRow label="Phương thức" value={invoice.method} />
                <SummaryRow label="Người phụ trách" value={invoice.staff} />
            </div>

            <div className="mt-5 space-y-3 rounded-2xl border border-slate-200 p-4">
                <FeeLine icon={FileText} label="Phí dịch vụ" value={invoice.serviceFee} />
                <FeeLine icon={Pill} label="Tiền thuốc" value={invoice.medicineFee} />
                <FeeLine icon={ArrowDownUp} label="Chi phí phát sinh" value={invoice.extraFee} />
                {invoice.discount > 0 && (
                    <div className="flex items-center justify-between gap-3 text-sm text-emerald-700">
                        <span>Giảm trừ</span>
                        <span className="font-semibold">-{formatCurrency(invoice.discount)}</span>
                    </div>
                )}
                <div className="h-px bg-slate-200" />
                <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-slate-950">Tổng cộng</span>
                    <span className="text-xl font-semibold text-slate-950">{formatCurrency(total)}</span>
                </div>
            </div>

            <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                <span className="font-semibold">Ghi chú: </span>
                {invoice.note}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <Button variant="primary" className="inline-flex items-center justify-center gap-2">
                    <Download className="h-4 w-4" />
                    Tải hóa đơn
                </Button>
                <Button variant="outline" className="inline-flex items-center justify-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Đối chiếu
                </Button>
            </div>
        </Card>
    );
}

function FeeLine({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof FileText;
    label: string;
    value: number;
}) {
    return (
        <div className="flex items-center justify-between gap-3 text-sm">
            <span className="inline-flex items-center gap-2 text-slate-600">
                <Icon className="h-4 w-4 text-emerald-600" />
                {label}
            </span>
            <span className="font-semibold text-slate-950">{formatCurrency(value)}</span>
        </div>
    );
}

function PaymentEmptyState() {
    return (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
                <ReceiptText className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-slate-950">
                Bạn chưa có giao dịch nào tại hệ thống
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Thử đổi bộ lọc hoặc tìm kiếm bằng mã hóa đơn, tên thú cưng, dịch vụ.
            </p>
        </div>
    );
}
