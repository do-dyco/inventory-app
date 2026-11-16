import { Head } from '@inertiajs/react';
import { fmtDate } from '@/components/report-filters';

type Log = {
    id: number;
    user: { name: string } | null;
    action: string;
    subject_type: string;
    subject_id: number;
    description: string;
    created_at: string;
};

type Props = { logs: { data: Log[] } };

const tableWrap =
    'overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900';

export default function AuditLogs({ logs }: Props) {
    return (
        <>
            <Head title="Audit Log Aktivitas" />
            <div className="mx-auto w-full max-w-[1536px] space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                        Log Aktivitas
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Riwayat aktivitas pengguna.
                    </p>
                </div>

                <div className={tableWrap}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase dark:bg-gray-800">
                                <tr>
                                    {[
                                        'Waktu',
                                        'User',
                                        'Aksi',
                                        'Subject',
                                        'Deskripsi',
                                    ].map((h) => (
                                        <th key={h} className="px-5 py-3">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {logs.data.map((l) => (
                                    <tr
                                        key={l.id}
                                        className="border-t border-gray-100 dark:border-gray-800"
                                    >
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {fmtDate(l.created_at, true)}
                                        </td>
                                        <td className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                            {l.user?.name ?? '-'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-white/[0.06] dark:text-slate-300">
                                                {l.action}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {l.subject_type} #{l.subject_id}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                                            {l.description}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

AuditLogs.layout = {
    breadcrumbs: [
        { title: 'Audit', href: '#' },
        { title: 'Log Aktivitas', href: '/audit' },
    ],
};
