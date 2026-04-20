import { Tag } from "~/components/atoms";

interface RequestSwapProps {
    who: string;
    from: string;
    to: string;
    status: string;
}

export function RequestSwap({ who, from, to, status }: RequestSwapProps) {
    return (
        <div className="rounded-3xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="font-semibold">{who}</p>
                    <p className="mt-1 text-sm text-slate-500">Từ: {from}</p>
                    <p className="mt-1 text-sm text-slate-500">Sang: {to}</p>
                </div>
                <Tag tone={status === "Đã duyệt" ? "green" : "amber"}>{status}</Tag>
            </div>
        </div>
    );
}
