import { Head, router, usePage } from '@inertiajs/react';
import { fmtCurrency, fmtDate, fmtNum } from '@/components/report-filters';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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

type MenuItem = { id: number; name: string; price: number; category?: string | null };

type Income = {
    id: number;
    income_date: string;
    amount: number;
    payment_method: string;
    notes: string | null;
    user: { name: string } | null;
    branch?: { name: string } | null;
    menu_item?: { id: number; name: string; price: number } | null;
    quantity?: number | null;
};

type Expense = {
    id: number;
    expense_date: string;
    code: string;
    description: string | null;
    amount: number;
    user: { name: string } | null;
    branch?: { name: string } | null;
};

type Props = {
    incomes: { data: Income[] };
    expenses: { data: Expense[] };
    menuItems: MenuItem[];
    users?: { id: number; name: string; branch?: { name: string } | null }[] | null;
};

const empty = {
    user_id: '',
    income_date: '',
    menu_item_id: '',
    quantity: '',
    payment_method: 'cash',
    notes: '',
};

const emptyBatch = { user_id: '', income_date: '', payment_method: 'cash' };

const tableWrap =
    'overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900';

export default function Pendapatan({ incomes, expenses, menuItems, users }: Props) {
    const { auth } = usePage().props;
    const userBranchId = (auth.user as { branch_id?: number | null }).branch_id;
    const isSuperadmin = !!users;
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Income | null>(null);
    const [form, setForm] = useState(empty);
    const [batch, setBatch] = useState(emptyBatch);
    const [qtys, setQtys] = useState<Record<number, string>>({});
    const [expItems, setExpItems] = useState<{ code: string; description: string; amount: string }[]>([]);

    const selectedMenu = menuItems.find(
        (m) => String(m.id) === form.menu_item_id,
    );
    const autoAmount =
        selectedMenu && form.quantity
            ? (selectedMenu.price * Number(form.quantity)).toFixed(0)
            : '';

    function openAdd() {
        setEditing(null);
        setForm(empty);
        setBatch({
            ...emptyBatch,
            income_date: new Date().toISOString().slice(0, 10),
        });
        setQtys({});
        setExpItems([]);
        setOpen(true);
    }

    function openEdit(i: Income) {
        setEditing(i);
        setForm({
            user_id: '',
            income_date: i.income_date,
            menu_item_id: i.menu_item?.id ? String(i.menu_item.id) : '',
            quantity: i.quantity ? String(i.quantity) : '',
            payment_method: i.payment_method,
            notes: i.notes ?? '',
        });
        setOpen(true);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        const data = {
            income_date: form.income_date,
            menu_item_id: Number(form.menu_item_id),
            quantity: Number(form.quantity),
            payment_method: form.payment_method,
            notes: form.notes,
            ...(isSuperadmin ? { user_id: Number(form.user_id) } : {}),
        };
        if (editing) {
            router.put(`/pendapatan/${editing.id}`, data, {
                preserveScroll: true,
                onSuccess: () => setOpen(false),
            });
        }
    }

    const batchTotal = Object.entries(qtys).reduce(
        (sum, [id, q]) =>
            sum +
            (menuItems.find((m) => m.id === Number(id))?.price ?? 0) *
                Number(q || 0),
        0,
    );

    function submitBatch(e: React.FormEvent) {
        e.preventDefault();
        const items = Object.entries(qtys)
            .filter(([, q]) => Number(q) > 0)
            .map(([id, q]) => ({
                menu_item_id: Number(id),
                quantity: Number(q),
            }));
        router.post(
            '/pendapatan/batch',
            {
                income_date: batch.income_date,
                payment_method: batch.payment_method,
                items,
                expenses: expItems.filter((e) => e.code && Number(e.amount) > 0).map((e) => ({
                    code: e.code,
                    description: e.description || null,
                    amount: Number(e.amount),
                })),
                ...(isSuperadmin ? { user_id: Number(batch.user_id) } : {}),
            },
            {
                preserveScroll: true,
                onSuccess: () => setOpen(false),
            },
        );
    }

    function destroy(i: Income) {
        if (confirm('Hapus pendapatan ini?')) {
            router.delete(`/pendapatan/${i.id}`, { preserveScroll: true });
        }
    }

    
    return (
        <>
            <Head title="Pendapatan Harian" />
            <div className="mx-auto w-full max-w-[1536px] space-y-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Pendapatan Harian
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Catatan pendapatan harian.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                    <Button variant="outline" asChild>
                        <a href="/pendapatan/template" target="_blank" rel="noopener noreferrer">Template PDF</a>
                    </Button>
                    <Button
                        onClick={openAdd}
                        className="bg-brand-500 text-white hover:bg-brand-600"
                    >
                        <Plus className="size-4" /> Tambah
                    </Button>
                    </div>
                </div>

                <div className={tableWrap}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase dark:bg-gray-800">
                                <tr>
                                    {[
                                        'Tanggal',
                                        'Menu',
                                        'Qty',
                                        'Jumlah',
                                        'Metode',
                                        'Cabang',
                                        'Catatan',
                                        'Pencatat',
                                        'Aksi',
                                    ].map((h) => (
                                        <th key={h} className="px-5 py-3">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {incomes.data.map((i) => (
                                    <tr
                                        key={i.id}
                                        className="border-t border-gray-100 dark:border-gray-800"
                                    >
                                        <td className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                            {fmtDate(i.income_date)}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {i.menu_item?.name ?? '-'}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {i.quantity != null
                                                ? fmtNum(i.quantity)
                                                : '-'}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {fmtCurrency(i.amount)}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {i.payment_method}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {i.branch?.name ?? '-'}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {i.notes ?? '-'}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {i.user?.name ?? '-'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEdit(i)}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => destroy(i)}
                                                >
                                                    <Trash2 className="size-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div>
                    <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white/90">
                        Pengeluaran
                    </h2>
                    <div className={tableWrap}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase dark:bg-gray-800">
                                    <tr>
                                        {['Tanggal', 'Kode', 'Deskripsi', 'Jumlah', 'Cabang', 'Pencatat'].map((h) => (
                                            <th key={h} className="px-5 py-3">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.data.map((e) => (
                                        <tr key={e.id} className="border-t border-gray-100 dark:border-gray-800">
                                            <td className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                                {fmtDate(e.expense_date)}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                                {e.code}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                                {e.description ?? '-'}
                                            </td>
                                            <td className="px-5 py-4 text-rose-600 dark:text-rose-400">
                                                {fmtCurrency(e.amount)}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                                {e.branch?.name ?? '-'}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                                {e.user?.name ?? '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? 'Edit Pendapatan' : 'Tambah Pendapatan'}
                        </DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={editing ? submit : submitBatch}
                        className="grid gap-4"
                    >
                        {!editing && !userBranchId && !isSuperadmin && (
                            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                                Akun Anda tidak terhubung ke cabang. Hubungkan
                                akun ke cabang terlebih dahulu.
                            </p>
                        )}
                        {isSuperadmin && (
                            <div className="grid gap-2">
                                <Label>User / Cabang</Label>
                                <Select
                                    value={editing ? form.user_id : batch.user_id}
                                    onValueChange={(v) =>
                                        editing
                                            ? setForm({ ...form, user_id: v })
                                            : setBatch({ ...batch, user_id: v })
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih user pemilik pendapatan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users?.map((u) => (
                                            <SelectItem
                                                key={u.id}
                                                value={String(u.id)}
                                            >
                                                {u.name}
                                                {u.branch?.name
                                                    ? ` — ${u.branch.name}`
                                                    : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="income_date">Tanggal</Label>
                            <Input
                                id="income_date"
                                type="date"
                                value={editing ? form.income_date : batch.income_date}
                                onChange={(e) =>
                                    editing
                                        ? setForm({
                                              ...form,
                                              income_date: e.target.value,
                                          })
                                        : setBatch({
                                              ...batch,
                                              income_date: e.target.value,
                                          })
                                }
                                required
                            />
                        </div>
                        {editing ? (
                        <>
                        <div className="grid gap-2">
                            <Label>Menu</Label>
                            <Select
                                value={form.menu_item_id}
                                onValueChange={(v) =>
                                    setForm({ ...form, menu_item_id: v })
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih menu" />
                                </SelectTrigger>
                                <SelectContent>
                                    {menuItems.map((m) => (
                                        <SelectItem
                                            key={m.id}
                                            value={String(m.id)}
                                        >
                                            {m.name}
                                            {m.category
                                                ? ` (${m.category})`
                                                : ''}{' '}
                                            — {fmtCurrency(m.price)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {form.menu_item_id && (
                            <div className="grid gap-2">
                                <Label htmlFor="quantity">
                                    Jumlah Penjualan
                                </Label>
                                <NumberInput
                                    id="quantity"
                                    min="1"
                                    value={form.quantity}
                                    onValueChange={(v) =>
                                        setForm({
                                            ...form,
                                            quantity: v,
                                        })
                                    }
                                    required
                                />
                            </div>
                        )}
                        {autoAmount && (
                            <div className="grid gap-2">
                                <Label>Total Pendapatan</Label>
                                <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-800 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90">
                                    {fmtCurrency(Number(autoAmount))}{' '}
                                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                                        (harga menu × jumlah, tidak dapat
                                        diubah)
                                    </span>
                                </p>
                            </div>
                        )}
                        </>
                        ) : (
                        <>
                        <div className="grid gap-2">
                            <Label>Jumlah Terjual per Menu</Label>
                            <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-gray-200 p-2 dark:border-gray-700">
                                {menuItems.map((m) => (
                                    <div
                                        key={m.id}
                                        className="flex items-center justify-between gap-3 px-1 py-1.5"
                                    >
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {m.name}{' '}
                                            <span className="text-xs text-gray-400">
                                                ({fmtCurrency(m.price)})
                                            </span>
                                            {m.category && (
                                                <span className="block text-xs text-gray-400">
                                                    ({m.category})
                                                </span>
                                            )}
                                        </span>
                                        <NumberInput
                                            className="w-24"
                                            min="0"
                                            placeholder="0"
                                            value={qtys[m.id] ?? ''}
                                            onValueChange={(v) =>
                                                setQtys({ ...qtys, [m.id]: v })
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        {batchTotal > 0 && (
                            <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-800 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90">
                                Total: {fmtCurrency(batchTotal)}{' '}
                                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                                    (harga menu × jumlah, tidak dapat diubah)
                                </span>
                            </p>
                        )}
                        <div className="grid gap-2">
                            <Label>Pengeluaran</Label>
                            <div className="space-y-2">
                                {expItems.map((e, i) => (
                                    <div key={i} className="flex gap-2">
                                        <Input
                                            className="w-28"
                                            placeholder="Nama"
                                            value={e.code}
                                            onChange={(ev) => {
                                                const next = [...expItems];
                                                next[i].code = ev.target.value;
                                                setExpItems(next);
                                            }}
                                        />
                                        <Input
                                            className="flex-1"
                                            placeholder="Deskripsi"
                                            value={e.description}
                                            onChange={(ev) => {
                                                const next = [...expItems];
                                                next[i].description = ev.target.value;
                                                setExpItems(next);
                                            }}
                                        />
                                        <NumberInput
                                            className="w-32"
                                            placeholder="0"
                                            value={e.amount}
                                            onValueChange={(v) => {
                                                const next = [...expItems];
                                                next[i].amount = v;
                                                setExpItems(next);
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setExpItems(expItems.filter((_, idx) => idx !== i))}
                                        >
                                            <Trash2 className="size-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setExpItems([...expItems, { code: '', description: '', amount: '' }])}
                                >
                                    <Plus className="size-4" /> Tambah Pengeluaran
                                </Button>
                            </div>
                            {expItems.some((e) => e.code && Number(e.amount) > 0) && (
                                <p className="text-xs text-rose-500">
                                    Total Pengeluaran: {fmtCurrency(expItems.reduce((s, e) => s + (Number(e.amount) || 0), 0))}
                                </p>
                            )}
                        </div>
                        </>
                        )}
                        <div className="grid gap-2">
                            <Label>Metode Pembayaran</Label>
                            <Select
                                value={editing ? form.payment_method : batch.payment_method}
                                onValueChange={(v) =>
                                    editing
                                        ? setForm({ ...form, payment_method: v })
                                        : setBatch({ ...batch, payment_method: v })
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Tunai</SelectItem>
                                    <SelectItem value="transfer">
                                        Transfer
                                    </SelectItem>
                                    <SelectItem value="qris">QRIS</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {editing && (
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Catatan</Label>
                            <Input
                                id="notes"
                                value={form.notes}
                                onChange={(e) =>
                                    setForm({ ...form, notes: e.target.value })
                                }
                            />
                        </div>
                        )}
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
                                disabled={!editing && batchTotal === 0}
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

Pendapatan.layout = {
    breadcrumbs: [
        { title: 'Pendapatan', href: '#' },
        { title: 'Harian', href: '/pendapatan' },
    ],
};
