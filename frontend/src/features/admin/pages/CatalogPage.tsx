import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { Button, Input, Select, Textarea } from "~/components/atoms";
import { Card, DataTable, EmptyState, Modal } from "~/components/molecules";
import { Tag } from "~/components/atoms/Tag";
import { medicineApi } from "../api/medicineApi";
import { catalogApi } from "../api/catalogApi";
import type { MedicineResponse } from "~/types/medicine";
import { GroomingAdminPanel } from "../components/GroomingAdminPanel";

const medicineSchema = z.object({
  medicineCode: z.string().min(1, "Vui lòng nhập mã thuốc"),
  name: z.string().min(1, "Vui lòng nhập tên thuốc"),
  categoryId: z.string().min(1, "Vui lòng chọn nhóm thuốc"),
  unit: z.string().min(1, "Vui lòng nhập đơn vị"),
  unitPriceVnd: z.coerce.number().min(0, "Giá phải >= 0"),
  currentStock: z.coerce.number().min(0, "Tồn kho phải >= 0"),
  defaultInstruction: z.string().min(1, "Vui lòng nhập hướng dẫn dùng"),
});

const serviceSchema = z.object({
  serviceCode: z.string().min(1, "Vui lòng nhập mã dịch vụ"),
  name: z.string().min(1, "Vui lòng nhập tên dịch vụ"),
  categoryCode: z.enum(["MEDICAL", "GROOMING", "BOARDING", "OTHER"]),
  basePriceVnd: z.coerce.number().positive("Đơn giá phải > 0"),
  durationMinutes: z.coerce.number().min(1).optional().or(z.literal("")),
  description: z.string().optional(),
  isActive: z.boolean(),
});

const medCategorySchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên nhóm"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type MedicineFormValues = z.infer<typeof medicineSchema>;
type ServiceFormValues = z.infer<typeof serviceSchema>;
type MedCategoryFormValues = z.infer<typeof medCategorySchema>;

type Tab = "medicines" | "services" | "medCategories";

