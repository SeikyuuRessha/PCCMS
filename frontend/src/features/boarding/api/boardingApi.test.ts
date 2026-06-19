import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosClient from "~/shared/api/axiosClient";
import { boardingApi } from "./boardingApi";

vi.mock("~/shared/api/axiosClient", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

describe("boardingApi care log normalization", () => {
    beforeEach(() => vi.clearAllMocks());

    it("defaults missing media to an empty array for reception care logs", async () => {
        vi.mocked(axiosClient.get).mockResolvedValueOnce([
            {
                id: "log-1",
                sessionId: "session-1",
                logDate: "2026-06-19",
                periodCode: "MORNING",
                feedingStatus: "Đã ăn",
                hygieneStatus: "Sạch sẽ",
                staffId: "staff-1",
                staffName: "Nhân viên",
                createdAt: "2026-06-19T08:00:00+07:00",
            },
        ]);

        const logs = await boardingApi.getReceptionCareLogs("session-1");

        expect(logs).toHaveLength(1);
        expect(logs[0].media).toEqual([]);
        expect(logs[0].media.length).toBe(0);
    });

    it("returns an empty list when the care-log payload is not an array", async () => {
        vi.mocked(axiosClient.get).mockResolvedValueOnce(undefined);

        await expect(boardingApi.getReceptionCareLogs("session-1")).resolves.toEqual([]);
    });
});
