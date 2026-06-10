import api, { getApiData, getPageContent } from "~/api/api";
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

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isBackendId = (value: string) => uuidPattern.test(value);

const requireCategoryId = (value: string) => {
    const categoryId = value.trim();
    if (!categoryId || !isBackendId(categoryId)) {
        throw new Error("Vui lòng chọn nhóm thuốc từ danh sách");
    }
    return categoryId;
};

const getStockStatus = (stock: number) => {
    if (stock === 0) return "outOfStock";
    if (stock <= 20) return "lowStock";
    return "inStock";
};

const matchesClientFilters = (medicine: Medicine, params: MedicineFilterValues) => {
    const unit = params.unit.trim();
    const matchesUnit = !unit || medicine.unit === unit;
    const matchesGroup = !params.group || medicine.categoryId === params.group;
    const matchesStockStatus = !params.stockStatus || getStockStatus(medicine.stock) === params.stockStatus;
    return matchesUnit && matchesGroup && matchesStockStatus;
};

function toMedicine(item: BackendMedicine): Medicine {
    return {
        id: item.id,
        code: item.medicineCode,
        name: item.name,
        categoryId: item.categoryId,
        group: item.categoryName ?? "",
        unit: item.unit,
        stock: item.currentStock,
        unitPriceVnd: item.unitPriceVnd ?? 0,
        defaultUsageGuide: item.defaultInstruction ?? "",
        note: item.isActive === false ? "Ngừng áp dụng" : "",
    };
}

function requireMedicineFields(payload: MedicineFormValues) {
    if (!payload.name.trim() || !payload.unit.trim()) {
        throw new Error("Vui lòng nhập đầy đủ thông tin thuốc");
    }
    requireCategoryId(payload.categoryId);
    if (!payload.defaultUsageGuide.trim()) {
        throw new Error("Vui lòng nhập ít nhất một hướng dẫn sử dụng hoặc mẫu liều");
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
        medicineCode: payload.code.trim() || undefined,
        name: payload.name.trim(),
        categoryId: requireCategoryId(payload.categoryId),
        unit: payload.unit.trim(),
        defaultInstruction: payload.defaultUsageGuide.trim(),
        currentStock: Number(payload.stock),
        unitPriceVnd: Number(payload.unitPriceVnd),
    };
}

export const getMedicines = async () => {
    const response = await api.get("/v1/medicines", { params: { isActive: true, page: 0, size: 50 } });
    return getPageContent<BackendMedicine>(getApiData<unknown>(response)).map(toMedicine);
};

export const searchMedicines = async (params: MedicineFilterValues) => {
    const response = await api.get("/v1/medicines", {
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
};

export const suggestMedicines = async (keyword: string) => {
    const response = await api.get("/v1/medicines/suggestions", {
        params: { keyword: keyword || undefined, activeOnly: true, page: 0, size: 10 },
    });
    return getPageContent<BackendMedicine>(getApiData<unknown>(response)).map(toMedicine);
};

export const createMedicine = async (payload: MedicineFormValues) => {
    requireMedicineFields(payload);
    const response = await api.post("/v1/medicines", createPayload(payload));
    return toMedicine(getApiData<BackendMedicine>(response));
};

export const updateMedicine = async (id: string, payload: MedicineFormValues) => {
    requireMedicineFields(payload);
    const response = await api.put(`/v1/medicines/${id}`, createPayload(payload));
    return toMedicine(getApiData<BackendMedicine>(response));
};

export const deleteMedicine = async (id: string) => {
    await api.delete(`/v1/medicines/${id}`);
};
