import { Button, Tag } from "~/components/atoms";
import { Card, EmptyState } from "~/components/molecules";
import type { Account } from "../types";
import { accountRoleLabels, accountStatusLabels } from "../mockAccounts";

interface AccountTableProps {
    accounts: Account[];
    loading: boolean;
    onChangeStatus: (account: Account) => void;
    onChangeRoles: (account: Account) => void;
}

export function AccountTable({ accounts, loading, onChangeStatus, onChangeRoles }: AccountTableProps) {
    return (
        <Card title="Danh sách tài khoản" subtitle="Kết quả phù hợp với điều kiện tìm kiếm">
            {loading ? (
                <div className="py-12 text-center text-sm text-slate-500">Đang tải dữ liệu...</div>
            ) : accounts.length === 0 ? (
                <EmptyState
                    title="Không có dữ liệu"
                    description="Không tìm thấy thông tin người dùng nào thoả mãn tiêu chí tìm kiếm"
                    className="border-none bg-transparent p-6"
                />
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-slate-200 text-slate-500">
                            <tr>
                                {[
                                    "Mã tài khoản",
                                    "Họ tên",
                                    "Email",
                                    "Số điện thoại",
                                    "Vai trò",
                                    "Trạng thái",
                                    "Hành động",
                                ].map((header) => (
                                    <th key={header} className="px-3 py-3 font-medium whitespace-nowrap">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {accounts.map((account) => (
                                <tr key={account.accountId} className="align-top">
                                    <td className="whitespace-nowrap px-3 py-4 font-medium text-slate-900">{account.accountId}</td>
                                    <td className="whitespace-nowrap px-3 py-4">{account.fullName}</td>
                                    <td className="whitespace-nowrap px-3 py-4">{account.email}</td>
                                    <td className="whitespace-nowrap px-3 py-4">{account.phone}</td>
                                    <td className="px-3 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {account.roles.map((role) => (
                                                <Tag key={role} tone="blue">{accountRoleLabels[role]}</Tag>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <Tag tone={account.status === "active" ? "green" : "red"}>
                                            {accountStatusLabels[account.status]}
                                        </Tag>
                                    </td>
                                    <td className="px-3 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            <Button variant="outline" className="px-3 py-1.5 text-xs" onClick={() => onChangeStatus(account)}>
                                                Đổi trạng thái
                                            </Button>
                                            <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => onChangeRoles(account)}>
                                                Phân vai trò
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
}
