import { Head } from '@inertiajs/react';
import { ReportFilters, fmtDate, fmtNum } from '@/components/report-filters';

type ReturnRow = {
    id: number;
    return_number: string;
    return_date: string;
    distribution_number: string | null;
    user_name: string | null;
    product_name: string | null;
    quantity: number;
};
type Props = { returns: ReturnRow[]; filters?: { start_date?: string; end_date?: string; branch_id?: string }; branches?: { id: number; name: string }[] };

const tableWrap = 'overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900';

export default function LaporanPengembalian({ returns, filters, branches }: Props) {
    return <>
        <Head title="Laporan Pengembalian" />
        <div className="mx-auto w-full max-w-[1536px] space-y-6 p-4 md:p-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Laporan Pengembalian</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">History barang yang dikembalikan.</p>
            </div>
            <ReportFilters filters={filters} branches={branches} />
            <div className={tableWrap}><div className="overflow-x-auto"><table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase dark:bg-gray-800"><tr>{['Nomor','Tanggal','Distribusi','User','Barang','Jumlah'].map((h) => <th key={h} className="px-5 py-3">{h}</th>)}</tr></thead>
                <tbody>{returns.map((r) => <tr key={r.id} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="px-5 py-4 font-medium">{r.return_number}</td><td className="px-5 py-4">{fmtDate(r.return_date)}</td><td className="px-5 py-4">{r.distribution_number ?? '-'}</td><td className="px-5 py-4">{r.user_name ?? '-'}</td><td className="px-5 py-4">{r.product_name ?? '-'}</td><td className="px-5 py-4">{fmtNum(r.quantity)}</td>
                </tr>)}</tbody>
            </table></div></div>
        </div>
    </>;
}

LaporanPengembalian.layout = { breadcrumbs: [{ title: 'Laporan', href: '#' }, { title: 'Pengembalian', href: '/laporan/pengembalian' }] };
