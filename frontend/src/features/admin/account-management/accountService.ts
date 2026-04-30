import { mockAccounts } from "./mockAccounts";
import type { Account, AccountRole, AccountSearchParams, AccountStatus } from "./types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let accountsStore: Account[] = mockAccounts.map((account) => ({ ...account, roles: [...account.roles] }));

export const getAllAccounts = async () => {
    await delay(250);
    return accountsStore.map((account) => ({ ...account, roles: [...account.roles] }));
};

export const searchAccounts = async (params: AccountSearchParams) => {
    await delay(350);
    const fullName = params.fullName?.trim().toLowerCase() ?? "";
    const email = params.email?.trim().toLowerCase() ?? "";
    const phone = params.phone?.trim().toLowerCase() ?? "";
    const role = params.role ?? "";
    const status = params.status ?? "";

    return accountsStore.filter((account) => {
        const matchesFullName = !fullName || account.fullName.toLowerCase().includes(fullName);
        const matchesEmail = !email || account.email.toLowerCase().includes(email);
        const matchesPhone = !phone || account.phone.toLowerCase().includes(phone);
        const matchesRole = !role || account.roles.includes(role as AccountRole);
        const matchesStatus = !status || account.status === status;

        return matchesFullName && matchesEmail && matchesPhone && matchesRole && matchesStatus;
    });
};

export const updateAccountStatus = async (accountId: string, status: AccountStatus) => {
    await delay(300);
    const index = accountsStore.findIndex((account) => account.accountId === accountId);
    if (index === -1) {
        throw new Error("Không tìm thấy tài khoản cần cập nhật trạng thái");
    }

    const updated = { ...accountsStore[index], status };
    accountsStore[index] = updated;
    return { ...updated, roles: [...updated.roles] };
};

export const updateAccountRoles = async (accountId: string, roles: AccountRole[]) => {
    await delay(350);
    const validRoles: AccountRole[] = ["admin", "staff", "doctor", "owner"];
    const uniqueRoles = [...new Set(roles)].filter((role): role is AccountRole => validRoles.includes(role));

    if (uniqueRoles.length === 0) {
        throw new Error("Vai trò không hợp lệ");
    }

    const index = accountsStore.findIndex((account) => account.accountId === accountId);
    if (index === -1) {
        throw new Error("Không tìm thấy tài khoản cần cập nhật vai trò");
    }

    const updated = { ...accountsStore[index], roles: uniqueRoles };
    accountsStore[index] = updated;
    return { ...updated, roles: [...updated.roles] };
};
