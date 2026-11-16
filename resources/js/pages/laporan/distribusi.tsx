import { Head } from '@inertiajs/react';
import { ReportFilters, fmtDate, fmtNum } from '@/components/report-filters';

type Distribution = {
    id: number;
    distribution_number: string;
    recipient_name: string;
    distribution_date: string;
    total_distributed: number;
    total_returned: number;
    remaining: number;
};

type Props = { distributions: Distribution[]; filters?: { start_date?: string; end_date?: string; branch_id?: string }; branches?: { id: number; name: string }[] };

const tableWrap =
    'overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900';

export default function LaporanDistribusi({ distributions, filters, branches }: Props) {

    return (
        <>
            <Head title="Laporan Distribusi" />
            <div className="mx-auto w-full max-w-[1536px] space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                        Laporan Distribusi
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Ringkasan distribusi dan pengembalian barang.
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
                                        'Penerima',
                                        'Tanggal',
                                        'Total Didistribusi',
                                        'Total Dikembalikan',
                                        'Sisa',
                                    ].map((h) => (
                                        <th key={h} className="px-5 py-3">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {distributions.map((d) => (
                                    <tr
                                        key={d.id}
                                        className="border-t border-gray-100 dark:border-gray-800"
                                    >
                                        <td className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                            {d.distribution_number}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {d.recipient_name}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {fmtDate(d.distribution_date)}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {fmtNum(d.total_distributed)}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {fmtNum(d.total_returned)}
                                        </td>
                                        <td className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                            {fmtNum(d.remaining)}
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

LaporanDistribusi.layout = {
    breadcrumbs: [
        { title: 'Laporan', href: '#' },
        { title: 'Distribusi', href: '/laporan/distribusi' },
    ],
};
