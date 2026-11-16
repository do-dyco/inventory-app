import { Head, router } from '@inertiajs/react';
import { fmtDate, fmtNum } from '@/components/report-filters';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';

type OpnameItem = {
    id: number;
    product: {
        sku: string;
        name: string;
        unit: { code: string } | null;
    } | null;
    system_quantity: number;
    physical_quantity: number | null;
    difference_quantity: number | null;
};

type Opname = {
    id: number;
    opname_number: string;
    cutoff_at: string;
    status: string;
    notes: string | null;
    creator: { name: string } | null;
    poster: { name: string } | null;
    items: OpnameItem[];
};

type Props = { opname: Opname };

const card =
    'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#1c2434]';

const tableWrap =
    'overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900';

const statusBadge: Record<string, string> = {
    DRAFT: 'bg-amber-100 text-amber-700',
    COUNTING: 'bg-blue-100 text-blue-700',
    POSTED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-rose-100 text-rose-700',
};

export default function OpnameShow({ opname }: Props) {
        const editable = opname.status === 'DRAFT' || opname.status === 'COUNTING';
    const allCounted = opname.items.every((i) => i.physical_quantity !== null);
    const canPost =
        allCounted &&
        opname.status !== 'POSTED' &&
        opname.status !== 'CANCELLED';
    const canCancel =
        opname.status !== 'POSTED' && opname.status !== 'CANCELLED';

    const [cancelOpen, setCancelOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [saving, setSaving] = useState<number | null>(null);

    function saveItem(item: OpnameItem, value: string) {
        setSaving(item.id);
        router.put(
            `/opname/${opname.id}/items/${item.id}`,
            { physical_quantity: value === '' ? null : Number(value) },
            {
                preserveScroll: true,
                onFinish: () => setSaving(null),
            },
        );
    }

    function postOpname() {
        router.patch(`/opname/${opname.id}/post`, {}, { preserveScroll: true });
    }

    function cancelOpname(e: React.FormEvent) {
        e.preventDefault();
        router.patch(
            `/opname/${opname.id}/cancel`,
            { cancellation_reason: reason },
            {
                preserveScroll: true,
                onSuccess: () => setCancelOpen(false),
            },
        );
    }

    function rowStatus(i: OpnameItem) {
        if (i.physical_quantity === null)
            return { label: 'Belum', cls: 'bg-slate-100 text-slate-600' };
        const diff = i.difference_quantity ?? 0;
        if (diff === 0)
            return { label: 'Sesuai', cls: 'bg-emerald-100 text-emerald-700' };
        if (diff > 0)
            return { label: 'Surplus', cls: 'bg-blue-100 text-blue-700' };
        return { label: 'Shortage', cls: 'bg-rose-100 text-rose-700' };
    }

    return (
        <>
            <Head title={`Stock Opname ${opname.opname_number}`} />
            <div className="mx-auto w-full max-w-[1536px] space-y-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                            {opname.opname_number}
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Detail stock opname.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {canPost && (
                            <Button
                                onClick={postOpname}
                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                                Post
                            </Button>
                        )}
                        {canCancel && (
                            <Button
                                variant="outline"
                                onClick={() => setCancelOpen(true)}
                            >
                                Batalkan
                            </Button>
                        )}
                    </div>
                </div>

                <div className={card}>
                    <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">
                                Cut-off
                            </span>
                            <p className="font-medium text-gray-800 dark:text-white/90">
                                {fmtDate(opname.cutoff_at, true)}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">
                                Status
                            </span>
                            <p>
                                <span
                                    className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${statusBadge[opname.status] ?? 'bg-slate-100 text-slate-700'}`}
                                >
                                    {opname.status}
                                </span>
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">
                                Pembuat
                            </span>
                            <p className="font-medium text-gray-800 dark:text-white/90">
                                {opname.creator?.name ?? '-'}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">
                                Diposting oleh
                            </span>
                            <p className="font-medium text-gray-800 dark:text-white/90">
                                {opname.poster?.name ?? '-'}
                            </p>
                        </div>
                    </div>
                    {opname.notes && (
                        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="text-gray-500 dark:text-gray-400">
                                Catatan:{' '}
                            </span>
                            {opname.notes}
                        </p>
                    )}
                </div>

                <div className={tableWrap}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase dark:bg-gray-800">
                                <tr>
                                    {[
                                        'SKU',
                                        'Nama',
                                        'Satuan',
                                        'Stok Sistem',
                                        'Stok Fisik',
                                        'Selisih',
                                        'Status',
                                    ].map((h) => (
                                        <th key={h} className="px-5 py-3">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {opname.items.map((i) => {
                                    const s = rowStatus(i);
                                    return (
                                        <tr
                                            key={i.id}
                                            className="border-t border-gray-100 dark:border-gray-800"
                                        >
                                            <td className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                                {i.product?.sku ?? '-'}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                                {i.product?.name ?? '-'}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                                {i.product?.unit?.code ?? '-'}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                                {fmtNum(i.system_quantity)}
                                            </td>
                                            <td className="px-5 py-4">
                                                {editable ? (
                                                    <NumberInput
                                                        value={
                                                            i.physical_quantity ??
                                                            ''
                                                        }
                                                        disabled={
                                                            saving === i.id
                                                        }
                                                        onBlur={(e) =>
                                                            saveItem(
                                                                i,
                                                                e.target.value.replace(
                                                                    /\./g,
                                                                    '',
                                                                ),
                                                            )
                                                        }
                                                        className="w-24"
                                                    />
                                                ) : (
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {i.physical_quantity !==
                                                        null
                                                            ? fmtNum(
                                                                  i.physical_quantity,
                                                              )
                                                            : '-'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                                {i.difference_quantity !==
                                                null
                                                    ? fmtNum(
                                                          i.difference_quantity,
                                                      )
                                                    : '-'}
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

            <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Batalkan Stock Opname</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={cancelOpname} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="reason">Alasan Pembatalan</Label>
                            <Input
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCancelOpen(false)}
                            >
                                Tutup
                            </Button>
                            <Button
                                type="submit"
                                className="bg-rose-600 text-white hover:bg-rose-700"
                            >
                                Batalkan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

OpnameShow.layout = {
    breadcrumbs: [
        { title: 'Gudang', href: '#' },
        { title: 'Stock Opname', href: '/opname' },
        { title: 'Detail', href: '#' },
    ],
};
