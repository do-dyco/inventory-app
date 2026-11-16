import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Boxes,
    Building2,
    ClipboardCheck,
    ClipboardList,
    LayoutDashboard,
    Package,
    RotateCcw,
    Settings2,
    TrendingUp,
    Users,
    Warehouse,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const masterNav: NavItem[] = [
    { title: 'Cabang', href: '/cabang', icon: Building2 },
    { title: 'Menu', href: '/menu', icon: Package },
    { title: 'User', href: '/users', icon: Users },
    { title: 'Barang', href: '/products', icon: Package },
    { title: 'Satuan', href: '/units', icon: Boxes },
];

const transaksiNav: NavItem[] = [
    { title: 'Stok', href: '/stok', icon: Boxes },
    { title: 'Distribusi', href: '/distribusi', icon: Warehouse },
    { title: 'Pengembalian', href: '/pengembalian', icon: RotateCcw },
    { title: 'Stock Opname', href: '/opname', icon: ClipboardList },
    { title: 'Pendapatan Harian', href: '/pendapatan', icon: TrendingUp },
];

const laporanNav: NavItem[] = [
    { title: 'Laporan Stok', href: '/laporan/stok', icon: BarChart3 },
    {
        title: 'Laporan Stock Opname',
        href: '/laporan/opname',
        icon: ClipboardList,
    },
    {
        title: 'Laporan Distribusi',
        href: '/laporan/distribusi',
        icon: Warehouse,
    },
    {
        title: 'Laporan Pendapatan',
        href: '/laporan/pendapatan',
        icon: TrendingUp,
    },
    {
        title: 'Laporan Pengembalian',
        href: '/laporan/pengembalian',
        icon: RotateCcw,
    },
];

const userTransaksiNav: NavItem[] = [
    { title: 'Distribusi', href: '/distribusi', icon: Warehouse },
    { title: 'Pengembalian', href: '/pengembalian', icon: RotateCcw },
    { title: 'Pendapatan', href: '/pendapatan', icon: TrendingUp },
];

function navItems(items: NavItem[]) {
    return items.map((item) => (
        <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
                asChild
                tooltip={item.title}
                className="h-11 rounded-lg text-gray-700 hover:bg-gray-100 data-[active=true]:bg-brand-500 data-[active=true]:text-white dark:text-gray-300 dark:hover:bg-gray-800"
            >
                <Link href={item.href} prefetch>
                    {item.icon && <item.icon className="size-5" />}
                    <span>{item.title}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    ));
}

const groupLabel = 'text-xs font-medium tracking-wider text-gray-400 uppercase';

export function AppSidebar() {
    const { auth } = usePage().props;
    const isSuperadmin =
        (auth.user as { is_superadmin?: boolean }).is_superadmin === true;

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-r-0 bg-white dark:bg-gray-900"
        >
            <SidebarHeader className="border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
                        >
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="bg-white px-3 py-5 text-gray-700 dark:bg-gray-900 dark:text-gray-300">
                <SidebarGroup>
                    <SidebarMenu className="gap-1">
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                tooltip="Dashboard"
                                className="h-11 rounded-lg text-gray-700 hover:bg-gray-100 data-[active=true]:bg-brand-500 data-[active=true]:text-white dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <Link href={dashboard()} prefetch>
                                    <LayoutDashboard className="size-5" />
                                    <span>Dashboard</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
                {isSuperadmin && (
                    <SidebarGroup className="mt-4">
                        <SidebarGroupLabel className={groupLabel}>
                            Data Master
                        </SidebarGroupLabel>
                        <SidebarMenu className="gap-1">
                            {navItems(masterNav)}
                        </SidebarMenu>
                    </SidebarGroup>
                )}
                <SidebarGroup className="mt-4">
                    <SidebarGroupLabel className={groupLabel}>
                        Transaksi
                    </SidebarGroupLabel>
                    <SidebarMenu className="gap-1">
                        {navItems(
                            isSuperadmin ? transaksiNav : userTransaksiNav,
                        )}
                    </SidebarMenu>
                </SidebarGroup>
                {isSuperadmin && (
                    <>
                        <SidebarGroup className="mt-4">
                            <SidebarGroupLabel className={groupLabel}>
                                Laporan
                            </SidebarGroupLabel>
                            <SidebarMenu className="gap-1">
                                {navItems(laporanNav)}
                            </SidebarMenu>
                        </SidebarGroup>
                        <SidebarGroup className="mt-4">
                            <SidebarGroupLabel className={groupLabel}>
                                Audit
                            </SidebarGroupLabel>
                            <SidebarMenu className="gap-1">
                                {navItems([
                                    {
                                        title: 'Audit Log',
                                        href: '/audit',
                                        icon: ClipboardCheck,
                                    },
                                ])}
                            </SidebarMenu>
                        </SidebarGroup>
                    </>
                )}
                <SidebarGroup className="mt-4">
                    <SidebarGroupLabel className={groupLabel}>
                        Pengaturan
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                tooltip="Pengaturan"
                                className="h-11 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <Link href="/settings/profile">
                                    <Settings2 className="size-5" />
                                    <span>Pengaturan</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
