import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { PrescriptionTable } from "~/features/doctor/components/PrescriptionTable";

vi.mock("~/shared/api/medicineApi", () => ({
    medicineApi: {
        suggestMedicines: vi.fn().mockResolvedValue([]),
    },
}));

function TestWrapper({ disabled = false }: { disabled?: boolean }) {
    const methods = useForm<any>({
        defaultValues: { prescription: { items: [] } },
    });

    return (
        <FormProvider {...methods}>
            <PrescriptionTable disabled={disabled} />
        </FormProvider>
    );
}

describe("PrescriptionTable", () => {
    it("adds and removes rows", async () => {
        render(<TestWrapper />);

        const addButton = screen.getByRole("button", { name: /Thêm thuốc/i });

        await userEvent.click(addButton);
        expect(screen.getAllByPlaceholderText("Nhập tên thuốc")).toHaveLength(1);

        const deleteButton = screen.getAllByRole("button")[0];
        await userEvent.click(deleteButton);

        expect(screen.queryByPlaceholderText("Nhập tên thuốc")).not.toBeInTheDocument();
    });

    it("auto calculates total quantity", async () => {
        render(<TestWrapper />);

        await userEvent.click(screen.getByRole("button", { name: /Thêm thuốc/i }));

        const dosageInputs = screen.getAllByPlaceholderText("Liều");
        const freqInputs = screen.getAllByPlaceholderText("Lần");
        const dayInputs = screen.getAllByPlaceholderText("Ngày");

        await userEvent.clear(dosageInputs[0]);
        await userEvent.type(dosageInputs[0], "2");
        await userEvent.clear(freqInputs[0]);
        await userEvent.type(freqInputs[0], "3");
        await userEvent.clear(dayInputs[0]);
        await userEvent.type(dayInputs[0], "5");

        await waitFor(() => {
            expect(screen.getByDisplayValue("30")).toBeInTheDocument();
        });
    });

    it("disables inputs when disabled=true", async () => {
        render(<TestWrapper disabled />);

        expect(screen.queryByRole("button", { name: /Thêm thuốc/i })).not.toBeInTheDocument();
    });
});
