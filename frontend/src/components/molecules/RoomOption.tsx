import { cx } from "~/utils/cx";
import { Tag } from "~/components/atoms";

interface RoomOptionProps {
    name: string;
    price: string;
    features: string;
    available?: boolean;
}

export function RoomOption({ name, price, features, available = false }: RoomOptionProps) {
    return (
        <div
            className={cx(
                "rounded-3xl border p-4",
                available ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h4 className="font-semibold">{name}</h4>
                    <p className="mt-1 text-sm text-slate-600">{features}</p>
                </div>
                <Tag tone={available ? "green" : "red"}>{available ? "Còn chỗ" : "Hết chỗ"}</Tag>
            </div>
            <p className="mt-3 text-lg font-semibold">{price}</p>
        </div>
    );
}
