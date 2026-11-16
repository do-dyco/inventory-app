import { Head, router, useForm } from '@inertiajs/react';
import { fmtCurrency, fmtDate, fmtNum } from '@/components/report-filters';
import { Plus, Trash2 } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Product = {
    id: number;
    sku: string;
    name: string;
    unit: { code: string } | null;
    stock_balance: { quantity: number } | null;
    minimum_stock: number;
    purchase_price: number | null;
};

type Movement = {
    id: number;
    movement_type: string;
    quantity: number;
    created_at: string;
    product: { name: string } | null;
};

type Props = {
    products: Product[];
    movements: Movement[];
};

const card =
    'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#1c2434]';

const tableWrap =
    'overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900';

export default function Stok({ products, movements }: Props) {
    const [open, setOpen] = useState(false);
    type Item = {
        product_id: string;
        quantity: string;
        purchase_price: string;
    };
    const form = useForm({
        movement_type: 'in',
        items: [
            { product_id: '', quantity: '', purchase_price: '' },
        ] as Item[],
        notes: '',
    });

    function addItem() {
        form.setData('items', [
            ...form.data.items,
            { product_id: '', quantity: '', purchase_price: '' },
        ]);
    }

    function removeItem(i: number) {
        form.setData('items', form.data.items.filter((_, index) => index !== i));
    }

    function updateItem(i: number, field: keyof Item, value: string) {
        form.setData('items', form.data.items.map((item, index) =>
            index === i ? { ...item, [field]: value } : item,
        ));
    }

    function openDialog() {
        form.setData({
            movement_type: 'in',
            items: [{ product_id: '', quantity: '', purchase_price: '' }],
            notes: '',
        });
        setOpen(true);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (form.data.movement_type === 'adjustment') {
            form.data.items.forEach((item, index) => {
                router.post('/stok/adjustment', {
                    product_id: Number(item.product_id),
                    quantity: Number(item.quantity),
                    type: 'in',
                    notes: form.data.notes,
                }, { preserveScroll: true, onSuccess: () => index === form.data.items.length - 1 && setOpen(false) });
            });
            return;
        }
        router.post('/stok/batch', {
            movement_type: form.data.movement_type,
            items: form.data.items.map((item) => ({
                product_id: Number(item.product_id),
                quantity: Number(item.quantity),
                purchase_price:
                    item.purchase_price === ''
                        ? null
                        : Number(item.purchase_price),
            })),
            notes: form.data.notes,
        }, {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    }

    
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
            <Head title="Gudang Stok" />
            <div className="mx-auto w-full max-w-[1536px] space-y-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Stok Barang
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Kelola stok dan pergerakan barang.
                        </p>
                    </div>
                    <Button
                        onClick={openDialog}
                        className="bg-brand-500 text-white hover:bg-brand-600"
                    >
                        Catat Pergerakan
                    </Button>
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
                                        'Stok',
                                        'Min. Stok',
                                        'Harga Beli',
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
                                            <td className={`px-5 py-4 ${(p.stock_balance?.quantity ?? 0) < p.minimum_stock ? 'font-semibold text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                                {fmtNum(
                                                    p.stock_balance?.quantity ??
                                                        0,
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                                {fmtNum(p.minimum_stock)}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                                {p.purchase_price != null
                                                    ? fmtCurrency(p.purchase_price)
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

                <div className={card}>
                    <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                        Pergerakan Terbaru
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase dark:bg-gray-800">
                                <tr>
                                    {[
                                        'Produk',
                                        'Tipe',
                                        'Jumlah',
                                        'Tanggal',
                                    ].map((h) => (
                                        <th key={h} className="px-5 py-3">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {movements.map((m) => (
                                    <tr
                                        key={m.id}
                                        className="border-t border-gray-100 dark:border-gray-800"
                                    >
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {m.product?.name ?? '-'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${m.movement_type === 'in' ? 'bg-emerald-100 text-emerald-700' : m.movement_type === 'out' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}
                                            >
                                                {m.movement_type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {fmtNum(m.quantity)}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {fmtDate(m.created_at, true)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Catat Pergerakan Stok</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Tipe Pergerakan</Label>
                            <Select
                                value={form.data.movement_type}
                                onValueChange={(v) =>
                                    form.setData('movement_type', v)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="in">
                                        Stok Masuk
                                    </SelectItem>
                                    <SelectItem value="initial">
                                        Stok Awal
                                    </SelectItem>
                                    <SelectItem value="adjustment">
                                        Penyesuaian
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label>Item Barang</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addItem}
                                >
                                    <Plus className="size-4" /> Tambah Item
                                </Button>
                            </div>
                            <div className="grid gap-3">
                                {form.data.items.map((item, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <div className="flex-1">
                                            <Select
                                                value={item.product_id}
                                                onValueChange={(v) =>
                                                    updateItem(i, 'product_id', v)
                                                }
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Pilih produk" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {products.map((p) => (
                                                        <SelectItem
                                                            key={p.id}
                                                            value={String(p.id)}
                                                        >
                                                            {p.sku} — {p.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <NumberInput
                                            value={item.quantity}
                                            onValueChange={(v) =>
                                                updateItem(i, 'quantity', v)
                                            }
                                            required
                                            placeholder="Jumlah"
                                            className="w-32"
                                        />
                                        {form.data.movement_type !==
                                            'adjustment' && (
                                            <NumberInput
                                                value={item.purchase_price}
                                                onValueChange={(v) =>
                                                    updateItem(
                                                        i,
                                                        'purchase_price',
                                                        v,
                                                    )
                                                }
                                                placeholder="Harga Beli"
                                                className="w-36"
                                            />
                                        )}
                                        {form.data.items.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeItem(i)}
                                            >
                                                <Trash2 className="size-4 text-red-500" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
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
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="bg-brand-500 text-white hover:bg-brand-600"
                                disabled={form.processing}
                            >
                                Simpan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

Stok.layout = {
    breadcrumbs: [
        { title: 'Gudang', href: '#' },
        { title: 'Stok', href: '/stok' },
    ],
};
