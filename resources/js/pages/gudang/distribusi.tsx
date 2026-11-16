import { Head, Link } from '@inertiajs/react';
import { fmtDate, fmtNum } from '@/components/report-filters';
import { Eye, Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Distribution = {
    id: number;
    distribution_number: string;
    user: { name: string } | null;
    distribution_date: string;
    status: string;
    total_items: number;
};

type Props = {
    distributions: { data: Distribution[] };
};

const tableWrap =
    'overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900';

export default function Distribusi({ distributions }: Props) {
        return (
        <>
            <Head title="Gudang Distribusi" />
            <div className="mx-auto w-full max-w-[1536px] space-y-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Distribusi
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Daftar distribusi barang.
                        </p>
                    </div>
                    <Link href="/distribusi/create">
                        <Button className="bg-brand-500 text-white hover:bg-brand-600">
                            <Plus className="size-4" /> Buat Distribusi
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
                                        'Penerima',
                                        'Tanggal',
                                        'Status',
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
                                {distributions.data.map((d) => (
                                    <tr
                                        key={d.id}
                                        className="border-t border-gray-100 dark:border-gray-800"
                                    >
                                        <td className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                            {d.distribution_number}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {d.user?.name ?? '-'}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {fmtDate(d.distribution_date)}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${d.status === 'POSTED' ? 'bg-emerald-100 text-emerald-700' : d.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}
                                            >
                                                {d.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {fmtNum(d.total_items)}
                                        </td>
                                        <td className="px-5 py-4">
                                            <Link href={`/distribusi/${d.id}`}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                >
                                                    <Eye className="size-4" />
                                                </Button>
                                            </Link>
                                            {d.status === 'POSTED' && (
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/distribusi/${d.id}?edit=1`} aria-label={`Edit ${d.distribution_number}`} title="Edit distribusi">
                                                        <Pencil className="size-4" />
                                                    </Link>
                                                </Button>
                                            )}
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

Distribusi.layout = {
    breadcrumbs: [
        { title: 'Gudang', href: '#' },
        { title: 'Distribusi', href: '/distribusi' },
    ],
};
