import api, { getApiData, getPageContent } from "~/api/api";
import { mockMedicines } from "./mockMedicines";
import type { Medicine, MedicineFilterValues, MedicineFormValues } from "./types";

interface BackendMedicine {
    id: string;
    medicineCode: string;
    name: string;
    categoryId?: string;
    categoryName?: string;
    unit: string;
    defaultInstruction?: string;
    currentStock: number;
    unitPriceVnd?: number;
    isActive?: boolean;
}

let fallbackStore: Medicine[] = mockMedicines.map((medicine) => ({ ...medicine }));

const medicineCategoryLabelStorageKey = "pccms.medicine.categoryLabels";
const fallback = () => fallbackStore.map((medicine) => ({ ...medicine }));
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isBackendId = (value: string) => uuidPattern.test(value);
const backendCategoryIdOrUndefined = (value: string) => {
    const categoryId = value.trim();
    return categoryId && isBackendId(categoryId) ? categoryId : undefined;
};

const readCategoryLabels = (): Record<string, string> => {
    try {
        const raw = window.localStorage.getItem(medicineCategoryLabelStorageKey);
        return raw ? (JSON.parse(raw) as Record<string, string>) : {};
    } catch {
        return {};
    }
};

const writeCategoryLabel = (medicine: BackendMedicine, group: string) => {
    const label = group.trim();
    if (!label) return;

    const labels = readCategoryLabels();
    labels[medicine.id] = label;
    labels[medicine.medicineCode] = label;
    window.localStorage.setItem(medicineCategoryLabelStorageKey, JSON.stringify(labels));
};

const getStockStatus = (stock: number) => {
    if (stock === 0) return "outOfStock";
    if (stock <= 20) return "lowStock";
    return "inStock";
};

const matchesClientFilters = (medicine: Medicine, params: MedicineFilterValues) => {
    const unit = params.unit.trim();
    const group = params.group.trim();
    const localGroup = group.startsWith("local:") ? group.slice("local:".length) : group;
    const matchesUnit = !unit || medicine.unit === unit;
    const matchesGroup = !group || medicine.categoryId === group || medicine.group === localGroup;
    const matchesStockStatus = !params.stockStatus || getStockStatus(medicine.stock) === params.stockStatus;
    return matchesUnit && matchesGroup && matchesStockStatus;
};

const categoryLabelFor = (item: BackendMedicine) => {
    if (item.categoryName) return item.categoryName;

    const labels = readCategoryLabels();
    return labels[item.id] ?? labels[item.medicineCode] ?? "";
};

function toMedicine(item: BackendMedicine): Medicine {
    return {
        id: item.id,
        code: item.medicineCode,
        name: item.name,
        categoryId: item.categoryId,
        group: categoryLabelFor(item),
        unit: item.unit,
        stock: item.currentStock,
        unitPriceVnd: item.unitPriceVnd ?? 0,
        defaultUsageGuide: item.defaultInstruction ?? "",
        note: item.isActive === false ? "Ngừng hoạt động" : "",
    };
}

function requireMedicineFields(payload: MedicineFormValues) {
    if (!payload.code.trim() || !payload.name.trim() || !payload.unit.trim()) {
        throw new Error("Vui lòng nhập đầy đủ thông tin thuốc");
    }
    if (!Number.isFinite(Number(payload.stock)) || Number(payload.stock) < 0) {
        throw new Error("Số lượng tồn phải là số không âm");
    }
    if (!Number.isFinite(Number(payload.unitPriceVnd)) || Number(payload.unitPriceVnd) < 0) {
        throw new Error("Đơn giá phải là số không âm");
    }
}

function createPayload(payload: MedicineFormValues) {
    return {
        medicineCode: payload.code.trim(),
        name: payload.name.trim(),
        categoryId: backendCategoryIdOrUndefined(payload.categoryId),
        unit: payload.unit.trim(),
        defaultInstruction: payload.defaultUsageGuide.trim(),
        currentStock: Number(payload.stock),
        unitPriceVnd: Number(payload.unitPriceVnd),
        isActive: true,
    };
}

function updatePayload(payload: MedicineFormValues) {
    return {
        medicineCode: payload.code.trim(),
        name: payload.name.trim(),
        categoryId: backendCategoryIdOrUndefined(payload.categoryId),
        unit: payload.unit.trim(),
        defaultInstruction: payload.defaultUsageGuide.trim(),
        currentStock: Number(payload.stock),
        unitPriceVnd: Number(payload.unitPriceVnd),
        isActive: true,
    };
}

export const getMedicines = async () => {
    try {
        const response = await api.get("/admin/medicines", { params: { isActive: true, page: 0, size: 50 } });
        return getPageContent<BackendMedicine>(getApiData<unknown>(response)).map(toMedicine);
    } catch {
        return fallback();
    }
};

export const searchMedicines = async (params: MedicineFilterValues) => {
    try {
        const response = await api.get("/admin/medicines", {
            params: {
                keyword: params.keyword || undefined,
                categoryId: params.group && isBackendId(params.group) ? params.group : undefined,
                isActive: true,
                page: 0,
                size: 50,
            },
        });
        return getPageContent<BackendMedicine>(getApiData<unknown>(response))
            .map(toMedicine)
            .filter((medicine) => matchesClientFilters(medicine, params));
    } catch {
        return fallback().filter((medicine) => matchesClientFilters(medicine, params));
    }
};

export const createMedicine = async (payload: MedicineFormValues) => {
    requireMedicineFields(payload);
    const response = await api.post("/admin/medicines", createPayload(payload));
    const medicine = getApiData<BackendMedicine>(response);
    if (!medicine.categoryName) {
        writeCategoryLabel(medicine, payload.group);
    }
    return toMedicine(medicine);
};

export const updateMedicine = async (id: string, payload: MedicineFormValues) => {
    requireMedicineFields(payload);
    const response = await api.put(`/admin/medicines/${id}`, updatePayload(payload));
    const medicine = getApiData<BackendMedicine>(response);
    if (!medicine.categoryName) {
        writeCategoryLabel(medicine, payload.group);
    }
    return toMedicine(medicine);
};

export const deleteMedicine = async (id: string) => {
    await api.delete(`/admin/medicines/${id}`);
};
