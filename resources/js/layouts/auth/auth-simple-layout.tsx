import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-screen w-full bg-white dark:bg-[#1c2434]">
            {/* Form side */}
            <div className="flex w-full flex-1 flex-col lg:w-1/2">
                <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10">
                    <div className="mb-8 flex flex-col gap-2">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-2"
                        >
                            <div className="flex size-10 items-center justify-center rounded-xl bg-[#465fff] text-white">
                                <AppLogoIcon className="size-6 fill-current text-white" />
                            </div>
                            <span className="text-lg font-semibold text-slate-900 dark:text-white">
                                Inventory App
                            </span>
                        </Link>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {title}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {description}
                        </p>
                    </div>

                    <div className="mt-8">{children}</div>
                </div>
            </div>

            {/* Branding panel */}
            <div className="relative hidden w-1/2 items-center justify-center bg-[#1c2434] lg:flex dark:bg-white/5">
                <div className="flex max-w-sm flex-col items-center text-center">
                    <div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-[#465fff] shadow-lg shadow-[#465fff]/30">
                        <AppLogoIcon className="size-12 fill-current text-white" />
                    </div>
                    <h2 className="mb-3 text-3xl font-bold text-white">
                        Inventory Gudang
                    </h2>
                    <p className="text-slate-400">
                        Sistem manajemen stok & gudang berbasis Laravel Inertia
                        + TailAdmin
                    </p>
                    <div className="mt-10 grid grid-cols-3 gap-4">
                        {[
                            { value: '2.450', label: 'Produk' },
                            { value: '128', label: 'Pengguna' },
                            { value: '386', label: 'Transaksi' },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-xl bg-white/5 px-4 py-3"
                            >
                                <p className="text-xl font-bold text-white">
                                    {stat.value}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
