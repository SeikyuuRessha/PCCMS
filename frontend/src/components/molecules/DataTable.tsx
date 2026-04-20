import type { ReactNode } from "react";

interface DataTableProps {
    columns: string[];
    rows: ReactNode[][];
}

export function DataTable({ columns, rows }: DataTableProps) {
    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            {columns.map((col) => (
                                <th key={col} className="px-4 py-3 font-medium">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {rows.map((row, idx) => (
                            <tr key={idx} className="align-top">
                                {row.map((cell, cellIdx) => (
                                    <td key={cellIdx} className="px-4 py-3 text-slate-700">
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
