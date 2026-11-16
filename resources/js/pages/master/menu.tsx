import { Head, router } from '@inertiajs/react';
import { fmtCurrency } from '@/components/report-filters';
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
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';

type Item = {
    id: number;
    name: string;
    price: number;
    category: string | null;
    is_active: boolean;
};

type Props = { items: Item[] };

const empty = { name: '', price: '', category: '', is_active: true };

const tableWrap =
    'overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900';

export default function Menu({ items }: Props) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Item | null>(null);
    const [form, setForm] = useState(empty);

    function openAdd() {
        setEditing(null);
        setForm(empty);
        setOpen(true);
    }

    function openEdit(it: Item) {
        setEditing(it);
        setForm({
            name: it.name,
            price: String(it.price),
            category: it.category ?? '',
            is_active: it.is_active,
        });
        setOpen(true);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        const data = { ...form, price: Number(form.price) };
        if (editing) {
            router.put(`/menu/${editing.id}`, data, {
                preserveScroll: true,
                onSuccess: () => setOpen(false),
            });
        } else {
            router.post('/menu', data, {
                preserveScroll: true,
                onSuccess: () => setOpen(false),
            });
        }
    }

    function toggleActive(it: Item) {
        router.patch(`/menu/${it.id}/toggle`, {}, { preserveScroll: true });
    }

    
    return (
        <>
            <Head title="Master Menu" />
            <div className="mx-auto w-full max-w-[1536px] space-y-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Master Menu
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Kelola menu kebab untuk pendapatan.
                        </p>
                    </div>
                    <Button
                        onClick={openAdd}
                        className="bg-brand-500 text-white hover:bg-brand-600"
                    >
                        <Plus className="size-4" /> Tambah
                    </Button>
                </div>

                <div className={tableWrap}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-gray-100 dark:border-gray-800">
                                <tr>
                                    {[
                                        'Nama',
                                        'Kategori',
                                        'Harga',
                                        'Status',
                                        'Aksi',
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {items.map((it) => (
                                    <tr
                                        key={it.id}
                                        className="transition hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                                    >
                                        <td className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                            {it.name}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {it.category ?? '-'}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {fmtCurrency(it.price)}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-lg px-2.5 py-0.5 text-xs font-medium ${it.is_active ? 'bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-500' : 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-500'}`}
                                            >
                                                {it.is_active
                                                    ? 'Aktif'
                                                    : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEdit(it)}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        toggleActive(it)
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
                            {editing ? 'Edit Menu' : 'Tambah Menu'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama Menu</Label>
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
                            <Label htmlFor="price">Harga Satuan</Label>
                            <NumberInput
                                id="price"
                                value={form.price}
                                onValueChange={(v) =>
                                    setForm({ ...form, price: v })
                                }
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category">Kategori</Label>
                            <Input
                                id="category"
                                value={form.category}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        category: e.target.value,
                                    })
                                }
                                placeholder="cth: Kebab"
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
                                className="bg-brand-500 text-white hover:bg-brand-600"
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

Menu.layout = {
    breadcrumbs: [
        { title: 'Master', href: '#' },
        { title: 'Menu', href: '/menu' },
    ],
};
