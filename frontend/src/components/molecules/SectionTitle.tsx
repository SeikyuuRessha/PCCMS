interface SectionTitleProps {
    title: string;
    subtitle?: string;
}

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
    return (
        <div className="mb-4">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
    );
}
