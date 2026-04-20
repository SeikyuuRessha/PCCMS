import { cx } from "~/utils/cx";

const toneStyles: Record<string, string> = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-900",
    blue: "border-sky-200 bg-sky-50 text-sky-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    red: "border-rose-200 bg-rose-50 text-rose-900",
};

interface NoticeProps {
    title: string;
    text: string;
    tone?: "green" | "blue" | "amber" | "red";
}

export function Notice({ title, text, tone = "green" }: NoticeProps) {
    return (
        <div className={cx("rounded-3xl border p-4", toneStyles[tone])}>
            <p className="font-semibold">{title}</p>
            <p className="mt-1 text-sm opacity-90">{text}</p>
        </div>
    );
}
