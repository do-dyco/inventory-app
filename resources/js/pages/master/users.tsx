import { Head, router, usePage } from '@inertiajs/react';
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

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
};

type Props = {
    users: { data: User[] };
};

const empty = {
    name: '',
    email: '',
    password: '',
    role: 'user',
    is_active: true,
};

export default function Users({ users }: Props) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<User | null>(null);
    const [form, setForm] = useState(empty);

    function openAdd() {
        setEditing(null);
        setForm(empty);
        setOpen(true);
    }

    function openEdit(u: User) {
        setEditing(u);
        setForm({
            name: u.name,
            email: u.email,
            password: '',
            role: u.role,
            is_active: u.is_active,
        });
        setOpen(true);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (editing) {
            const data = { ...form };
            if (!data.password)
                delete (data as Record<string, unknown>).password;
            router.put(`/users/${editing.id}`, data, {
                preserveScroll: true,
                onSuccess: () => setOpen(false),
            });
        } else {
            router.post('/users', form, {
                preserveScroll: true,
                onSuccess: () => setOpen(false),
            });
        }
    }

    function toggleActive(u: User) {
        router.put(
            `/users/${u.id}`,
            { is_active: !u.is_active },
            { preserveScroll: true },
        );
    }

    return (
        <>
            <Head title="Master User" />
            <div className="mx-auto w-full max-w-[1536px] space-y-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                            User
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Kelola pengguna sistem.
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
                                        'Nama',
                                        'Email',
                                        'Role',
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
                                {users.data.map((u) => (
                                    <tr
                                        key={u.id}
                                        className="border-t border-slate-100 dark:border-white/[0.06]"
                                    >
                                        <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">
                                            {u.name}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                                            {u.email}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                                            {u.role}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                                            >
                                                {u.is_active
                                                    ? 'Aktif'
                                                    : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEdit(u)}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        toggleActive(u)
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
                            {editing ? 'Edit User' : 'Tambah User'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="grid gap-4">
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
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.email}
                                onChange={(e) =>
                                    setForm({ ...form, email: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">
                                Password
                                {editing && ' (kosongkan jika tidak diubah)'}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={form.password}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        password: e.target.value,
                                    })
                                }
                                required={!editing}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Role</Label>
                            <Select
                                value={form.role}
                                onValueChange={(v) =>
                                    setForm({ ...form, role: v })
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="superadmin">
                                        Superadmin
                                    </SelectItem>
                                </SelectContent>
                            </Select>
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

Users.layout = {
    breadcrumbs: [
        { title: 'Master', href: '#' },
        { title: 'User', href: '/users' },
    ],
};
