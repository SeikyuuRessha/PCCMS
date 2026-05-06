import { useEffect, useMemo, useState } from "react";
import { Button, Tag } from "~/components/atoms";
import { Card } from "~/components/molecules";
import { MedicineSummaryCards } from "../medicine-management/components/MedicineSummaryCards";
import { MedicineFilters } from "../medicine-management/components/MedicineFilters";
import { MedicineTable } from "../medicine-management/components/MedicineTable";
import { MedicineFormDialog } from "../medicine-management/components/MedicineFormDialog";
import { MedicineDeleteDialog } from "../medicine-management/components/MedicineDeleteDialog";
import { createMedicine, deleteMedicine, getMedicines, searchMedicines, updateMedicine } from "../medicine-management/medicineService";
import { medicineGroups } from "../medicine-management/mockMedicines";
import type { Medicine, MedicineFilterValues, MedicineFormValues } from "../medicine-management/types";
import { ServiceSummaryCards } from "../service-category-management/components/ServiceSummaryCards";
import { ServiceFilters } from "../service-category-management/components/ServiceFilters";
import { ServiceTable } from "../service-category-management/components/ServiceTable";
import { ServiceFormDialog } from "../service-category-management/components/ServiceFormDialog";
import { ServiceDeleteDialog } from "../service-category-management/components/ServiceDeleteDialog";
import { createService, deleteService, getServices, searchServices, updateService } from "../service-category-management/serviceCategoryService";
import type { Service, ServiceFormValues, ServiceSearchParams } from "../service-category-management/types";

const emptyMedicineForm: MedicineFormValues = {
    code: "",
    name: "",
    group: "",
    unit: "",
    stock: "",
    defaultUsageGuide: "",
    note: "",
};

const emptyMedicineFilters: MedicineFilterValues = {
    keyword: "",
    group: "",
    unit: "",
    stockStatus: "",
};

const emptyServiceForm: ServiceFormValues = {
    code: "",
    name: "",
    type: "",
    price: "",
    durationMinutes: "",
    description: "",
    status: "",
};

const emptyServiceFilters: ServiceSearchParams = {
    keyword: "",
    type: "",
    status: "",
};

function buildMedicineFormValues(medicine: Medicine): MedicineFormValues {
    return {
        code: medicine.code,
        name: medicine.name,
        group: medicine.group,
        unit: medicine.unit,
        stock: String(medicine.stock),
        defaultUsageGuide: medicine.defaultUsageGuide,
        note: medicine.note,
    };
}

function buildServiceFormValues(service: Service): ServiceFormValues {
    return {
        code: service.code,
        name: service.name,
        type: service.type,
        price: String(service.price),
        durationMinutes: service.durationMinutes ? String(service.durationMinutes) : "",
        description: service.description,
        status: service.status,
    };
}

