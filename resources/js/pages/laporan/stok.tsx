import { Head } from '@inertiajs/react';
import { ReportFilters } from '@/components/report-filters';

type Product = {
    id: number;
    sku: string;
    name: string;
    unit: { code: string } | null;
    stock_balance: { quantity: number } | null;
    minimum_stock: number;
    movements: { in: number; out: number } | null;
};

type Props = { products: Product[]; filters?: { start_date?: string; end_date?: string; branch_id?: string }; branches?: { id: number; name: string }[] };

const tableWrap =
    'overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900';

export default function LaporanStok({ products, filters, branches }: Props) {
    const fmtID = (v: number | string | null | undefined) => Number(v || 0).toLocaleString('id-ID');

    function stockStatus(p: Product) {
        const qty = p.stock_balance?.quantity ?? 0;
        if (qty <= 0)
            return { label: 'Habis', cls: 'bg-rose-100 text-rose-700' };
        if (qty <= p.minimum_stock)
            return { label: 'Menipis', cls: 'bg-amber-100 text-amber-700' };
        return { label: 'Aman', cls: 'bg-emerald-100 text-emerald-700' };
    }

    return (
        <>
            <Head title="Laporan Stok" />
            <div className="mx-auto w-full max-w-[1536px] space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                        Laporan Stok
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Ringkasan stok dan pergerakan barang.
                    </p>
                </div>

                <ReportFilters filters={filters} branches={branches} />

                <div className={tableWrap}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase dark:bg-gray-800">
                                <tr>
                                    {[
                                        'SKU',
                                        'Nama',
                                        'Satuan',
                                        'Stok',
                                        'Min. Stok',
                                        'Total Masuk',
                                        'Total Keluar',
                                        'Status',
                                    ].map((h) => (
                                        <th key={h} className="px-5 py-3">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p) => {
                                    const s = stockStatus(p);
                                    return (
                                        <tr
                                            key={p.id}
                                            className="border-t border-gray-100 dark:border-gray-800"
                                        >
                                            <td className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                                {p.sku}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                                {p.name}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                                {p.unit?.code ?? '-'}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                                {fmtID(
                                                    p.stock_balance?.quantity ??
                                                        0,
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                                {fmtID(p.minimum_stock)}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                                {fmtID(p.movements?.in ?? 0)}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                                {fmtID(p.movements?.out ?? 0)}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-medium ${s.cls}`}
                                                >
                                                    {s.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

LaporanStok.layout = {
    breadcrumbs: [
        { title: 'Laporan', href: '#' },
        { title: 'Stok', href: '/laporan/stok' },
    ],
};
