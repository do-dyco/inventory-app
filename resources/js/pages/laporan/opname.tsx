import { Head } from '@inertiajs/react';
import { ReportFilters, fmtDate } from '@/components/report-filters';

type Opname = {
    id: number;
    opname_number: string;
    cutoff_at: string;
    status: string;
    surplus_count: number;
    shortage_count: number;
    total_diff: number;
};

type Props = { opnames: Opname[]; filters?: { start_date?: string; end_date?: string; branch_id?: string }; branches?: { id: number; name: string }[] };

const tableWrap =
    'overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900';

const statusBadge: Record<string, string> = {
    DRAFT: 'bg-amber-100 text-amber-700',
    COUNTING: 'bg-blue-100 text-blue-700',
    POSTED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-rose-100 text-rose-700',
};

export default function LaporanOpname({ opnames, filters, branches }: Props) {
    const fmtID = (v: number | string | null | undefined) => Number(v || 0).toLocaleString('id-ID');
    return (
        <>
            <Head title="Laporan Stock Opname" />
            <div className="mx-auto w-full max-w-[1536px] space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                        Laporan Stock Opname
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Ringkasan hasil stock opname.
                    </p>
                </div>

                <ReportFilters filters={filters} branches={branches} />

                <div className={tableWrap}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase dark:bg-gray-800">
                                <tr>
                                    {[
                                        'Nomor',
                                        'Cut-off',
                                        'Status',
                                        'Surplus',
                                        'Shortage',
                                        'Total Selisih',
                                    ].map((h) => (
                                        <th key={h} className="px-5 py-3">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {opnames.map((o) => (
                                    <tr
                                        key={o.id}
                                        className="border-t border-gray-100 dark:border-gray-800"
                                    >
                                        <td className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                            {o.opname_number}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {fmtDate(o.cutoff_at)}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadge[o.status] ?? 'bg-slate-100 text-slate-700'}`}
                                            >
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-blue-600 dark:text-blue-400">
                                            {fmtID(o.surplus_count)}
                                        </td>
                                        <td className="px-5 py-4 text-rose-600 dark:text-rose-400">
                                            {fmtID(o.shortage_count)}
                                        </td>
                                        <td className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                            {fmtID(o.total_diff)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

LaporanOpname.layout = {
    breadcrumbs: [
        { title: 'Laporan', href: '#' },
        { title: 'Stock Opname', href: '/laporan/opname' },
    ],
};
