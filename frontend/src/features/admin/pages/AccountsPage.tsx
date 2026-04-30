import { useMemo, useState } from "react";
import { AccountFilters } from "../account-management/components/AccountFilters";
import { AccountRolesDialog } from "../account-management/components/AccountRolesDialog";
import { AccountStatusDialog } from "../account-management/components/AccountStatusDialog";
import { AccountSummaryCards } from "../account-management/components/AccountSummaryCards";
import { AccountTable } from "../account-management/components/AccountTable";
import { accountRoleLabels, accountStatusLabels, mockAccounts } from "../account-management/mockAccounts";
import { searchAccounts, updateAccountRoles, updateAccountStatus } from "../account-management/accountService";
import type { Account, AccountRole, AccountSearchParams, AccountStatus } from "../account-management/types";
import { EmptyState } from "~/components/molecules";

const initialFilters: AccountSearchParams = {
    fullName: "",
    email: "",
    phone: "",
    role: "",
    status: "",
};

export function AccountsPage() {
    const [filters, setFilters] = useState<AccountSearchParams>(initialFilters);
    const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
    const [loading, setLoading] = useState(false);
    const [pageError, setPageError] = useState("");
    const [statusError, setStatusError] = useState("");
    const [roleError, setRoleError] = useState("");
    const [selectedStatusAccount, setSelectedStatusAccount] = useState<Account | null>(null);
    const [selectedRoleAccount, setSelectedRoleAccount] = useState<Account | null>(null);
    const [statusValue, setStatusValue] = useState<AccountStatus>("active");
    const [roleValues, setRoleValues] = useState<AccountRole[]>([]);
    const [statusDialogLoading, setStatusDialogLoading] = useState(false);
    const [roleDialogLoading, setRoleDialogLoading] = useState(false);
    const [feedback, setFeedback] = useState("");

    const summary = useMemo(() => {
        const byRole = {
            admin: 0,
            staff: 0,
            doctor: 0,
            owner: 0,
        };

        accounts.forEach((account) => {
            account.roles.forEach((role) => {
                byRole[role] += 1;
            });
        });

        return {
            total: accounts.length,
            active: accounts.filter((account) => account.status === "active").length,
            locked: accounts.filter((account) => account.status === "locked").length,
            byRole,
        };
    }, [accounts]);

    const handleSearch = async () => {
        const hasCriteria = [filters.fullName, filters.email, filters.phone, filters.role, filters.status].some(
            (value) => Boolean(String(value ?? "").trim())
        );

        if (!hasCriteria) {
            setPageError("Cần nhập ít nhất một tiêu chí tìm kiếm");
            setFeedback("");
            return;
        }

        setPageError("");
        setLoading(true);
        setFeedback("");
        try {
            const result = await searchAccounts(filters);
            setAccounts(result);
            if (result.length === 0) {
                setFeedback("Không tìm thấy thông tin người dùng nào thoả mãn tiêu chí tìm kiếm");
            }
        } catch {
            setPageError("Tìm kiếm tài khoản thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        setFilters(initialFilters);
        setPageError("");
        setFeedback("");
        setLoading(true);
        try {
            const result = await searchAccounts(initialFilters);
            setAccounts(result);
        } finally {
            setLoading(false);
        }
    };

    const openStatusDialog = (account: Account) => {
        setSelectedStatusAccount(account);
        setStatusValue(account.status);
        setStatusError("");
    };

    const openRoleDialog = (account: Account) => {
        setSelectedRoleAccount(account);
        setRoleValues(account.roles);
        setRoleError("");
    };

    const confirmStatusChange = async () => {
        if (!selectedStatusAccount) {
            setStatusError("Không tìm thấy tài khoản cần cập nhật trạng thái");
            return;
        }

        setStatusDialogLoading(true);
        setStatusError("");
        try {
            const updated = await updateAccountStatus(selectedStatusAccount.accountId, statusValue);
            setAccounts((current) => current.map((item) => (item.accountId === updated.accountId ? updated : item)));
            setSelectedStatusAccount(null);
            setFeedback("Cập nhật trạng thái tài khoản thành công");
        } catch (error) {
            setStatusError(error instanceof Error ? error.message : "Cập nhật trạng thái thất bại");
        } finally {
            setStatusDialogLoading(false);
        }
    };

    const toggleRole = (role: AccountRole) => {
        setRoleValues((current) =>
            current.includes(role) ? current.filter((item) => item !== role) : [...current, role]
        );
    };

    const confirmRoleChange = async () => {
        if (!selectedRoleAccount) {
            setRoleError("Không tìm thấy tài khoản cần cập nhật vai trò");
            return;
        }

        if (roleValues.length === 0) {
            setRoleError("Vai trò không hợp lệ");
            return;
        }

        setRoleDialogLoading(true);
        setRoleError("");
        try {
            const updated = await updateAccountRoles(selectedRoleAccount.accountId, roleValues);
            setAccounts((current) => current.map((item) => (item.accountId === updated.accountId ? updated : item)));
            setSelectedRoleAccount(null);
            setFeedback("Cập nhật vai trò người dùng thành công");
        } catch (error) {
            setRoleError(error instanceof Error ? error.message : "Cập nhật vai trò thất bại");
        } finally {
            setRoleDialogLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Quản lý tài khoản</h2>
                <p className="text-sm text-slate-500">Tìm kiếm, cập nhật trạng thái và phân vai trò người dùng trong hệ thống.</p>
            </div>

            <AccountSummaryCards {...summary} />

            <AccountFilters
                value={filters}
                onChange={setFilters}
                onSearch={handleSearch}
                onReset={handleReset}
                loading={loading}
                error={pageError}
            />

            {feedback && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {feedback}
                </div>
            )}

            <AccountTable
                accounts={accounts}
                loading={loading}
                onChangeStatus={openStatusDialog}
                onChangeRoles={openRoleDialog}
            />

            <AccountStatusDialog
                account={selectedStatusAccount}
                value={statusValue}
                open={Boolean(selectedStatusAccount)}
                loading={statusDialogLoading}
                error={statusError}
                onClose={() => setSelectedStatusAccount(null)}
                onChange={setStatusValue}
                onConfirm={confirmStatusChange}
            />

            <AccountRolesDialog
                account={selectedRoleAccount}
                value={roleValues}
                open={Boolean(selectedRoleAccount)}
                loading={roleDialogLoading}
                error={roleError}
                onClose={() => setSelectedRoleAccount(null)}
                onToggleRole={toggleRole}
                onConfirm={confirmRoleChange}
            />
        </div>
    );
}
