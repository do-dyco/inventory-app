import { Head, Link, useForm, router } from '@inertiajs/react';
import { fmtNum } from '@/components/report-filters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

type DistributionItem = {
    id: number;
    quantity: number;
    returned_quantity: number;
    product: { name: string; sku: string } | null;
};

type Distribution = {
    id: number;
    distribution_number: string;
    user?: { name: string } | null;
    items: DistributionItem[];
};

type Props = { distributions: Distribution[] };

const card =
    'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#1c2434]';

export default function PengembalianCreate({ distributions }: Props) {
        const [selectedId, setSelectedId] = useState('');
    const selected = distributions.find((d) => String(d.id) === selectedId);

    const form = useForm({
        stock_distribution_id: '',
        notes: '',
        items: [] as { stock_distribution_item_id: number; quantity: string }[],
    });

    function selectDistribution(v: string) {
        setSelectedId(v);
        form.setData('stock_distribution_id', v);
        form.setData('items', []);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        const payload = {
            stock_distribution_id: form.data.stock_distribution_id,
            notes: form.data.notes,
            items: form.data.items
                .filter((it) => it.quantity !== '')
                .map((it) => ({
                    stock_distribution_item_id: it.stock_distribution_item_id,
                    quantity: Number(it.quantity),
                })),
        };
        router.post('/pengembalian', payload, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Gudang Pengembalian Buat" />
            <div className="mx-auto w-full max-w-[1536px] space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                        Buat Pengembalian
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Form pengembalian barang dari distribusi.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className={card}>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label>Distribusi</Label>
                                <Select
                                    value={selectedId}
                                    onValueChange={selectDistribution}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih distribusi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {distributions.map((d) => (
                                            <SelectItem
                                                key={d.id}
                                                value={String(d.id)}
                                            >
                                                {d.distribution_number}
                                                {d.user?.name
                                                    ? ` — ${d.user.name}`
                                                    : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="notes">Catatan</Label>
                                <Input
                                    id="notes"
                                    value={form.data.notes}
                                    onChange={(e) =>
                                        form.setData('notes', e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {selected && (
                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase dark:bg-gray-800">
                                        <tr>
                                            {[
                                                'Produk',
                                                'Jumlah',
                                                'Sudah Kembali',
                                                'Maks. Kembali',
                                                'Kembali',
                                            ].map((h) => (
                                                <th
                                                    key={h}
                                                    className="px-5 py-3"
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selected.items.map((it) => {
                                            const max =
                                                it.quantity -
                                                it.returned_quantity;
                                            const existing =
                                                form.data.items.find(
                                                    (x) =>
                                                        x.stock_distribution_item_id ===
                                                        it.id,
                                                );
                                            return (
                                                <tr
                                                    key={it.id}
                                                    className="border-t border-gray-100 dark:border-gray-800"
                                                >
                                                    <td className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                                        {it.product?.name ??
                                                            '-'}
                                                    </td>
                                                    <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                                        {fmtNum(it.quantity)}
                                                    </td>
                                                    <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                                        {fmtNum(it.returned_quantity)}
                                                    </td>
                                                    <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                                        {fmtNum(max)}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <NumberInput
                                                            value={
                                                                existing?.quantity ??
                                                                ''
                                                            }
                                                            onValueChange={(
                                                                v,
                                                            ) => {
                                                                const rest =
                                                                    form.data.items.filter(
                                                                        (x) =>
                                                                            x.stock_distribution_item_id !==
                                                                            it.id,
                                                                    );
                                                                if (v === '') {
                                                                    form.setData(
                                                                        'items',
                                                                        rest,
                                                                    );
                                                                } else {
                                                                    form.setData(
                                                                        'items',
                                                                        [
                                                                            ...rest,
                                                                            {
                                                                                stock_distribution_item_id:
                                                                                    it.id,
                                                                                quantity:
                                                                                    v,
                                                                            },
                                                                        ],
                                                                    );
                                                                }
                                                            }}
                                                            disabled={max === 0}
                                                            className="w-28"
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <Link href="/pengembalian">
                            <Button type="button" variant="outline">
                                Batal
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            className="bg-brand-500 text-white hover:bg-brand-600"
                            disabled={form.processing || !selectedId}
                        >
                            Simpan
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

PengembalianCreate.layout = {
    breadcrumbs: [
        { title: 'Gudang', href: '#' },
        { title: 'Pengembalian', href: '/pengembalian' },
        { title: 'Buat', href: '/pengembalian/create' },
    ],
};
