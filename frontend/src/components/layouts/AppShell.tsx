import type { ReactNode } from "react";

interface AppShellProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    actions?: ReactNode;
}

export function AppShell({ children, title, subtitle, actions }: AppShellProps) {
    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="mx-auto max-w-[1600px] p-4 md:p-6">
                <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-8">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">{actions}</div>
                    </div>
                    <div className="p-5 md:p-8">{children}</div>
                </div>
            </div>
        </div>
    );
}
