import { Head, Link, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { fmtDate, fmtNum } from '@/components/report-filters';
import { ArrowLeft, Pencil, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { NumberInput } from '@/components/ui/number-input';

type DistributionItem = {
    id: number;
    quantity: number;
    returned_quantity: number;
    product: {
        name: string;
        sku: string;
        stock_balance?: { quantity: number } | null;
    } | null;
};

type Distribution = {
    id: number;
    distribution_number: string;
    distribution_date: string;
    status: string;
    notes: string | null;
    user: { name: string } | null;
    creator: { name: string } | null;
    items: DistributionItem[];
    returns: { id: number; return_number: string }[];
};

type Props = { distribution: Distribution };

const card =
    'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#1c2434]';

export default function DistribusiShow({ distribution }: Props) {
        const d = distribution;
    const { url } = usePage();
    const [editing, setEditing] = useState(() => d.status === 'POSTED' && new URL(url, 'http://localhost').searchParams.get('edit') === '1');
    const [qtys, setQtys] = useState<Record<number, string>>({});

    function cancel() {
        if (confirm('Batalkan distribusi ini?')) {
            router.patch(
                `/distribusi/${d.id}/cancel`,
                {},
                { preserveScroll: true },
            );
        }
    }

    function saveQty() {
        router.put(
            `/distribusi/${d.id}`,
            {
                items: d.items.map((it) => ({
                    id: it.id,
                    quantity: Number(qtys[it.id] ?? it.quantity),
                })),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditing(false);
                    setQtys({});
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] ?? 'Gagal menyimpan jumlah.');
                },
            },
        );
    }

    const canCancel = d.status === 'POSTED' && d.returns.length === 0;
    const canEdit = d.status === 'POSTED';

    return (
        <>
            <Head title="Gudang Distribusi Detail" />
            <div className="mx-auto w-full max-w-[1536px] space-y-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/distribusi">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                                {d.distribution_number}
                            </h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Detail distribusi barang.
                            </p>
                        </div>
                    </div>
                    {canEdit && !editing && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                setQtys(
                                    Object.fromEntries(
                                        d.items.map((it) => [
                                            it.id,
                                            String(it.quantity),
                                        ]),
                                    ),
                                );
                                setEditing(true);
                            }}
                        >
                            <Pencil className="size-4" /> Edit Jumlah
                        </Button>
                    )}
                    {editing && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setEditing(false);
                                    setQtys({});
                                }}
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={saveQty}
                                className="bg-brand-500 text-white hover:bg-brand-600"
                            >
                                Simpan
                            </Button>
                        </div>
                    )}
                    {canCancel && (
                        <Button
                            variant="outline"
                            onClick={cancel}
                            className="text-rose-600 hover:bg-rose-50"
                        >
                            <XCircle className="size-4" /> Batalkan
                        </Button>
                    )}
                </div>

                <div className={card}>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div>
                            <p className="text-xs text-slate-500 uppercase">
                                Penerima
                            </p>
                            <p className="mt-1 font-medium text-gray-800 dark:text-white/90">
                                {d.user?.name ?? '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase">
                                Tanggal
                            </p>
                            <p className="mt-1 font-medium text-gray-800 dark:text-white/90">
                                {fmtDate(d.distribution_date)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase">
                                Dibuat oleh
                            </p>
                            <p className="mt-1 font-medium text-gray-800 dark:text-white/90">
                                {d.creator?.name ?? '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase">
                                Status
                            </p>
                            <span
                                className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${d.status === 'POSTED' ? 'bg-emerald-100 text-emerald-700' : d.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}
                            >
                                {d.status}
                            </span>
                        </div>
                    </div>
                    {d.notes && (
                        <div className="mt-4">
                            <p className="text-xs text-slate-500 uppercase">
                                Catatan
                            </p>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                {d.notes}
                            </p>
                        </div>
                    )}
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase dark:bg-gray-800">
                                <tr>
                                    {[
                                        'Produk',
                                        'Jumlah',
                                        'Dikembalikan',
                                        'Sisa',
                                    ].map((h) => (
                                        <th key={h} className="px-5 py-3">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {d.items.map((it) => (
                                    <tr
                                        key={it.id}
                                        className="border-t border-gray-100 dark:border-gray-800"
                                    >
                                        <td className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                            {it.product?.name ?? '-'}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {editing ? (
                                                <NumberInput
                                                    className="w-24"
                                                    min="1"
                                                    value={qtys[it.id] ?? ''}
                                                    onValueChange={(v) =>
                                                        setQtys({
                                                            ...qtys,
                                                            [it.id]: v,
                                                        })
                                                    }
                                                />
                                            ) : (
                                                fmtNum(it.quantity)
                                            )}
                                            {editing &&
                                                it.product?.stock_balance && (
                                                    <span className="ml-2 text-xs text-gray-400">
                                                        stok gudang:{' '}
                                                        {fmtNum(
                                                            it.product
                                                                .stock_balance
                                                                .quantity,
                                                        )}
                                                    </span>
                                                )}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {fmtNum(it.returned_quantity)}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {fmtNum(it.quantity - it.returned_quantity)}
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

DistribusiShow.layout = {
    breadcrumbs: [
        { title: 'Gudang', href: '#' },
        { title: 'Distribusi', href: '/distribusi' },
        { title: 'Detail', href: '#' },
    ],
};
