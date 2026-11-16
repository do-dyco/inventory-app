import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { NumberInput } from '@/components/ui/number-input';
import { fmtDate, fmtNum } from '@/components/report-filters';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ReturnItem = {
    id: number;
    quantity: number;
    product: { name: string; sku: string } | null;
};

type ReturnData = {
    id: number;
    return_number: string;
    return_date: string;
    notes: string | null;
    user: { name: string } | null;
    stock_distribution: { distribution_number: string } | null;
    items: ReturnItem[];
};

type Props = { return: ReturnData };

const card =
    'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#1c2434]';

export default function PengembalianShow({ return: r }: Props) {
    const { url } = usePage();
    const [editing, setEditing] = useState(() => new URL(url, 'http://localhost').searchParams.get('edit') === '1');
    const [qtys, setQtys] = useState<Record<number, string>>({});
    function save() {
        router.put(`/pengembalian/${r.id}`, {
            items: r.items.map((it) => ({ id: it.id, quantity: Number(qtys[it.id] ?? it.quantity) })),
        }, { preserveScroll: true, onSuccess: () => { setEditing(false); setQtys({}); } });
    }
    
    return (
        <>
            <Head title="Gudang Pengembalian Detail" />
            <div className="mx-auto w-full max-w-[1536px] space-y-6 p-4 md:p-6">
                <div className="flex items-center gap-3">
                    <Link href="/pengembalian">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                            {r.return_number}
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Detail pengembalian barang.
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {editing ? <>
                        <Button onClick={save}>Simpan</Button>
                        <Button variant="outline" onClick={() => { setEditing(false); setQtys({}); }}>Batal</Button>
                    </> : <Button variant="outline" onClick={() => setEditing(true)}>Edit Jumlah</Button>}
                </div>
                <div className={card}>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <p className="text-xs text-slate-500 uppercase">
                                Pemilik
                            </p>
                            <p className="mt-1 font-medium text-gray-800 dark:text-white/90">
                                {r.user?.name ?? '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase">
                                Distribusi
                            </p>
                            <p className="mt-1 font-medium text-gray-800 dark:text-white/90">
                                {r.stock_distribution?.distribution_number ??
                                    '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase">
                                Tanggal
                            </p>
                            <p className="mt-1 font-medium text-gray-800 dark:text-white/90">
                                {fmtDate(r.return_date)}
                            </p>
                        </div>
                    </div>
                    {r.notes && (
                        <div className="mt-4">
                            <p className="text-xs text-slate-500 uppercase">
                                Catatan
                            </p>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                {r.notes}
                            </p>
                        </div>
                    )}
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase dark:bg-gray-800">
                                <tr>
                                    {['Produk', 'Jumlah Dikembalikan'].map(
                                        (h) => (
                                            <th key={h} className="px-5 py-3">
                                                {h}
                                            </th>
                                        ),
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {r.items.map((it) => (
                                    <tr
                                        key={it.id}
                                        className="border-t border-gray-100 dark:border-gray-800"
                                    >
                                        <td className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                            {it.product?.name ?? '-'}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {editing ? <NumberInput aria-label={`Jumlah pengembalian ${it.product?.name ?? ''}`} value={qtys[it.id] ?? String(it.quantity)} onValueChange={(value) => setQtys((prev) => ({ ...prev, [it.id]: value }))} /> : fmtNum(it.quantity)}
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

PengembalianShow.layout = {
    breadcrumbs: [
        { title: 'Gudang', href: '#' },
        { title: 'Pengembalian', href: '/pengembalian' },
        { title: 'Detail', href: '#' },
    ],
};
