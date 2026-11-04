import { Head, router } from '@inertiajs/react';
import { Pencil, Plus, Power } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Unit = { id: number; code: string; name: string };

type Product = {
    id: number;
    sku: string;
    name: string;
    unit: Unit | null;
    stock_balance: number;
    purchase_price: number;
    selling_price: number;
    minimum_stock: number;
    is_active: boolean;
};

type Props = { products: Product[]; units: Unit[] };

const empty = {
    sku: '',
    name: '',
    unit_id: '',
    purchase_price: '',
    selling_price: '',
    minimum_stock: '',
    is_active: true,
};

export default function Products({ products, units }: Props) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [form, setForm] = useState(empty);

    function openAdd() {
        setEditing(null);
        setForm(empty);
        setOpen(true);
    }

    function openEdit(p: Product) {
        setEditing(p);
        setForm({
            sku: p.sku,
            name: p.name,
            unit_id: p.unit ? String(p.unit.id) : '',
            purchase_price: String(p.purchase_price),
            selling_price: String(p.selling_price),
            minimum_stock: String(p.minimum_stock),
            is_active: p.is_active,
        });
        setOpen(true);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        const data = {
            ...form,
            unit_id: Number(form.unit_id),
            purchase_price: Number(form.purchase_price),
            selling_price: Number(form.selling_price),
            minimum_stock: Number(form.minimum_stock),
        };
        if (editing) {
            router.put(`/products/${editing.id}`, data, {
                preserveScroll: true,
                onSuccess: () => setOpen(false),
            });
        } else {
            router.post('/products', data, {
                preserveScroll: true,
                onSuccess: () => setOpen(false),
            });
        }
    }

    function toggleActive(p: Product) {
        router.put(
            `/products/${p.id}`,
            { is_active: !p.is_active },
            { preserveScroll: true },
        );
    }

    const fmtID = (v: number) => v.toLocaleString('id-ID');

    return (
        <>
            <Head title="Master Barang" />
            <div className="mx-auto w-full max-w-[1536px] space-y-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                            Barang
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Kelola produk dan stok.
                        </p>
                    </div>
                    <Button
                        onClick={openAdd}
                        className="bg-[#465fff] text-white hover:bg-[#3b50e0]"
                    >
                        <Plus className="size-4" /> Tambah
                    </Button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#1c2434]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase dark:bg-white/[0.03]">
                                <tr>
                                    {[
                                        'SKU',
                                        'Nama',
                                        'Satuan',
                                        'Stok',
                                        'Min. Stok',
                                        'Harga Beli',
                                        'Harga Jual',
                                        'Status',
                                        'Aksi',
                                    ].map((h) => (
                                        <th key={h} className="px-5 py-3">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p) => (
                                    <tr
                                        key={p.id}
                                        className="border-t border-slate-100 dark:border-white/[0.06]"
                                    >
                                        <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">
                                            {p.sku}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                                            {p.name}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                                            {p.unit?.name ?? '-'}
                                        </td>
                                        <td
                                            className={`px-5 py-4 ${p.stock_balance <= p.minimum_stock ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'}`}
                                        >
                                            {fmtID(p.stock_balance)}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                                            {fmtID(p.minimum_stock)}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                                            {fmtID(p.purchase_price)}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                                            {fmtID(p.selling_price)}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                                            >
                                                {p.is_active
                                                    ? 'Aktif'
                                                    : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEdit(p)}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        toggleActive(p)
                                                    }
                                                >
                                                    <Power className="size-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? 'Edit Barang' : 'Tambah Barang'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="sku">SKU</Label>
                            <Input
                                id="sku"
                                value={form.sku}
                                onChange={(e) =>
                                    setForm({ ...form, sku: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama</Label>
                            <Input
                                id="name"
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Satuan</Label>
                            <Select
                                value={form.unit_id}
                                onValueChange={(v) =>
                                    setForm({ ...form, unit_id: v })
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih satuan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {units.map((u) => (
                                        <SelectItem
                                            key={u.id}
                                            value={String(u.id)}
                                        >
                                            {u.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="purchase_price">
                                    Harga Beli
                                </Label>
                                <Input
                                    id="purchase_price"
                                    type="number"
                                    value={form.purchase_price}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            purchase_price: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="selling_price">
                                    Harga Jual
                                </Label>
                                <Input
                                    id="selling_price"
                                    type="number"
                                    value={form.selling_price}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            selling_price: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="minimum_stock">Min. Stok</Label>
                            <Input
                                id="minimum_stock"
                                type="number"
                                value={form.minimum_stock}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        minimum_stock: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="is_active"
                                checked={form.is_active}
                                onCheckedChange={(v) =>
                                    setForm({ ...form, is_active: v === true })
                                }
                            />
                            <Label htmlFor="is_active">Aktif</Label>
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
                                className="bg-[#465fff] text-white hover:bg-[#3b50e0]"
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

Products.layout = {
    breadcrumbs: [
        { title: 'Master', href: '#' },
        { title: 'Barang', href: '/products' },
    ],
};
