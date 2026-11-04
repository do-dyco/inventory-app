import { Head, usePage } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    Boxes,
    Package,
    ShoppingCart,
    TrendingUp,
    AlertTriangle,
} from 'lucide-react';

type PageProps = {
    role?: string;
    totalActiveProducts?: number;
    totalStock?: number;
    totalDistributions?: number;
    totalReturns?: number;
    totalDailyIncomeToday?: number;
    lowStockProducts?: Array<{
        id: number;
        sku: string;
        name: string;
        minimum_stock: number;
        stockBalance?: { quantity: number };
        unit?: { code: string };
    }>;
    recentMovements?: Array<{
        id: number;
        movement_type: string;
        quantity: number;
        created_at: string;
        product?: { name: string };
    }>;
    myDistributions?: Array<{
        id: number;
        distribution_number: string;
        distribution_date: string;
        items?: Array<{
            id: number;
            quantity: number;
            returned_quantity: number;
            product?: { name: string; sku: string };
        }>;
    }>;
    totalDistributed?: number;
    totalReturned?: number;
    todayIncome?: number;
    recentIncomes?: Array<{
        id: number;
        income_date: string;
        amount: number;
        payment_method?: string;
    }>;
};

const card =
    'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#1c2434]';

export default function Dashboard() {
    const props = usePage().props as PageProps;
    const isSuperadmin = props.role === 'superadmin';
    return (
        <>
            <Head title="Dashboard" />
            <div className="mx-auto w-full max-w-[1536px] space-y-6 p-4 md:p-6">
                {isSuperadmin ? (
                    <SuperadminDashboard {...props} />
                ) : (
                    <UserDashboard {...props} />
                )}
            </div>
        </>
    );
}

function SuperadminDashboard(props: PageProps) {
    const metrics = [
        {
            label: 'Total Produk Aktif',
            value: props.totalActiveProducts ?? 0,
            icon: Package,
            color: 'text-[#465fff]',
        },
        {
            label: 'Total Stok Gudang',
            value: props.totalStock ?? 0,
            icon: Boxes,
            color: 'text-emerald-500',
        },
        {
            label: 'Total Distribusi',
            value: props.totalDistributions ?? 0,
            icon: ShoppingCart,
            color: 'text-amber-500',
        },
        {
            label: 'Pendapatan Hari Ini',
            value: `Rp ${(props.totalDailyIncomeToday ?? 0).toLocaleString('id-ID')}`,
            icon: TrendingUp,
            color: 'text-violet-500',
        },
    ];
    return (
        <>
            <div>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                    Dashboard Superadmin
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Ringkasan operasional inventory gudang.
                </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((m) => (
                    <div key={m.label} className={card}>
                        <div className="flex size-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10">
                            <m.icon className={`size-6 ${m.color}`} />
                        </div>
                        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                            {m.label}
                        </p>
                        <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                            {m.value}
                        </p>
                    </div>
                ))}
            </div>
            {(props.lowStockProducts?.length ?? 0) > 0 && (
                <div className={card}>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="size-5 text-amber-500" />
                        <h2 className="font-semibold text-slate-900 dark:text-white">
                            Peringatan Stok Minimum
                        </h2>
                    </div>
                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-xs text-slate-500 uppercase">
                                <tr>
                                    <th className="px-3 py-2">SKU</th>
                                    <th className="px-3 py-2">Nama</th>
                                    <th className="px-3 py-2">Stok</th>
                                    <th className="px-3 py-2">Min. Stok</th>
                                </tr>
                            </thead>
                            <tbody>
                                {props.lowStockProducts!.map((p) => (
                                    <tr
                                        key={p.id}
                                        className="border-t border-slate-100 dark:border-white/[0.06]"
                                    >
                                        <td className="px-3 py-2 font-medium text-slate-900 dark:text-white">
                                            {p.sku}
                                        </td>
                                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                                            {p.name}
                                        </td>
                                        <td className="px-3 py-2 text-rose-500">
                                            {p.stockBalance?.quantity ?? 0}
                                        </td>
                                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                                            {p.minimum_stock}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            <div className={card}>
                <h2 className="font-semibold text-slate-900 dark:text-white">
                    Aktivitas Terbaru
                </h2>
                {(props.recentMovements?.length ?? 0) === 0 ? (
                    <p className="mt-4 text-sm text-slate-500">
                        Belum ada aktivitas.
                    </p>
                ) : (
                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-xs text-slate-500 uppercase">
                                <tr>
                                    <th className="px-3 py-2">Produk</th>
                                    <th className="px-3 py-2">Tipe</th>
                                    <th className="px-3 py-2">Jumlah</th>
                                    <th className="px-3 py-2">Waktu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {props.recentMovements!.map((m) => (
                                    <tr
                                        key={m.id}
                                        className="border-t border-slate-100 dark:border-white/[0.06]"
                                    >
                                        <td className="px-3 py-2 font-medium text-slate-900 dark:text-white">
                                            {m.product?.name ?? '-'}
                                        </td>
                                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                                            {m.movement_type}
                                        </td>
                                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                                            {m.quantity}
                                        </td>
                                        <td className="px-3 py-2 text-slate-500">
                                            {new Date(
                                                m.created_at,
                                            ).toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}

function UserDashboard(props: PageProps) {
    const remaining =
        (props.totalDistributed ?? 0) - (props.totalReturned ?? 0);
    const metrics = [
        {
            label: 'Total Didistribusikan',
            value: props.totalDistributed ?? 0,
            icon: ShoppingCart,
        },
        {
            label: 'Total Dikembalikan',
            value: props.totalReturned ?? 0,
            icon: ArrowDown,
        },
        { label: 'Sisa Belum Dikembalikan', value: remaining, icon: ArrowUp },
        {
            label: 'Pendapatan Hari Ini',
            value: `Rp ${(props.todayIncome ?? 0).toLocaleString('id-ID')}`,
            icon: TrendingUp,
        },
    ];
    return (
        <>
            <div>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                    Dashboard Saya
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Ringkasan barang dan pendapatan Anda.
                </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((m) => (
                    <div key={m.label} className={card}>
                        <div className="flex size-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10">
                            <m.icon className="size-6 text-[#465fff]" />
                        </div>
                        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                            {m.label}
                        </p>
                        <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                            {m.value}
                        </p>
                    </div>
                ))}
            </div>
            <div className={card}>
                <h2 className="font-semibold text-slate-900 dark:text-white">
                    Distribusi dengan Sisa Barang
                </h2>
                {(props.myDistributions?.length ?? 0) === 0 ? (
                    <p className="mt-4 text-sm text-slate-500">
                        Tidak ada distribusi dengan sisa barang.
                    </p>
                ) : (
                    <div className="mt-4 space-y-3">
                        {props.myDistributions!.map((d) => (
                            <div
                                key={d.id}
                                className="rounded-xl border border-slate-100 p-3 dark:border-white/[0.06]"
                            >
                                <p className="font-medium text-slate-900 dark:text-white">
                                    {d.distribution_number} -{' '}
                                    {d.distribution_date}
                                </p>
                                {d.items?.map((item) => (
                                    <div
                                        key={item.id}
                                        className="mt-1 flex justify-between text-sm text-slate-600 dark:text-slate-300"
                                    >
                                        <span>{item.product?.name}</span>
                                        <span>
                                            Sisa:{' '}
                                            {item.quantity -
                                                item.returned_quantity}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }],
};
