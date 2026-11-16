import { createInertiaApp, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

type FlashProps = {
    flash?: { success?: string; error?: string };
    errors?: Record<string, string>;
};
router.on('success', (event) => {
    const props = event.detail.page.props as FlashProps;
    if (props.flash?.success) toast.success(props.flash.success);
    if (props.flash?.error) toast.error(props.flash.error);
    if (props.errors && Object.keys(props.errors).length) {
        toast.error(
            Object.values(props.errors)[0] ?? 'Input gagal disimpan.',
        );
    }
});
router.on('error', (event) => {
    const errors = Object.values(event.detail.errors as Record<string, string>);
    toast.error(errors[0] ?? 'Input gagal disimpan.');
});

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

// Register service worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
    });
}
