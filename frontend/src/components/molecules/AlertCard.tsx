import { AlertTriangle } from "lucide-react";

interface AlertCardProps {
    pet: string;
    metric: string;
    note: string;
}

export function AlertCard({ pet, metric, note }: AlertCardProps) {
    return (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5">
            <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">{pet}</span>
            </div>
            <p className="mt-3 text-lg font-semibold text-rose-900">{metric}</p>
            <p className="mt-1 text-sm text-rose-800">{note}</p>
        </div>
    );
}
