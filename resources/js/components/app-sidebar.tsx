import { Link } from '@inertiajs/react';
import {
    BarChart3,
    Boxes,
    ChevronDown,
    LayoutDashboard,
    Package,
    Settings2,
    Users,
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

const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutDashboard },
    { title: 'Produk', href: '#', icon: Package },
    { title: 'Stok Barang', href: '#', icon: Boxes },
    { title: 'Pengguna', href: '#', icon: Users },
    { title: 'Laporan', href: '#', icon: BarChart3 },
];

export function AppSidebar() {
    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-r-0 bg-[#1c2434]"
        >
            <SidebarHeader className="border-b border-white/10 bg-[#1c2434] p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="text-white hover:bg-white/10 hover:text-white"
                        >
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="bg-[#1c2434] px-3 py-5 text-slate-300">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-medium tracking-wider text-slate-500 uppercase">
                        Menu Utama
                    </SidebarGroupLabel>
                    <SidebarMenu className="gap-1">
                        {mainNavItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={item.title}
                                    className="h-11 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white data-[active=true]:bg-[#465fff] data-[active=true]:text-white"
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && (
                                            <item.icon className="size-5" />
                                        )}
                                        <span>{item.title}</span>
                                        {item.title === 'Produk' && (
                                            <ChevronDown className="ml-auto size-4" />
                                        )}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup className="mt-5">
                    <SidebarGroupLabel className="text-xs font-medium tracking-wider text-slate-500 uppercase">
                        Pengaturan
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                tooltip="Pengaturan"
                                className="h-11 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
                            >
                                <Link href="#">
                                    <Settings2 className="size-5" />
                                    <span>Pengaturan</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t border-white/10 bg-[#1c2434] p-3">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
