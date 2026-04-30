import { mockMedicines } from "./mockMedicines";
import type { Medicine, MedicineFilterValues, MedicineFormValues } from "./types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let medicinesStore: Medicine[] = mockMedicines.map((medicine) => ({ ...medicine }));

const clone = (medicine: Medicine) => ({ ...medicine });

export const getMedicines = async () => {
    await delay(250);
    return medicinesStore.map(clone);
};

export const searchMedicines = async (params: MedicineFilterValues) => {
    await delay(350);
    const keyword = params.keyword.trim().toLowerCase();
    const group = params.group.trim().toLowerCase();
    const unit = params.unit.trim().toLowerCase();

    return medicinesStore.filter((medicine) => {
        const matchesKeyword =
            !keyword ||
            medicine.code.toLowerCase().includes(keyword) ||
            medicine.name.toLowerCase().includes(keyword);
        const matchesGroup = !group || medicine.group.toLowerCase() === group;
        const matchesUnit = !unit || medicine.unit.toLowerCase() === unit;
        const matchesStock =
            !params.stockStatus ||
            (params.stockStatus === "inStock" && medicine.stock > 20) ||
            (params.stockStatus === "lowStock" && medicine.stock > 0 && medicine.stock <= 20) ||
            (params.stockStatus === "outOfStock" && medicine.stock === 0);

        return matchesKeyword && matchesGroup && matchesUnit && matchesStock;
    }).map(clone);
};

const assertUniqueMedicine = (
    payload: MedicineFormValues,
    excludeId?: string
) => {
    const codeExists = medicinesStore.some(
        (medicine) => medicine.code.toLowerCase() === payload.code.trim().toLowerCase() && medicine.id !== excludeId
    );
    const nameExists = medicinesStore.some(
        (medicine) => medicine.name.toLowerCase() === payload.name.trim().toLowerCase() && medicine.id !== excludeId
    );

    if (codeExists || nameExists) {
        throw new Error("Mã thuốc hoặc tên thuốc đã tồn tại");
    }
};

const validatePayload = (payload: MedicineFormValues) => {
    const stock = Number(payload.stock);
    const requiredFields = [payload.code, payload.name, payload.group, payload.unit, payload.defaultUsageGuide];
    if (requiredFields.some((field) => !field.trim()) || !Number.isInteger(stock) || stock < 0) {
        throw new Error("Vui lòng nhập đầy đủ thông tin bắt buộc");
    }
};

export const createMedicine = async (payload: MedicineFormValues) => {
    await delay(300);
    validatePayload(payload);
    assertUniqueMedicine(payload);

    const medicine: Medicine = {
        id: `med-${Date.now()}`,
        code: payload.code.trim(),
        name: payload.name.trim(),
        group: payload.group.trim(),
        unit: payload.unit.trim(),
        stock: Number(payload.stock),
        defaultUsageGuide: payload.defaultUsageGuide.trim(),
        note: payload.note.trim(),
    };

    medicinesStore = [medicine, ...medicinesStore];
    return clone(medicine);
};

export const updateMedicine = async (id: string, payload: MedicineFormValues) => {
    await delay(300);
    const index = medicinesStore.findIndex((medicine) => medicine.id === id);
    if (index === -1) {
        throw new Error("Không tìm thấy thuốc cần cập nhật");
    }

    validatePayload(payload);
    assertUniqueMedicine(payload, id);

    const updated: Medicine = {
        ...medicinesStore[index],
        code: payload.code.trim(),
        name: payload.name.trim(),
        group: payload.group.trim(),
        unit: payload.unit.trim(),
        stock: Number(payload.stock),
        defaultUsageGuide: payload.defaultUsageGuide.trim(),
        note: payload.note.trim(),
    };

    medicinesStore[index] = updated;
    return clone(updated);
};

export const deleteMedicine = async (id: string) => {
    await delay(250);
    const index = medicinesStore.findIndex((medicine) => medicine.id === id);
    if (index === -1) {
        throw new Error("Không tìm thấy thuốc cần xóa");
    }

    if (medicinesStore[index].isReferenced) {
        throw new Error("Thuốc đang được tham chiếu trong đơn hoặc kho nên không thể xóa");
    }

    medicinesStore.splice(index, 1);
};
