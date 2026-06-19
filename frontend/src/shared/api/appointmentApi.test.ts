import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosClient from "~/shared/api/axiosClient";
import { appointmentApi } from "./appointmentApi";

vi.mock("~/shared/api/axiosClient", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
    },
}));

describe("appointmentApi response normalization", () => {
    beforeEach(() => vi.clearAllMocks());

    it("defaults missing customer pets to an empty array", async () => {
        vi.mocked(axiosClient.get).mockResolvedValueOnce({
            ownerId: "owner-1",
            ownerName: "Nguyen Van A",
            phone: "0900000000",
        });

        const result = await appointmentApi.lookupCustomer("0900000000");

        expect(result.pets).toEqual([]);
        expect(result.pets.length).toBe(0);
    });
});
