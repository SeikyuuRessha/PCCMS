import { Button, Select } from "~/components/atoms";
import { Card } from "~/components/molecules";
import type { Account, AccountStatus } from "../types";
import { accountStatusLabels } from "../mockAccounts";

interface AccountStatusDialogProps {
    account: Account | null;
    value: AccountStatus;
    open: boolean;
    loading: boolean;
    error?: string;
    onClose: () => void;
    onChange: (value: AccountStatus) => void;
    onConfirm: () => void;
}

export function AccountStatusDialog({
    account,
    value,
    open,
    loading,
    error,
    onClose,
    onChange,
    onConfirm,
}: AccountStatusDialogProps) {
    if (!open || !account) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-lg">
                <Card title="Cập nhật trạng thái tài khoản" subtitle="Chọn trạng thái mới cho tài khoản đang được quản lý">
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
                            <div>
                                <p className="text-slate-500">Trạng thái hiện tại</p>
                                <p className="font-medium text-slate-900">{accountStatusLabels[account.status]}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-medium text-slate-700">Trạng thái mới</label>
                            <select
                                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                value={value}
                                onChange={(e) => onChange(e.target.value as AccountStatus)}
                            >
                                <option value="active">{accountStatusLabels.active}</option>
                                <option value="locked">{accountStatusLabels.locked}</option>
                            </select>
                        </div>

                        {error && <p className="text-sm font-medium text-error-600">{error}</p>}

                        <div className="flex flex-wrap justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={onClose} disabled={loading}>
                                Hủy
                            </Button>
                            <Button onClick={onConfirm} disabled={loading}>
                                {loading ? "Đang cập nhật..." : "Xác nhận"}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
