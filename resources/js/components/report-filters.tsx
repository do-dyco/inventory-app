import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type ReportFilterValues = {
    start_date?: string;
    end_date?: string;
    branch_id?: string | number | null;
};

type Branch = { id: number; name: string };
type Props = { filters?: ReportFilterValues; branches?: Branch[] };

export function ReportFilters({ filters = {}, branches }: Props) {
    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const params = Object.fromEntries(new FormData(e.currentTarget));
        if (!params.branch_id) delete params.branch_id;
        router.get(window.location.pathname, params, {
            preserveState: true,
            replace: true,
        });
    }

    return (
        <form onSubmit={submit} className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <label className="grid gap-1 text-sm text-gray-600 dark:text-gray-400">
                Dari
                <Input name="start_date" type="date" defaultValue={filters.start_date ?? ''} />
            </label>
            <label className="grid gap-1 text-sm text-gray-600 dark:text-gray-400">
                Sampai
                <Input name="end_date" type="date" defaultValue={filters.end_date ?? ''} />
            </label>
            {branches && (
                <label className="grid gap-1 text-sm text-gray-600 dark:text-gray-400">
                    Cabang
                    <select name="branch_id" defaultValue={String(filters.branch_id ?? '')} className="h-11 rounded-[10px] border border-gray-300 bg-white px-3 text-sm shadow-theme-xs dark:border-gray-700 dark:bg-gray-900">
                        <option value="">Semua</option>
                        {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>{branch.name}</option>
                        ))}
                    </select>
                </label>
            )}
            <Button type="submit">Terapkan</Button>
            <Button type="button" variant="outline" onClick={() => router.get(window.location.pathname)}>Reset</Button>
        </form>
    );
}
export const fmtDate = (value: string | null | undefined, withTime = false) => {
    if (!value) return '-';
    const date = new Date(value.includes('T') ? value : `${value}T00:00:00`);
    return date.toLocaleString('id-ID', withTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' });
};

// ponytail: Laravel decimal casts arrive as strings; coerce before locale formatting.
export const fmtNum = (value: number | string | null | undefined) => Number(value || 0).toLocaleString('id-ID');

export const fmtCurrency = (value: number | string | null | undefined) => Number(value || 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
