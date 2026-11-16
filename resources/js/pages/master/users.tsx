import { Head, router, useForm } from '@inertiajs/react';
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

type Branch = { id: number; code: string; name: string };

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
    branch?: { id: number; name: string } | null;
};

type Props = {
    users: { data: User[] };
    branches: Branch[];
};

const empty = {
    name: '',
    email: '',
    password: '',
    role: 'user',
    is_active: true,
    branch_id: '' as string | number,
};

export default function Users({ users, branches }: Props) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<User | null>(null);
    const form = useForm(empty);

    function openAdd() {
        setEditing(null);
        form.setData(empty);
        setOpen(true);
    }

    function openEdit(u: User) {
        setEditing(u);
        form.setData({
            name: u.name,
            email: u.email,
            password: '',
            role: u.role,
            is_active: u.is_active,
            branch_id: u.branch?.id ?? '',
        });
        setOpen(true);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        const data = {
            ...form.data,
            branch_id:
                form.data.branch_id === '' ? null : form.data.branch_id,
        };
        if (editing && !data.password)
            delete (data as Record<string, unknown>).password;
        form.transform(() => data);
        const options = {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        };
        if (editing) form.put(`/users/${editing.id}`, options);
        else form.post('/users', options);
    }

    function toggleActive(u: User) {
        router.patch(`/users/${u.id}/toggle`, {}, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Master User" />
            <div className="mx-auto w-full max-w-[1536px] space-y-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                            User
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Kelola pengguna sistem.
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
                                        'Nama',
                                        'Email',
                                        'Role',
                                        'Cabang',
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
                                        className="border-t border-gray-100 dark:border-gray-800"
                                    >
                                        <td className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                            {u.name}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {u.email}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {u.role}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {u.branch?.name ?? '-'}
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
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                required
                            />
                            {form.errors.name && (
                                <p className="text-sm text-red-500">
                                    {form.errors.name}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.data.email}
                                onChange={(e) =>
                                    form.setData('email', e.target.value)
                                }
                                required
                            />
                            {form.errors.email && (
                                <p className="text-sm text-red-500">
                                    {form.errors.email}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">
                                Password
                                {editing && ' (kosongkan jika tidak diubah)'}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={form.data.password}
                                onChange={(e) =>
                                    form.setData('password', e.target.value)
                                }
                                required={!editing}
                            />
                            {form.errors.password && (
                                <p className="text-sm text-red-500">
                                    {form.errors.password}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label>Role</Label>
                            <Select
                                value={form.data.role}
                                onValueChange={(v) => form.setData('role', v)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="superadmin">
                                        Superadmin
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Cabang</Label>
                            <Select
                                value={String(form.data.branch_id)}
                                onValueChange={(v) =>
                                    form.setData(
                                        'branch_id',
                                        v === 'none' ? '' : Number(v),
                                    )
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Tanpa cabang" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        Tanpa cabang
                                    </SelectItem>
                                    {branches.map((b) => (
                                        <SelectItem
                                            key={b.id}
                                            value={String(b.id)}
                                        >
                                            {b.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="is_active"
                                checked={form.data.is_active}
                                onCheckedChange={(v) =>
                                    form.setData('is_active', v === true)
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

Users.layout = {
    breadcrumbs: [
        { title: 'Master', href: '#' },
        { title: 'User', href: '/users' },
    ],
};