export function CatalogPage() {
    const [tab, setTab] = useState<"medicine" | "service">("medicine");

    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [medicineFilters, setMedicineFilters] = useState<MedicineFilterValues>(emptyMedicineFilters);
    const [medicineLoading, setMedicineLoading] = useState(true);
    const [medicineSearchError, setMedicineSearchError] = useState("");
    const [medicineFeedback, setMedicineFeedback] = useState("");
    const [medicineFormOpen, setMedicineFormOpen] = useState(false);
    const [medicineFormMode, setMedicineFormMode] = useState<"create" | "edit">("create");
    const [medicineFormValue, setMedicineFormValue] = useState<MedicineFormValues>(emptyMedicineForm);
    const [medicineFormLoading, setMedicineFormLoading] = useState(false);
    const [medicineFormError, setMedicineFormError] = useState("");
    const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
    const [deleteMedicineTarget, setDeleteMedicineTarget] = useState<Medicine | null>(null);
    const [deleteMedicineLoading, setDeleteMedicineLoading] = useState(false);
    const [deleteMedicineError, setDeleteMedicineError] = useState("");

    const [services, setServices] = useState<Service[]>([]);
    const [serviceFilters, setServiceFilters] = useState<ServiceSearchParams>(emptyServiceFilters);
    const [serviceLoading, setServiceLoading] = useState(true);
    const [serviceSearchError, setServiceSearchError] = useState("");
    const [serviceFeedback, setServiceFeedback] = useState("");
    const [serviceFormOpen, setServiceFormOpen] = useState(false);
    const [serviceFormMode, setServiceFormMode] = useState<"create" | "edit">("create");
    const [serviceFormValue, setServiceFormValue] = useState<ServiceFormValues>(emptyServiceForm);
    const [serviceFormLoading, setServiceFormLoading] = useState(false);
    const [serviceFormError, setServiceFormError] = useState("");
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [deleteServiceTarget, setDeleteServiceTarget] = useState<Service | null>(null);
    const [deleteServiceLoading, setDeleteServiceLoading] = useState(false);
    const [deleteServiceError, setDeleteServiceError] = useState("");

    const loadMedicines = async () => {
        setMedicineLoading(true);
        const data = await getMedicines();
        setMedicines(data);
        setMedicineLoading(false);
    };

    const loadServices = async () => {
        setServiceLoading(true);
        const data = await getServices();
        setServices(data);
        setServiceLoading(false);
    };

    useEffect(() => {
        void loadMedicines();
        void loadServices();
    }, []);

    const filteredMedicines = useMemo(() => medicines, [medicines]);
    const medicineTotal = medicines.length;
    const medicineInStock = medicines.filter((item) => item.stock > 20).length;
    const medicineLowStock = medicines.filter((item) => item.stock > 0 && item.stock <= 20).length;
    const medicineGroupCount = new Set(medicines.map((item) => item.group)).size;

    const serviceTotal = services.length;
    const serviceActive = services.filter((item) => item.status === "active").length;
    const serviceInactive = services.filter((item) => item.status === "inactive").length;
    const serviceGroupCount = new Set(services.map((item) => item.type)).size;

    const runMedicineSearch = async () => {
        const hasCriteria =
            medicineFilters.keyword.trim() || medicineFilters.group.trim() || medicineFilters.unit.trim() || medicineFilters.stockStatus;
        if (!hasCriteria) {
            setMedicineSearchError("Cần nhập ít nhất một tiêu chí tìm kiếm");
            return;
        }
        setMedicineSearchError("");
        setMedicineLoading(true);
        const result = await searchMedicines(medicineFilters);
        setMedicines(result);
        setMedicineLoading(false);
        setMedicineFeedback(result.length === 0 ? "Không tìm thấy thuốc nào thoả mãn tiêu chí tìm kiếm" : "");
    };

    const resetMedicineFilters = async () => {
        setMedicineFilters(emptyMedicineFilters);
        setMedicineSearchError("");
        setMedicineFeedback("");
        await loadMedicines();
    };

    const openMedicineCreate = () => {
        setMedicineFormMode("create");
        setMedicineFormValue(emptyMedicineForm);
        setEditingMedicine(null);
        setMedicineFormError("");
        setMedicineFormOpen(true);
    };

    const openMedicineEdit = (medicine: Medicine) => {
        setMedicineFormMode("edit");
        setEditingMedicine(medicine);
        setMedicineFormValue(buildMedicineFormValues(medicine));
        setMedicineFormError("");
        setMedicineFormOpen(true);
    };

    const submitMedicineForm = async () => {
        setMedicineFormLoading(true);
        setMedicineFormError("");
        try {
            const saved =
                medicineFormMode === "create"
                    ? await createMedicine(medicineFormValue)
                    : await updateMedicine(editingMedicine?.id ?? "", medicineFormValue);

            const next =
                medicineFormMode === "create"
                    ? [saved, ...medicines]
                    : medicines.map((item) => (item.id === saved.id ? saved : item));
            setMedicines(next);
            setMedicineFormOpen(false);
            setMedicineFeedback(medicineFormMode === "create" ? "Thêm thuốc thành công" : "Cập nhật thuốc thành công");
        } catch (error) {
            setMedicineFormError(error instanceof Error ? error.message : "Đã xảy ra lỗi");
        } finally {
            setMedicineFormLoading(false);
        }
    };

    const openMedicineDelete = (medicine: Medicine) => {
        setDeleteMedicineTarget(medicine);
        setDeleteMedicineError("");
    };

    const confirmMedicineDelete = async () => {
        if (!deleteMedicineTarget) return;
        setDeleteMedicineLoading(true);
        setDeleteMedicineError("");
        try {
            await deleteMedicine(deleteMedicineTarget.id);
            setMedicines((prev) => prev.filter((item) => item.id !== deleteMedicineTarget.id));
            setDeleteMedicineTarget(null);
            setMedicineFeedback("Xóa thuốc thành công");
        } catch (error) {
            setDeleteMedicineError(error instanceof Error ? error.message : "Không thể xóa thuốc");
        } finally {
            setDeleteMedicineLoading(false);
        }
    };

    const runServiceSearch = async () => {
        const hasCriteria = serviceFilters.keyword.trim() || serviceFilters.type || serviceFilters.status;
        if (!hasCriteria) {
            setServiceSearchError("Cần nhập ít nhất một tiêu chí tìm kiếm");
            return;
        }
        setServiceSearchError("");
        setServiceLoading(true);
        const result = await searchServices(serviceFilters);
        setServices(result);
        setServiceLoading(false);
        setServiceFeedback(result.length === 0 ? "Không tìm thấy dịch vụ nào thoả mãn tiêu chí tìm kiếm" : "");
    };

    const resetServiceFilters = async () => {
        setServiceFilters(emptyServiceFilters);
        setServiceSearchError("");
        setServiceFeedback("");
        await loadServices();
    };

    const openServiceCreate = () => {
        setServiceFormMode("create");
        setServiceFormValue(emptyServiceForm);
        setEditingService(null);
        setServiceFormError("");
        setServiceFormOpen(true);
    };

    const openServiceEdit = (service: Service) => {
        setServiceFormMode("edit");
        setEditingService(service);
        setServiceFormValue(buildServiceFormValues(service));
        setServiceFormError("");
        setServiceFormOpen(true);
    };

    const submitServiceForm = async () => {
        setServiceFormLoading(true);
        setServiceFormError("");
        try {
            const saved =
                serviceFormMode === "create"
                    ? await createService(serviceFormValue)
                    : await updateService(editingService?.id ?? "", serviceFormValue);

            const next =
                serviceFormMode === "create"
                    ? [saved, ...services]
                    : services.map((item) => (item.id === saved.id ? saved : item));
            setServices(next);
            setServiceFormOpen(false);
            setServiceFeedback(serviceFormMode === "create" ? "Thêm dịch vụ thành công" : "Cập nhật dịch vụ thành công");
        } catch (error) {
            setServiceFormError(error instanceof Error ? error.message : "Đã xảy ra lỗi");
        } finally {
            setServiceFormLoading(false);
        }
    };

    const openServiceDelete = (service: Service) => {
        setDeleteServiceTarget(service);
        setDeleteServiceError("");
    };

    const confirmServiceDelete = async () => {
        if (!deleteServiceTarget) return;
        setDeleteServiceLoading(true);
        setDeleteServiceError("");
        try {
            await deleteService(deleteServiceTarget.id);
            setServices((prev) => prev.filter((item) => item.id !== deleteServiceTarget.id));
            setDeleteServiceTarget(null);
            setServiceFeedback("Xóa dịch vụ thành công");
        } catch (error) {
            setDeleteServiceError(error instanceof Error ? error.message : "Không thể xóa dịch vụ");
        } finally {
            setDeleteServiceLoading(false);
        }
    };

    const isMedicineTab = tab === "medicine";

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        {isMedicineTab ? "Quản lý thuốc" : "Quản lý danh mục dịch vụ"}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {isMedicineTab
                            ? "Quản lý danh mục thuốc, tồn kho và hướng dẫn dùng mặc định."
                            : "Quản lý các dịch vụ khám, làm đẹp và lưu trú đang cung cấp tại trung tâm."}
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button onClick={isMedicineTab ? openMedicineCreate : openServiceCreate}>
                        {isMedicineTab ? "Thêm thuốc" : "Thêm dịch vụ"}
                    </Button>
                </div>
            </div>

            <div className="flex gap-2 rounded-2xl bg-slate-100 p-1 w-fit">
                <button
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${tab === "medicine" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                    onClick={() => setTab("medicine")}
                >
                    Thuốc
                </button>
                <button
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${tab === "service" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                    onClick={() => setTab("service")}
                >
                    Dịch vụ
                </button>
            </div>

            {isMedicineTab ? (
                <div className="space-y-6">
                    <MedicineSummaryCards total={medicineTotal} inStock={medicineInStock} lowStock={medicineLowStock} groups={medicineGroupCount} />
                    <MedicineFilters value={medicineFilters} onChange={setMedicineFilters} onSearch={runMedicineSearch} onReset={resetMedicineFilters} loading={medicineLoading} error={medicineSearchError} />
                    {medicineFeedback && <Card className="border-emerald-200 bg-emerald-50 text-emerald-800">{medicineFeedback}</Card>}
                    <MedicineTable items={filteredMedicines} loading={medicineLoading} onEdit={openMedicineEdit} onDelete={openMedicineDelete} />
                </div>
            ) : (
                <div className="space-y-6">
                    <ServiceSummaryCards total={serviceTotal} active={serviceActive} inactive={serviceInactive} groups={serviceGroupCount} />
                    <ServiceFilters value={serviceFilters} onChange={setServiceFilters} onSearch={runServiceSearch} onReset={resetServiceFilters} loading={serviceLoading} error={serviceSearchError} />
                    {serviceFeedback && <Card className="border-emerald-200 bg-emerald-50 text-emerald-800">{serviceFeedback}</Card>}
                    <ServiceTable items={services} loading={serviceLoading} onEdit={openServiceEdit} onDelete={openServiceDelete} />
                </div>
            )}

            <MedicineFormDialog
                open={medicineFormOpen}
                mode={medicineFormMode}
                value={medicineFormValue}
                loading={medicineFormLoading}
                error={medicineFormError}
                onChange={setMedicineFormValue}
                onClose={() => setMedicineFormOpen(false)}
                onSubmit={() => void submitMedicineForm()}
                currentMedicine={editingMedicine}
            />
            <MedicineDeleteDialog
                open={Boolean(deleteMedicineTarget)}
                medicine={deleteMedicineTarget}
                loading={deleteMedicineLoading}
                error={deleteMedicineError}
                onClose={() => setDeleteMedicineTarget(null)}
                onConfirm={() => void confirmMedicineDelete()}
            />

            <ServiceFormDialog
                open={serviceFormOpen}
                mode={serviceFormMode}
                value={serviceFormValue}
                loading={serviceFormLoading}
                error={serviceFormError}
                onChange={setServiceFormValue}
                onClose={() => setServiceFormOpen(false)}
                onSubmit={() => void submitServiceForm()}
                currentService={editingService}
            />
            <ServiceDeleteDialog
                open={Boolean(deleteServiceTarget)}
                service={deleteServiceTarget}
                loading={deleteServiceLoading}
                error={deleteServiceError}
                onClose={() => setDeleteServiceTarget(null)}
                onConfirm={() => void confirmServiceDelete()}
            />
        </div>
    );
}
