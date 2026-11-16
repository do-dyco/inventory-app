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

type Branch = {
    id: number;
    code: string;
    name: string;
    address: string | null;
    is_active: boolean;
    users_count: number;
};

type Props = { branches: Branch[] };

const empty = { code: '', name: '', address: '', is_active: true };

export default function Cabang({ branches }: Props) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Branch | null>(null);
    const [form, setForm] = useState(empty);

    function openAdd() {
        setEditing(null);
        setForm(empty);
        setOpen(true);
    }

    function openEdit(b: Branch) {
        setEditing(b);
        setForm({
            code: b.code,
            name: b.name,
            address: b.address ?? '',
            is_active: b.is_active,
        });
        setOpen(true);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (editing) {
            const { code: _code, ...data } = form;
            router.put(`/cabang/${editing.id}`, data, {
                preserveScroll: true,
                onSuccess: () => setOpen(false),
            });
        } else {
            router.post('/cabang', form, {
                preserveScroll: true,
                onSuccess: () => setOpen(false),
            });
        }
    }

    function toggleActive(b: Branch) {
        router.put(
            `/cabang/${b.id}`,
            { is_active: !b.is_active },
            { preserveScroll: true },
        );
    }

    return (
        <>
            <Head title="Master Cabang" />
            <div className="mx-auto w-full max-w-[1536px] space-y-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Cabang
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Kelola cabang toko.
                        </p>
                    </div>
                    <Button
                        onClick={openAdd}
                        className="bg-brand-500 text-white hover:bg-brand-600"
                    >
                        <Plus className="size-4" /> Tambah
                    </Button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase dark:bg-gray-800">
                                <tr>
                                    {[
                                        'Kode',
                                        'Nama',
                                        'Alamat',
                                        'Jumlah User',
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
                                {branches.map((b) => (
                                    <tr
                                        key={b.id}
                                        className="border-t border-gray-100 dark:border-gray-800"
                                    >
                                        <td className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                            {b.code}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {b.name}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {b.address ?? '-'}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {b.users_count}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${b.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                                            >
                                                {b.is_active
                                                    ? 'Aktif'
                                                    : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEdit(b)}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        toggleActive(b)
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? 'Edit Cabang' : 'Tambah Cabang'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="code">Kode</Label>
                            <Input
                                id="code"
                                value={form.code}
                                onChange={(e) =>
                                    setForm({ ...form, code: e.target.value })
                                }
                                disabled={!!editing}
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
                            <Label htmlFor="address">Alamat</Label>
                            <textarea
                                id="address"
                                value={form.address}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        address: e.target.value,
                                    })
                                }
                                rows={3}
                                className="flex w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
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

Cabang.layout = {
    breadcrumbs: [
        { title: 'Master', href: '#' },
        { title: 'Cabang', href: '/cabang' },
    ],
};
