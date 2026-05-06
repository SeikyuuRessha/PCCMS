import { Button, Tag } from "~/components/atoms";
import { Card } from "~/components/molecules";
import type { Account, AccountRole } from "../types";
import { accountRoleLabels } from "../mockAccounts";

interface AccountRolesDialogProps {
    account: Account | null;
    value: AccountRole[];
    open: boolean;
    loading: boolean;
    error?: string;
    onClose: () => void;
    onToggleRole: (role: AccountRole) => void;
    onConfirm: () => void;
}

const roleOptions: AccountRole[] = ["admin", "staff", "doctor", "owner"];

export function AccountRolesDialog({
    account,
    value,
    open,
    loading,
    error,
    onClose,
    onToggleRole,
    onConfirm,
}: AccountRolesDialogProps) {
    if (!open || !account) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-xl">
                <Card title="Phân vai trò người dùng" subtitle="Thêm hoặc gỡ vai trò cho tài khoản">
                    <div className="space-y-4">
                        <div className="grid gap-3 text-sm sm:grid-cols-2">
                            <div>
                                <p className="text-slate-500">Mã tài khoản</p>
                                <p className="font-medium text-slate-900">{account.accountId}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Họ tên</p>
                                <p className="font-medium text-slate-900">{account.fullName}</p>
                            </div>
                        </div>

                        <div>
                            <p className="mb-2 text-sm font-medium text-slate-700">Vai trò hiện tại</p>
                            <div className="flex flex-wrap gap-2">
                                {value.length > 0 ? (
                                    value.map((role) => (
                                        <Tag key={role} tone="blue">
                                            {accountRoleLabels[role]}
                                        </Tag>
                                    ))
                                ) : (
                                    <p className="text-sm text-error-600">Chưa có vai trò hợp lệ</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <p className="mb-2 text-sm font-medium text-slate-700">Chọn vai trò</p>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {roleOptions.map((role) => {
                                    const checked = value.includes(role);
                                    return (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => onToggleRole(role)}
                                            className={`rounded-2xl border px-4 py-3 text-left transition ${
                                                checked
                                                    ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                                                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="font-medium">{accountRoleLabels[role]}</span>
                                                <span className="text-xs">{checked ? "Đã chọn" : "Chưa chọn"}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {error && <p className="text-sm font-medium text-error-600">{error}</p>}

                        <div className="flex flex-wrap justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={onClose} disabled={loading}>
                                Hủy
                            </Button>
                            <Button onClick={onConfirm} disabled={loading}>
                                {loading ? "Đang lưu..." : "Lưu"}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
