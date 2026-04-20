import { cx } from "~/utils/cx";

interface TimeSlotProps {
    text: string;
    available?: boolean;
}

export function TimeSlot({ text, available = false }: TimeSlotProps) {
    return (
        <div
            className={cx(
                "rounded-2xl border px-4 py-3 text-center text-sm font-medium",
                available
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-100 text-slate-400"
            )}
        >
            {text}
        </div>
    );
}
