import { Tag } from "~/components/atoms";
import { Card } from "~/components/molecules";

export function BoardingTrackingPage() {
    return (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card title="Nhật ký lưu trú">
                <div className="space-y-3">
                    {(
                        [
                            ["24/05 • Sáng", "Ăn tốt • Vệ sinh bình thường", "Đã cập nhật 2 ảnh"],
                            ["23/05 • Chiều", "Ngủ tốt • Đi dạo 15 phút", "Đã cập nhật 1 video"],
                            [
                                "23/05 • Sáng",
                                "Ăn hơi ít • Nhân viên theo dõi thêm",
                                "Có ghi chú đặc biệt",
                            ],
                        ] as const
                    ).map(([time, status, media]) => (
                        <div
                            key={time}
                            className="rounded-3xl border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h4 className="font-semibold">{time}</h4>
                                    <p className="mt-1 text-sm text-slate-500">{status}</p>
                                    <p className="mt-2 text-xs text-slate-500">{media}</p>
                                </div>
                                <Tag tone="blue">Nhật ký</Tag>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
            <Card title="Chi tiết nhật ký">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="h-36 rounded-3xl bg-linear-to-br from-amber-100 to-orange-50" />
                    <div className="h-36 rounded-3xl bg-linear-to-br from-sky-100 to-cyan-50" />
                    <div className="h-36 rounded-3xl bg-linear-to-br from-emerald-100 to-lime-50" />
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Tình trạng ăn uống</p>
                        <p className="mt-1 font-semibold">Ăn tốt</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Tình trạng vệ sinh</p>
                        <p className="mt-1 font-semibold">Bình thường</p>
                    </div>
                </div>
                <div className="mt-4 rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-900">
                    Ghi chú của nhân viên: Bé thân thiện, ăn hết khẩu phần buổi sáng, đã đi dạo 15
                    phút và chơi với đồ chơi quen thuộc.
                </div>
            </Card>
        </div>
    );
}
