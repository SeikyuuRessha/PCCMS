import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "~/api/api";
import {
    getWorkScheduleOptions,
    previewWeeklySchedulePlan,
} from "./workScheduleService";

vi.mock("~/api/api", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
    getApiData: (response: unknown) => response,
    getPageContent: (payload: unknown) => (Array.isArray(payload) ? payload : []),
}));

describe("workScheduleService response normalization", () => {
    beforeEach(() => vi.clearAllMocks());

    it("defaults missing option payloads to empty arrays", async () => {
        vi.mocked(api.get)
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce({ invalid: true })
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(undefined);

        await expect(getWorkScheduleOptions()).resolves.toEqual({
            staff: [],
            shifts: [],
            roles: [],
            examRooms: [],
            groomingStations: [],
        });
    });

    it("defaults missing weekly plan items and counters", async () => {
        vi.mocked(api.post).mockResolvedValueOnce({});

        await expect(
            previewWeeklySchedulePlan({
                sourceWeekStart: "2026-06-15",
                targetWeekStart: "2026-06-22",
            }),
        ).resolves.toEqual({
            createdCount: 0,
            skippedCount: 0,
            items: [],
        });
    });
});
