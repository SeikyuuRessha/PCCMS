import api, { getApiData, getPageContent } from "~/api/api";
import { mockAccounts } from "./mockAccounts";
import type { Account, AccountRole, AccountSearchParams, AccountStatus } from "./types";

type BackendAccountStatus = "UNVERIFIED" | "ACTIVE" | "LOCKED" | "DISABLED";
type BackendAccountRole = "ADMIN" | "STAFF" | "VETERINARIAN" | "OWNER" | string;

interface BackendAccount {
    id: string;
    email: string;
    phone?: string;
    fullName?: string;
    roleCode?: BackendAccountRole;
    roleName?: string;
    roles?: BackendAccountRole[];
    statusCode: BackendAccountStatus;
    createdAt?: string;
    updatedAt?: string;
}

const roleToBackend: Record<AccountRole, string> = {
    admin: "ADMIN",
    staff: "STAFF",
    doctor: "VETERINARIAN",
    owner: "OWNER",
};

const roleFromBackend = (role?: BackendAccountRole): AccountRole => {
    switch (role) {
        case "ADMIN":
            return "admin";
        case "STAFF":
            return "staff";
        case "VETERINARIAN":
            return "doctor";
        default:
            return "owner";
    }
};

const statusToBackend: Record<AccountStatus, BackendAccountStatus> = {
    active: "ACTIVE",
    locked: "LOCKED",
    disabled: "DISABLED",
    unverified: "UNVERIFIED",
};

const statusFromBackend = (status: BackendAccountStatus): AccountStatus => {
    switch (status) {
        case "ACTIVE":
            return "active";
        case "LOCKED":
            return "locked";
        case "DISABLED":
            return "disabled";
        default:
            return "unverified";
    }
};

const fallbackAccounts = () => mockAccounts.map((account) => ({ ...account, roles: [...account.roles] }));

function toAccount(account: BackendAccount): Account {
    const roles = account.roles?.length
        ? account.roles.map(roleFromBackend)
        : [roleFromBackend(account.roleCode)];
    return {
        accountId: account.id,
        fullName: account.fullName ?? "",
        email: account.email,
        phone: account.phone ?? "",
        roles,
        status: statusFromBackend(account.statusCode),
        createdAt: account.createdAt ?? "",
        updatedAt: account.updatedAt,
        roleCode: account.roleCode,
        roleName: account.roleName,
    };
}

export const getAllAccounts = async () => fallbackAccounts();

export const searchAccounts = async (params: AccountSearchParams) => {
    const keyword = [params.fullName, params.email, params.phone]
        .map((value) => value?.trim())
        .filter(Boolean)
        .join(" ");
    const query = {
        keyword: keyword || undefined,
        role: params.role ? roleToBackend[params.role] : undefined,
        status: params.status ? statusToBackend[params.status] : undefined,
        page: 0,
        size: 20,
    };

    try {
        const response = await api.get("/admin/accounts", { params: query });
        const payload = getApiData<unknown>(response);
        return getPageContent<BackendAccount>(payload).map(toAccount);
    } catch (error) {
        if (import.meta.env.DEV) {
            return fallbackAccounts();
        }
        throw error;
    }
};

export const updateAccountStatus = async (accountId: string, status: AccountStatus) => {
    const response = await api.patch(`/admin/accounts/${accountId}/status`, {
        statusCode: statusToBackend[status],
    });
    return toAccount(getApiData<BackendAccount>(response));
};

export const updateAccountRoles = async (accountId: string, roles: AccountRole[]) => {
    const roleCode = roleToBackend[roles[0] ?? "staff"];
    const response = await api.patch(`/admin/accounts/${accountId}/role`, { roleCode });
    return toAccount(getApiData<BackendAccount>(response));
};
