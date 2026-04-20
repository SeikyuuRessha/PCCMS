import { Tag } from "~/components/atoms";

interface ServiceCardProps {
    name: string;
    duration: string;
    price: string;
}

export function ServiceCard({ name, duration, price }: ServiceCardProps) {
    return (
        <div className="rounded-3xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h4 className="font-semibold">{name}</h4>
                    <p className="mt-1 text-sm text-slate-500">Thời lượng dự kiến: {duration}</p>
                </div>
                <Tag tone="green">{price}</Tag>
            </div>
        </div>
    );
}