export function CatalogPage() {
    const queryClient = useQueryClient();
    const [page] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const {
        data: pageResponse,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["medicines", page],
        queryFn: () => medicineApi.getMedicines(page, 10),
    });

    const createMutation = useMutation({
        mutationFn: (data: MedicineFormValues) =>
            medicineApi.createMedicine({
                ...data,
                defaultInstruction: data.defaultInstruction || "",
            }),
        onSuccess: () => {
            toast.success("Thêm thuốc thành công");
            setIsModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["medicines"] });
            reset();
        },
        onError: () => toast.error("Có lỗi xảy ra"),
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<MedicineFormValues>({
        resolver: zodResolver(medicineSchema) as any,
        defaultValues: {
            name: "",
            categoryId: "",
            unit: "",
            unitPriceVnd: 0,
            initialStock: 0,
            defaultInstruction: "",
        },
    });

  const { data: medicinePageData, isLoading: medicinesLoading, isError: medicinesError } = useQuery({
    queryKey: ["medicines", medicinePage, categoryFilter],
    queryFn: () => medicineApi.getMedicines(medicinePage, 10, categoryFilter || undefined),
  });

  const { data: servicePageData, isLoading: servicesLoading, isError: servicesError } = useQuery({
    queryKey: ["services", servicePage, serviceCategoryFilter],
    queryFn: () =>
      catalogApi.listServices({
        page: servicePage,
        size: 10,
        categoryCode: serviceCategoryFilter || undefined,
      }),
    enabled: tab === "services",
  });

  const medicineForm = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineSchema) as never,
    defaultValues: {
      medicineCode: "",
      name: "",
      categoryId: "",
      unit: "",
      unitPriceVnd: 0,
      currentStock: 0,
      defaultInstruction: "",
    },
  });

  const medCategoryForm = useForm<MedCategoryFormValues>({
    resolver: zodResolver(medCategorySchema) as never,
    defaultValues: { name: "", description: "", isActive: true },
  });

  const serviceForm = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema) as never,
    defaultValues: {
      serviceCode: "",
      name: "",
      categoryCode: "GROOMING",
      basePriceVnd: 0,
      durationMinutes: undefined,
      description: "",
      isActive: true,
    },
  });

  const createMedicineMutation = useMutation({
    mutationFn: medicineApi.createMedicine,
    onSuccess: () => {
      toast.success("Thêm thuốc thành công");
      closeMedicineModal();
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
    onError: () => toast.error("Không thể thêm thuốc"),
  });

  const updateMedicineMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MedicineFormValues }) =>
      medicineApi.updateMedicine(id, data),
    onSuccess: () => {
      toast.success("Cập nhật thuốc thành công");
      closeMedicineModal();
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
    onError: () => toast.error("Không thể cập nhật thuốc"),
  });

  const deleteMedicineMutation = useMutation({
    mutationFn: medicineApi.deleteMedicine,
    onSuccess: () => {
      toast.success("Đã ngừng áp dụng thuốc");
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
    onError: () => toast.error("Không thể xóa thuốc"),
  });

  const addStockMutation = useMutation({
    mutationFn: ({ id, qty }: { id: string; qty: number }) =>
      medicineApi.addStock(id, { quantityToAdd: qty }),
    onSuccess: () => {
      toast.success("Đã nhập kho");
      setStockModal(null);
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
    onError: () => toast.error("Không thể nhập kho"),
  });

  const createServiceMutation = useMutation({
    mutationFn: catalogApi.createService,
    onSuccess: () => {
      toast.success("Thêm dịch vụ thành công");
      closeServiceModal();
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: () => toast.error("Không thể thêm dịch vụ"),
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ServiceFormValues }) => {
      const payload = {
        ...data,
        durationMinutes: data.durationMinutes ? Number(data.durationMinutes) : undefined,
      };
      return catalogApi.updateService(id, payload);
    },
    onSuccess: () => {
      toast.success("Cập nhật dịch vụ thành công");
      closeServiceModal();
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: () => toast.error("Không thể cập nhật dịch vụ"),
  });

  const createMedCategoryMutation = useMutation({
    mutationFn: catalogApi.createMedicineCategory,
    onSuccess: () => {
      toast.success("Thêm nhóm thuốc thành công");
      closeMedCategoryModal();
      queryClient.invalidateQueries({ queryKey: ["medicine-categories"] });
    },
    onError: () => toast.error("Không thể thêm nhóm thuốc"),
  });

  const updateMedCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MedCategoryFormValues }) =>
      catalogApi.updateMedicineCategory(id, data),
    onSuccess: () => {
      toast.success("Cập nhật nhóm thuốc thành công");
      closeMedCategoryModal();
      queryClient.invalidateQueries({ queryKey: ["medicine-categories"] });
    },
    onError: () => toast.error("Không thể cập nhật nhóm thuốc"),
  });

  const deleteMedCategoryMutation = useMutation({
    mutationFn: catalogApi.deleteMedicineCategory,
    onSuccess: () => {
      toast.success("Đã ngừng áp dụng nhóm thuốc");
      queryClient.invalidateQueries({ queryKey: ["medicine-categories"] });
    },
    onError: () => toast.error("Không thể xóa nhóm thuốc"),
  });

  const deleteServiceMutation = useMutation({
    mutationFn: catalogApi.deleteService,
    onSuccess: () => {
      toast.success("Đã ngừng áp dụng dịch vụ");
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: () => toast.error("Không thể xóa dịch vụ"),
  });

  function closeMedicineModal() {
    setMedicineModal(null);
    setEditingMedicine(null);
    medicineForm.reset();
  }

  function closeMedCategoryModal() {
    setMedCategoryModal(null);
    setEditingMedCategory(null);
    medCategoryForm.reset();
  }

  function openCreateMedCategory() {
    medCategoryForm.reset({ name: "", description: "", isActive: true });
    setEditingMedCategory(null);
    setMedCategoryModal("create");
  }

  function openEditMedCategory(cat: MedicineCategoryResponse) {
    setEditingMedCategory(cat);
    medCategoryForm.reset({
      name: cat.name,
      description: cat.description || "",
      isActive: cat.isActive,
    });
    setMedCategoryModal("edit");
  }

  function submitMedCategory(data: MedCategoryFormValues) {
    if (medCategoryModal === "edit" && editingMedCategory) {
      updateMedCategoryMutation.mutate({ id: editingMedCategory.id, data });
    } else {
      createMedCategoryMutation.mutate(data);
    }
  }

  function closeServiceModal() {
    setServiceModal(null);
    setEditingService(null);
    serviceForm.reset();
  }

  function openCreateMedicine() {
    medicineForm.reset();
    setEditingMedicine(null);
    setMedicineModal("create");
  }

  function openEditMedicine(med: MedicineResponse) {
    setEditingMedicine(med);
    medicineForm.reset({
      medicineCode: med.medicineCode,
      name: med.name,
      categoryId: med.categoryId,
      unit: med.unit,
      unitPriceVnd: med.unitPriceVnd,
      currentStock: med.currentStock,
      defaultInstruction: med.defaultInstruction || "",
    });
    setMedicineModal("edit");
  }

  function openCreateService() {
    serviceForm.reset({
      serviceCode: "",
      name: "",
      categoryCode: "GROOMING",
      basePriceVnd: 0,
      durationMinutes: undefined,
      description: "",
      isActive: true,
    });
    setEditingService(null);
    setServiceModal("create");
  }

  function openEditService(svc: ServiceCatalogResponse) {
    setEditingService(svc);
    serviceForm.reset({
      serviceCode: svc.serviceCode,
      name: svc.name,
      categoryCode: svc.categoryCode,
      basePriceVnd: svc.basePriceVnd,
      durationMinutes: svc.durationMinutes,
      description: svc.description || "",
      isActive: svc.isActive,
    });
    setServiceModal("edit");
  }

  function submitMedicine(data: MedicineFormValues) {
    if (medicineModal === "edit" && editingMedicine) {
      updateMedicineMutation.mutate({ id: editingMedicine.id, data });
    } else {
      createMedicineMutation.mutate(data);
    }
  }

  function submitService(data: ServiceFormValues) {
    const payload = {
      ...data,
      durationMinutes: data.durationMinutes ? Number(data.durationMinutes) : undefined,
    };
    if (serviceModal === "edit" && editingService) {
      updateServiceMutation.mutate({ id: editingService.id, data: payload });
    } else {
      createServiceMutation.mutate(payload);
    }
  }

  const medicines = medicinePageData?.content ?? [];
  const services = servicePageData?.content ?? [];

  return (
    <div className="grid gap-6">
      <div className="flex gap-2">
        <Button variant={tab === "medicines" ? "primary" : "outline"} onClick={() => setTab("medicines")}>
          Thuốc
        </Button>
        <Button variant={tab === "services" ? "primary" : "outline"} onClick={() => setTab("services")}>
          Dịch vụ
        </Button>
        <Button variant={tab === "medCategories" ? "primary" : "outline"} onClick={() => setTab("medCategories")}>
          Nhóm thuốc
        </Button>
      </div>

      {tab === "medicines" && (
        <Card
          title="Danh mục thuốc"
          right={
            <div className="flex items-center gap-2">
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setMedicinePage(1);
                }}
              >
                <option value="">Tất cả nhóm thuốc</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <Button onClick={openCreateMedicine}>Thêm thuốc mới</Button>
            </div>
          }
        >
          {medicinesLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : medicinesError ? (
            <EmptyState title="Lỗi" description="Không thể tải danh sách thuốc" />
          ) : medicines.length === 0 ? (
            <EmptyState title="Trống" description="Chưa có thuốc nào" />
          ) : (
            <DataTable
              columns={["Mã", "Tên", "Nhóm", "Đơn vị", "Tồn kho", "Hướng dẫn", "Trạng thái", "Hành động"]}
              rows={medicines.map((med) => [
                med.medicineCode,
                med.name,
                med.categoryName || "-",
                med.unit,
                med.currentStock.toString(),
                med.defaultInstruction || "-",
                med.isActive ? <Tag tone="green">Đang áp dụng</Tag> : <Tag tone="amber">Ngừng áp dụng</Tag>,
                <div key={med.id} className="flex flex-wrap gap-1">
                  <Button variant="outline" className="px-2 py-1 h-auto text-xs" onClick={() => openEditMedicine(med)}>
                    Sửa
                  </Button>
                  <Button variant="outline" className="px-2 py-1 h-auto text-xs" onClick={() => setStockModal(med)}>
                    Nhập kho
                  </Button>
                  {med.isActive && (
                    <Button
                      variant="outline"
                      className="px-2 py-1 h-auto text-xs"
                      onClick={() => {
                        if (confirm(`Ngừng áp dụng thuốc "${med.name}"?`)) {
                          deleteMedicineMutation.mutate(med.id);
                        }
                      }}
                    >
                      Xóa
                    </Button>
                  )}
                </div>,
              ])}
            />
          )}
        </Card>
      )}

      {tab === "medCategories" && (
        <Card
          title="Quản lý nhóm thuốc"
          right={<Button onClick={openCreateMedCategory}>Thêm nhóm thuốc</Button>}
        >
          {medCategoriesLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : allMedCategories.length === 0 ? (
            <EmptyState title="Trống" description="Chưa có nhóm thuốc nào" />
          ) : (
            <DataTable
              columns={["Tên nhóm", "Mô tả", "Trạng thái", "Hành động"]}
              rows={allMedCategories.map((cat) => [
                cat.name,
                cat.description || "-",
                cat.isActive ? <Tag tone="green">Đang áp dụng</Tag> : <Tag tone="amber">Ngừng áp dụng</Tag>,
                <div key={cat.id} className="flex gap-1">
                  <Button variant="outline" className="px-2 py-1 h-auto text-xs" onClick={() => openEditMedCategory(cat)}>
                    Sửa
                  </Button>
                  {cat.isActive && (
                    <Button
                      variant="outline"
                      className="px-2 py-1 h-auto text-xs"
                      onClick={() => {
                        if (confirm(`Ngừng áp dụng nhóm "${cat.name}"?`)) {
                          deleteMedCategoryMutation.mutate(cat.id);
                        }
                      }}
                    >
                      Xóa
                    </Button>
                  )}
                </div>,
              ])}
            />
          )}
        </Card>
      )}

    const rows =
        pageResponse?.content.map((med: MedicineResponse) => [
            med.name,
            med.currentStock.toString(),
            med.unit,
            med.defaultInstruction || "-",
            <Button key={`edit-${med.id}`} variant="outline" className="px-2 py-1 h-auto text-xs">
                Sửa
            </Button>,
        ]) || [];

    return (
        <div className="grid gap-6">
            <Card
                title="Danh mục thuốc"
                right={<Button onClick={() => setIsModalOpen(true)}>Thêm thuốc mới</Button>}
            >
                <DataTable
                    columns={["Tên thuốc", "Tồn kho", "Đơn vị", "Hướng dẫn", "Hành động"]}
                    rows={rows}
                />
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Thêm Thuốc Mới"
            >
                <form
                    onSubmit={handleSubmit((data) => createMutation.mutate(data))}
                    className="space-y-4"
                >
                    <Input label="Tên thuốc" {...register("name")} error={errors.name?.message} />
                    <Input
                        label="Danh mục (ID)"
                        {...register("categoryId")}
                        error={errors.categoryId?.message}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Đơn vị" {...register("unit")} error={errors.unit?.message} />
                        <Input
                            label="Giá (VND)"
                            type="number"
                            {...register("unitPriceVnd")}
                            error={errors.unitPriceVnd?.message}
                        />
                    </div>
                    <Input
                        label="Tồn kho ban đầu"
                        type="number"
                        {...register("initialStock")}
                        error={errors.initialStock?.message}
                    />
                    <Input label="Hướng dẫn mặc định" {...register("defaultInstruction")} />

                    <div className="mt-6 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending ? "Đang lưu..." : "Lưu"}
                        </Button>
                    </div>
                </form>
            </Modal>

            <GroomingAdminPanel />
        </div>
    );
}
