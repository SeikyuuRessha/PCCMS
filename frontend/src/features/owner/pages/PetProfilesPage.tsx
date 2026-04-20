import { Plus } from "lucide-react";
import { Button, Input, Select, Tag, Textarea } from "~/components/atoms";
import { Card } from "~/components/molecules";

export function PetProfilesPage() {
    const pets = [
        { name: "Milu", type: "Chó • Poodle", weight: "4.5 kg", status: "Đang lưu trú" },
        { name: "Mít", type: "Mèo • Anh lông ngắn", weight: "3.8 kg", status: "Bình thường" },
        { name: "Bơ", type: "Chó • Corgi", weight: "9.2 kg", status: "Chờ tiêm" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Hồ sơ thú cưng</h2>
                    <p className="text-sm text-slate-500">
                        Quản lý thông tin và theo dõi sức khỏe thú cưng của bạn
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Bộ lọc</Button>
                    <Button>
                        <span className="inline-flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Thêm thú cưng
                        </span>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                {pets.map((pet) => (
                    <Card key={pet.name} className="overflow-hidden p-0">
                        <div className="h-36 bg-linear-to-br from-amber-100 via-emerald-50 to-sky-100" />
                        <div className="p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-semibold">{pet.name}</h3>
                                    <p className="text-sm text-slate-500">{pet.type}</p>
                                </div>
                                <Tag
                                    tone={
                                        pet.status === "Đang lưu trú"
                                            ? "blue"
                                            : pet.status === "Chờ tiêm"
                                              ? "amber"
                                              : "green"
                                    }
                                >
                                    {pet.status}
                                </Tag>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                <div className="rounded-2xl bg-slate-50 p-3">
                                    <p className="text-slate-500">Cân nặng</p>
                                    <p className="mt-1 font-medium">{pet.weight}</p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-3">
                                    <p className="text-slate-500">Lần khám gần nhất</p>
                                    <p className="mt-1 font-medium">20/05/2026</p>
                                </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Button variant="outline" className="flex-1">
                                    Xem chi tiết
                                </Button>
                                <Button variant="ghost" className="flex-1">
                                    Chỉnh sửa
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Card title="Thêm thú cưng mới">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Input label="Tên thú cưng" placeholder="Milu" />
                    <Select label="Loài" options={["Chó", "Mèo", "Thỏ", "Chim"]} />
                    <Input label="Giống" placeholder="Poodle" />
                    <Input label="Ngày sinh" type="date" />
                    <Input label="Cân nặng (kg)" placeholder="4.5" />
                    <Select label="Giới tính" options={["Đực", "Cái"]} />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr]">
                    <Textarea
                        label="Ghi chú đặc biệt"
                        placeholder="Dị ứng, thói quen, tiền sử bệnh..."
                    />
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5">
                        <p className="font-medium">Ảnh đại diện</p>
                        <p className="mt-2 text-sm text-slate-500">
                            Kéo thả ảnh vào đây hoặc chọn file (tối đa 5MB).
                        </p>
                        <div className="mt-4 flex gap-2">
                            <Button variant="outline">Chọn ảnh</Button>
                            <Button variant="ghost">Xem trước</Button>
                        </div>
                    </div>
                </div>
                <div className="mt-5 flex gap-2">
                    <Button>Lưu thú cưng</Button>
                    <Button variant="outline">Hủy</Button>
                </div>
            </Card>
        </div>
    );
}
