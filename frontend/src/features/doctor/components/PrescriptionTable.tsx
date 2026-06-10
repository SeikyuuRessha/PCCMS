import { useEffect, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { Button, Input, Textarea } from "~/components/atoms";
import { Card, DataTable } from "~/components/molecules";
import { medicineApi, type MedicineSuggestion } from "~/shared/api/medicineApi";

export const prescriptionItemSchema = z.object({
    medicineId: z.string().min(1, "Vui lòng chọn thuốc từ danh sách"),
    medicineName: z.string().optional(),
    quantity: z.coerce.number().min(1, "Số lượng phải >= 1"),
    instruction: z.string().min(1, "Vui lòng nhập hoặc chọn hướng dẫn"),
    dosage: z.string().optional(),
    quantity: z.coerce.number().min(1, "Số lượng phải >= 1"),
    instruction: z.string().min(1, "Vui lòng nhập hướng dẫn"),
});

export const prescriptionFormSchema = z.object({
    items: z.array(prescriptionItemSchema),
});

export type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>;

interface PrescriptionTableProps {
    disabled?: boolean;
}

function MedicinePicker({
    index,
    disabled,
    error,
}: {
    index: number;
    disabled: boolean;
    error?: string;
}) {
    const { register, setValue, getValues } = useFormContext<any>();
    const selectedName = useWatch({ name: `prescription.items.${index}.medicineName` }) || "";
    const [keyword, setKeyword] = useState(selectedName);
    const [open, setOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<MedicineSuggestion[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    
    // Fetch templates when a medicine is selected
    const selectedMedicineId = useWatch({ name: `prescription.items.${index}.medicineId` });
    useEffect(() => {
        if (selectedMedicineId) {
            fetch(`/api/v1/medicines/${selectedMedicineId}/usage-templates`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }
            })
            .then(res => res.json())
            .then(data => setTemplates(data.data || []))
            .catch(() => setTemplates([]));
        } else {
            setTemplates([]);
        }
    }, [selectedMedicineId]);

    useEffect(() => {
        setKeyword(selectedName);
    }, [selectedName]);

    useEffect(() => {
        const trimmed = keyword.trim();
        if (!open || disabled || trimmed.length < 1) {
            setSuggestions([]);
            setIsLoadingSuggestions(false);
            return;
        }

        let cancelled = false;
        setIsLoadingSuggestions(true);
        medicineApi
            .suggestMedicines(trimmed)
            .then((items) => {
                if (!cancelled) {
                    setSuggestions(items);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setSuggestions([]);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsLoadingSuggestions(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [disabled, keyword, open]);

    const selectMedicine = (medicine: MedicineSuggestion) => {
        const firstInstruction = (medicine.defaultInstruction || "")
            .split(/\r?\n/)
            .map((line) => line.trim())
            .find(Boolean);
        setValue(`prescription.items.${index}.medicineId`, medicine.id, { shouldValidate: true, shouldDirty: true });
        setValue(`prescription.items.${index}.medicineName`, medicine.name, { shouldValidate: true, shouldDirty: true });
        if (!getValues(`prescription.items.${index}.instruction`) && firstInstruction) {
            setValue(`prescription.items.${index}.instruction`, firstInstruction, { shouldValidate: true, shouldDirty: true });
        }
        setKeyword(medicine.name);
        setOpen(false);
    };

    return (
        <div className="relative w-72">
            <input type="hidden" {...register(`prescription.items.${index}.medicineId`)} />
            <Input
                value={keyword}
                placeholder="Nhập tên thuốc"
                disabled={disabled}
                onFocus={() => setOpen(true)}
                onChange={(event) => {
                    setKeyword(event.target.value);
                    setOpen(true);
                    setValue(`prescription.items.${index}.medicineId`, "", { shouldValidate: true, shouldDirty: true });
                    setValue(`prescription.items.${index}.medicineName`, event.target.value, { shouldDirty: true });
                }}
                error={error}
            />
            {open && !disabled && (
                <div className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                    {isLoadingSuggestions ? (
                        <div className="px-3 py-2 text-sm text-slate-500">Đang tìm thuốc...</div>
                    ) : suggestions.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-slate-500">Không có thuốc phù hợp</div>
                    ) : (
                        suggestions.map((medicine) => (
                            <button
                                key={medicine.id}
                                type="button"
                                className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50 focus:bg-slate-50"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => selectMedicine(medicine)}
                            >
                                <span className="block font-medium text-slate-900">{medicine.name}</span>
                                <span className="block text-xs text-slate-500">
                                    {medicine.categoryName || "Chưa phân nhóm"} - {medicine.unit} - tồn {medicine.currentStock}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            )}
            
            {/* Show Templates below the input if a medicine is selected and has templates */}
            {selectedMedicineId && templates.length > 0 && !disabled && (
                <div className="mt-2 text-xs border border-indigo-200 bg-indigo-50 rounded-md p-2 shadow-sm">
                    <p className="font-semibold text-indigo-800 mb-1">Mẫu liều khuyến nghị:</p>
                    <div className="space-y-1">
                        {templates.map(t => (
                            <button
                                key={t.id}
                                type="button"
                                className="block w-full text-left p-1.5 hover:bg-indigo-100 rounded text-indigo-700 font-medium transition"
                                onClick={() => {
                                    setValue(`prescription.items.${index}.instruction`, t.instruction, { shouldValidate: true, shouldDirty: true });
                                    setValue(`prescription.items.${index}.dosage`, t.label, { shouldValidate: true, shouldDirty: true });
                                }}
                            >
                                {t.label}: <span className="font-normal text-indigo-600">{t.instruction}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export function PrescriptionTable({ disabled = false }: PrescriptionTableProps) {
    const {
        control,
        register,
        setValue,
        formState: { errors },
    } = useFormContext<any>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: "prescription.items",
    });



    return (
        <Card title="Kê đơn thuốc">
            <div className="space-y-6">
                <DataTable
                    columns={["Thuốc", "Số lượng", "Mẫu Liều", "Hướng dẫn", ""]}
                    rows={fields.map((field, index) => {
                        const itemErrors = (errors.prescription as any)?.items?.[index];
                        return [
                            <MedicinePicker
                                key={`medicine-${field.id}`}
                                index={index}
                                disabled={disabled}
                                error={itemErrors?.medicineId?.message}
                            />,
                            <div key={`quantity-${field.id}`} className="w-24">
                                <Input type="number" min="1" disabled={disabled} {...register(`prescription.items.${index}.quantity`, { valueAsNumber: true })} error={itemErrors?.quantity?.message} />
                            </div>,
                            <div key={`dosage-${field.id}`} className="w-40">
                                <Input disabled={disabled} placeholder="VD: Liều cao..." {...register(`prescription.items.${index}.dosage`)} error={itemErrors?.dosage?.message} />
                            </div>,
                            <div key={`instruction-${field.id}`} className="w-64">
                                <Textarea rows={2} disabled={disabled} placeholder="Nhập hướng dẫn dùng..." {...register(`prescription.items.${index}.instruction`)} error={itemErrors?.instruction?.message} />
                            </div>,
                            <div key={`action-${field.id}`} className="flex justify-center">
                                <Button type="button" variant="ghost" disabled={disabled} onClick={() => remove(index)} className="h-auto p-2 text-red-500 hover:bg-red-50 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>,
                        ];
                    })}
                />

                {!disabled && (
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full border-dashed"
                        onClick={() =>
                            append({
                                medicineId: "",
                                medicineName: "",
                                quantity: 1,
                                instruction: "",
                                dosage: "",
                            })
                        }
                    >
                        <Plus className="mr-2 h-4 w-4" /> Thêm thuốc
                    </Button>
                )}
            </div>
        </Card>
    );
}
