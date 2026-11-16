import { Head, Link } from '@inertiajs/react';
import { fmtDate, fmtNum } from '@/components/report-filters';
import { Eye, Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Return = {
    id: number;
    return_number: string;
    stock_distribution: { distribution_number: string } | null;
    return_date: string;
    total_items: number;
};

type Props = { returns: { data: Return[] } };

const tableWrap =
    'overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900';

export default function Pengembalian({ returns }: Props) {
        return (
        <>
            <Head title="Gudang Pengembalian" />
            <div className="mx-auto w-full max-w-[1536px] space-y-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Pengembalian
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Daftar pengembalian barang.
                        </p>
                    </div>
                    <Link href="/pengembalian/create">
                        <Button className="bg-brand-500 text-white hover:bg-brand-600">
                            <Plus className="size-4" /> Buat Pengembalian
                        </Button>
                    </Link>
                </div>

                <div className={tableWrap}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase dark:bg-gray-800">
                                <tr>
                                    {[
                                        'Nomor',
                                        'Distribusi',
                                        'Tanggal',
                                        'Total Item',
                                        'Aksi',
                                    ].map((h) => (
                                        <th key={h} className="px-5 py-3">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {returns.data.map((r) => (
                                    <tr
                                        key={r.id}
                                        className="border-t border-gray-100 dark:border-gray-800"
                                    >
                                        <td className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                            {r.return_number}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {r.stock_distribution
                                                ?.distribution_number ?? '-'}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {fmtDate(r.return_date)}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {fmtNum(r.total_items)}
                                        </td>
                                        <td className="px-5 py-4">
                                            <Link href={`/pengembalian/${r.id}`}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                >
                                                    <Eye className="size-4" />
                                                </Button>
                                            </Link>
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/pengembalian/${r.id}?edit=1`} aria-label={`Edit ${r.return_number}`} title="Edit pengembalian">
                                                    <Pencil className="size-4" />
                                                </Link>
                                            </Button>
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

Pengembalian.layout = {
    breadcrumbs: [
        { title: 'Gudang', href: '#' },
        { title: 'Pengembalian', href: '/pengembalian' },
    ],
};
