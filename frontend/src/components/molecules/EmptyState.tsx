import { type ReactNode } from "react";
import { FolderOpen } from "lucide-react";
import { cx } from "~/utils/cx";

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
    return (
        <div
            className={cx(
                "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-main bg-surface p-10 text-center",
                className
            )}
        >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                {icon || <FolderOpen className="h-8 w-8" />}
            </div>
            <h3 className="mb-1 text-base font-semibold text-text-main">{title}</h3>
            <p className="mb-6 max-w-sm text-sm text-text-muted">{description}</p>
            {action && <div>{action}</div>}
        </div>
    );
}
