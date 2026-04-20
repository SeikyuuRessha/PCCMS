import type { ReactNode } from "react";

interface SummaryRowProps {
    label: string;
    value: ReactNode;
}

export function SummaryRow({ label, value }: SummaryRowProps) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
            <span className="text-slate-500">{label}</span>
            <span className="font-medium text-slate-800">{value}</span>
        </div>
    );
}
