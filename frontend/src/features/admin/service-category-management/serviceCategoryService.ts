import { mockServices } from "./mockServices";
import type { Service, ServiceFormValues, ServiceSearchParams, ServiceStatus } from "./types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let servicesStore: Service[] = mockServices.map((service) => ({ ...service }));

const normalize = (value: string) => value.trim().toLowerCase();

const isPositiveInteger = (value: string) => /^\d+$/.test(value) && Number(value) > 0;

const validateForm = (payload: ServiceFormValues, existingId?: string) => {
    const requiredFields = [payload.code, payload.name, payload.type, payload.price, payload.status];
    if (requiredFields.some((field) => !field.trim())) {
        throw new Error("Vui lòng nhập đầy đủ thông tin bắt buộc");
    }

    if (Number(payload.price) <= 0 || Number.isNaN(Number(payload.price))) {
        throw new Error("Đơn giá phải là số dương");
    }

    if (payload.durationMinutes.trim() && !isPositiveInteger(payload.durationMinutes)) {
        throw new Error("Thời lượng dự kiến phải là số nguyên dương");
    }

    const code = normalize(payload.code);
    const name = normalize(payload.name);
    const duplicated = servicesStore.find(
        (item) =>
            item.id !== existingId &&
            (normalize(item.code) === code || normalize(item.name) === name)
    );

    if (duplicated) {
        throw new Error("Mã dịch vụ hoặc tên dịch vụ đã tồn tại");
    }
};

const toService = (payload: ServiceFormValues, id: string): Service => ({
    id,
    code: payload.code.trim(),
    name: payload.name.trim(),
    type: payload.type as Service["type"],
    price: Number(payload.price),
    durationMinutes: payload.durationMinutes.trim() ? Number(payload.durationMinutes) : 0,
    description: payload.description.trim(),
    status: payload.status as ServiceStatus,
    isReferenced: false,
});

export const getServices = async () => {
    await delay(250);
    return servicesStore.map((service) => ({ ...service }));
};

export const searchServices = async (params: ServiceSearchParams) => {
    await delay(300);
    const keyword = normalize(params.keyword);
    const type = params.type;
    const status = params.status;

    return servicesStore.filter((service) => {
        const matchesKeyword =
            !keyword ||
            normalize(service.code).includes(keyword) ||
            normalize(service.name).includes(keyword);
        const matchesType = !type || service.type === type;
        const matchesStatus = !status || service.status === status;
        return matchesKeyword && matchesType && matchesStatus;
    });
};

export const createService = async (payload: ServiceFormValues) => {
    await delay(300);
    validateForm(payload);
    const nextId = `SRV-${String(servicesStore.length + 1).padStart(3, "0")}`;
    const created = toService(payload, nextId);
    servicesStore = [created, ...servicesStore];
    return { ...created };
};

export const updateService = async (id: string, payload: ServiceFormValues) => {
    await delay(300);
    const current = servicesStore.find((item) => item.id === id);
    if (!current) {
        throw new Error("Không tìm thấy dịch vụ cần cập nhật");
    }

    validateForm(payload, id);
    const updated = { ...current, ...toService(payload, current.id) };
    servicesStore = servicesStore.map((item) => (item.id === id ? updated : item));
    return { ...updated };
};

export const deleteService = async (id: string) => {
    await delay(250);
    const current = servicesStore.find((item) => item.id === id);
    if (!current) {
        throw new Error("Không tìm thấy dịch vụ cần xóa");
    }

    if (current.isReferenced) {
        throw new Error("Dịch vụ đang được sử dụng nên không thể xóa");
    }

    servicesStore = servicesStore.filter((item) => item.id !== id);
};
