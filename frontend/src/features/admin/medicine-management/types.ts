export type MedicineStockStatus = "inStock" | "lowStock" | "outOfStock";

export interface Medicine {
    id: string;
    code: string;
    name: string;
    group: string;
    unit: string;
    stock: number;
    defaultUsageGuide: string;
    note: string;
    isReferenced?: boolean;
}

export interface MedicineFormValues {
    code: string;
    name: string;
    group: string;
    unit: string;
    stock: string;
    defaultUsageGuide: string;
    note: string;
}

export interface MedicineFilterValues {
    keyword: string;
    group: string;
    unit: string;
    stockStatus: "" | MedicineStockStatus;
}
