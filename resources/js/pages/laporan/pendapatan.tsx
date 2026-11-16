import { Head } from '@inertiajs/react';
import { ReportFilters, fmtCurrency, fmtDate, fmtNum } from '@/components/report-filters';

type Income = {
    id: number;
    income_date: string;
    amount: string | number;
    payment_method: string;
    notes: string | null;
    user: { name: string } | null;
    branch: { name: string } | null;
};

type Expense = {
    id: number;
    date: string;
    distribution_number: string;
    recipient_name: string | null;
    product_name: string | null;
    quantity: number;
    unit_price: number;
    subtotal: number;
};

type Props = {
    incomes: Income[];
    filters?: { start_date?: string; end_date?: string; branch_id?: string };
    branches?: { id: number; name: string }[];
    summary: { revenue: number; capital: number; profit: number };
    expenses: Expense[];
};

const tableWrap =
    'overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900';

const card =
    'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#1c2434]';
const detailsBtn = 'cursor-pointer select-none px-5 py-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800 [&::-webkit-details-marker]:hidden';

export default function LaporanPendapatan({ incomes, filters, branches, summary, expenses }: Props) {
    return (
        <>
            <Head title="Laporan Pendapatan" />
            <div className="mx-auto w-full max-w-[1536px] space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                        Laporan Pendapatan
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Ringkasan pendapatan harian.
                    </p>
                </div>

                <ReportFilters filters={filters} branches={branches} />

                <div className="grid gap-4 md:grid-cols-3">
                    <div className={card}>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Pemasukan</span>
                        <p className="mt-1 text-2xl font-semibold text-brand-500">{fmtCurrency(summary.revenue)}</p>
                    </div>
                    <div className={card}>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Modal (barang keluar)</span>
                        <p className="mt-1 text-2xl font-semibold text-amber-500">{fmtCurrency(summary.capital)}</p>
                    </div>
                    <div className={card}>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Laba</span>
                        <p className={`mt-1 text-2xl font-semibold ${summary.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {fmtCurrency(summary.profit)}
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <details className={tableWrap} open>
                        <summary className={detailsBtn}>Detail Rincian Pemasukan ({fmtNum(incomes.length)})</summary>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase dark:bg-gray-800">
                                <tr>
                                    {['Tanggal', 'User', 'Cabang', 'Jumlah', 'Metode', 'Catatan'].map((h) => (
                                        <th key={h} className="px-5 py-3">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {incomes.map((i) => (
                                    <tr key={i.id} className="border-t border-gray-100 dark:border-gray-800">
                                        <td className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{fmtDate(i.income_date)}</td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{i.user?.name ?? '-'}</td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{i.branch?.name ?? '-'}</td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{fmtCurrency(i.amount)}</td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{i.payment_method}</td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{i.notes ?? '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </details>

                <details className={tableWrap} open>
                    <summary className={detailsBtn}>Detail Rincian Pengeluaran / Modal ({fmtNum(expenses.length)})</summary>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase dark:bg-gray-800">
                                <tr>
                                    {['Tanggal', 'No. Distribusi', 'Penerima', 'Barang', 'Jumlah', 'Harga', 'Subtotal'].map((h) => (
                                        <th key={h} className="px-5 py-3">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((e) => (
                                    <tr key={e.id} className="border-t border-gray-100 dark:border-gray-800">
                                        <td className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{fmtDate(e.date)}</td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{e.distribution_number}</td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{e.recipient_name ?? '-'}</td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{e.product_name ?? '-'}</td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{fmtNum(e.quantity)}</td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{fmtCurrency(e.unit_price)}</td>
                                        <td className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{fmtCurrency(e.subtotal)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </details>
                </div>
            </div>
        </>
    );
}

LaporanPendapatan.layout = {
    breadcrumbs: [
        { title: 'Laporan', href: '#' },
        { title: 'Pendapatan', href: '/laporan/pendapatan' },
    ],
};
