import { Head, Link, useForm } from '@inertiajs/react';
import { fmtNum } from '@/components/report-filters';
import { Plus, Trash2 } from 'lucide-react';
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

type User = { id: number; name: string };

type Product = {
    id: number;
    sku: string;
    name: string;
    stock_balance: { quantity: number } | null;
};

type Props = {
    users: User[];
    products: Product[];
    isSuperadmin?: boolean;
};

type Item = { product_id: string; quantity: string };

const card =
    'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#1c2434]';

export default function DistribusiCreate({ users, products, isSuperadmin }: Props) {
    const saved =
        typeof window === 'undefined'
            ? null
            : JSON.parse(localStorage.getItem('distribution-template') ?? 'null');
    const form = useForm({
        user_id: isSuperadmin
            ? (saved?.user_id ?? '')
            : String(users[0]?.id ?? ''),
        distribution_date: new Date().toISOString().slice(0, 10),
        notes: saved?.notes ?? '',
        items: saved?.items?.length
            ? (saved.items as Item[])
            : ([{ product_id: '', quantity: '' }] as Item[]),
    });

    function addItem() {
        form.setData('items', [
            ...form.data.items,
            { product_id: '', quantity: '' },
        ]);
    }

    function removeItem(i: number) {
        form.setData(
            'items',
            form.data.items.filter((_, idx) => idx !== i),
        );
    }

    function updateItem(i: number, field: keyof Item, value: string) {
        form.setData(
            'items',
            form.data.items.map((it, idx) =>
                idx === i ? { ...it, [field]: value } : it,
            ),
        );
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        localStorage.setItem(
            'distribution-template',
            JSON.stringify({
                user_id: form.data.user_id,
                notes: form.data.notes,
                items: form.data.items,
            }),
        );
        form.post('/distribusi', {
            preserveScroll: true,
        });
    }

    
    // ponytail: client-side stock check only; server re-validates
    const stockErrors = form.data.items.map((it) => {
        if (!it.product_id || !it.quantity) return '';
        const p = products.find((x) => String(x.id) === it.product_id);
        if (!p) return '';
        const available = p.stock_balance?.quantity ?? 0;
        return Number(it.quantity) > available
            ? `Melebihi stok (${fmtNum(available)})`
            : '';
    });
    const hasStockError = stockErrors.some((e) => e);

    return (
        <>
            <Head title="Gudang Distribusi Buat" />
            <div className="mx-auto w-full max-w-[1536px] space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                        Buat Distribusi
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Form distribusi barang ke penerima.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className={card}>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="grid gap-2">
                                <Label>Penerima</Label>
                                {isSuperadmin === false ? (
                                    <Input
                                        value={users[0]?.name ?? ''}
                                        readOnly
                                    />
                                ) : (
                                    <Select
                                        value={form.data.user_id}
                                        onValueChange={(v) =>
                                            form.setData('user_id', v)
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Pilih penerima" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map((u) => (
                                                <SelectItem
                                                    key={u.id}
                                                    value={String(u.id)}
                                                >
                                                    {u.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="distribution_date">
                                    Tanggal
                                </Label>
                                <Input
                                    id="distribution_date"
                                    type="date"
                                    value={form.data.distribution_date}
                                    onChange={(e) =>
                                        form.setData(
                                            'distribution_date',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
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

                    <div className={card}>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                Item Barang
                            </h2>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addItem}
                            >
                                <Plus className="size-4" /> Tambah Item
                            </Button>
                        </div>
                        {saved && (
                            <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                                Item dan penerima sudah diisi dari inputan
                                sebelumnya — silakan ubah, tambah, atau hapus.
                            </p>
                        )}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase dark:bg-gray-800">
                                    <tr>
                                        {[
                                            'Produk',
                                            'Stok Tersedia',
                                            'Jumlah',
                                            'Aksi',
                                        ].map((h) => (
                                            <th key={h} className="px-5 py-3">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {form.data.items.map((it, i) => {
                                        const p = products.find(
                                            (x) =>
                                                String(x.id) === it.product_id,
                                        );
                                        return (
                                            <tr
                                                key={i}
                                                className="border-t border-gray-100 dark:border-gray-800"
                                            >
                                                <td className="px-5 py-4">
                                                    <Select
                                                        value={it.product_id}
                                                        onValueChange={(v) =>
                                                            updateItem(
                                                                i,
                                                                'product_id',
                                                                v,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Pilih produk" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {products.map(
                                                                (prod) => (
                                                                    <SelectItem
                                                                        key={
                                                                            prod.id
                                                                        }
                                                                        value={String(
                                                                            prod.id,
                                                                        )}
                                                                    >
                                                                        {
                                                                            prod.sku
                                                                        }{' '}
                                                                        —{' '}
                                                                        {
                                                                            prod.name
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </td>
                                                <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                                    {p
                                                        ? fmtNum(
                                                              p.stock_balance
                                                                  ?.quantity ??
                                                                  0,
                                                          )
                                                        : '-'}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <NumberInput
                                                        value={it.quantity}
                                                        onValueChange={(v) =>
                                                            updateItem(
                                                                i,
                                                                'quantity',
                                                                v,
                                                            )
                                                        }
                                                        required
                                                        className="w-32"
                                                    />
                                                    {stockErrors[i] && (
                                                        <p className="mt-1 text-xs text-red-500">
                                                            {stockErrors[i]}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    {form.data.items.length >
                                                        1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                removeItem(i)
                                                            }
                                                        >
                                                            <Trash2 className="size-4 text-red-500" />
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Link href="/distribusi">
                            <Button type="button" variant="outline">
                                Batal
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            className="bg-brand-500 text-white hover:bg-brand-600"
                            disabled={form.processing || hasStockError}
                        >
                            Simpan
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

DistribusiCreate.layout = {
    breadcrumbs: [
        { title: 'Gudang', href: '#' },
        { title: 'Distribusi', href: '/distribusi' },
        { title: 'Buat', href: '/distribusi/create' },
    ],
};
