import { Head, Link, router } from '@inertiajs/react';
import { fmtDate, fmtNum } from '@/components/report-filters';
import { Eye, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Opname = {
    id: number;
    opname_number: string;
    cutoff_at: string;
    status: string;
    creator: { name: string } | null;
    poster: { name: string } | null;
    items_count: number;
};

type Props = {
    opnames: { data: Opname[] };
};

const tableWrap =
    'overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900';

const statusBadge: Record<string, string> = {
    DRAFT: 'bg-amber-100 text-amber-700',
    COUNTING: 'bg-blue-100 text-blue-700',
    POSTED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-rose-100 text-rose-700',
};

export default function Opname({ opnames }: Props) {
        function createSession() {
        router.post('/opname', {}, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Gudang Stock Opname" />
            <div className="mx-auto w-full max-w-[1536px] space-y-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Stock Opname
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Daftar sesi stock opname.
                        </p>
                    </div>
                    <Button
                        onClick={createSession}
                        className="bg-brand-500 text-white hover:bg-brand-600"
                    >
                        <Plus className="size-4" /> Buat Sesi Baru
                    </Button>
                </div>

                <div className={tableWrap}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase dark:bg-gray-800">
                                <tr>
                                    {[
                                        'Nomor',
                                        'Cut-off',
                                        'Status',
                                        'Jumlah Barang',
                                        'Pembuat',
                                        'Aksi',
                                    ].map((h) => (
                                        <th key={h} className="px-5 py-3">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {opnames.data.map((o) => (
                                    <tr
                                        key={o.id}
                                        className="border-t border-gray-100 dark:border-gray-800"
                                    >
                                        <td className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                            {o.opname_number}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {fmtDate(o.cutoff_at, true)}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadge[o.status] ?? 'bg-slate-100 text-slate-700'}`}
                                            >
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {fmtNum(o.items_count)}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {o.creator?.name ?? '-'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <Link href={`/opname/${o.id}`}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                >
                                                    <Eye className="size-4" />
                                                </Button>
                                            </Link>
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

Opname.layout = {
    breadcrumbs: [
        { title: 'Gudang', href: '#' },
        { title: 'Stock Opname', href: '/opname' },
    ],
};
