<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\DailyIncome;
use App\Models\Product;
use App\Models\StockDistribution;
use App\Models\StockOpname;
use App\Models\StockReturn;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    private function dates(Request $request): array
    {
        $dates = $request->validate([
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
        ]);

        // ponytail: default range = 1st of month → today; keep manual override via ?start_date
        if (empty($dates['start_date']) && empty($dates['end_date'])) {
            $dates['start_date'] = now()->startOfMonth()->toDateString();
            $dates['end_date'] = now()->toDateString();
        }

        return $dates;
    }

    private function filterDates(Builder $query, string $column, array $dates): Builder
    {
        return $query
            ->when($dates['start_date'] ?? null, fn ($q, $date) => $q->whereDate($column, '>=', $date))
            ->when($dates['end_date'] ?? null, fn ($q, $date) => $q->whereDate($column, '<=', $date));
    }

    private function filterBranch(Builder $query, array $dates, string $relation = 'branch_id'): Builder
    {
        return $query->when($dates['branch_id'] ?? null, function ($q, $branch) use ($relation) {
            return $relation === 'branch_id'
                ? $q->where($relation, $branch)
                : $q->whereHas($relation, fn ($user) => $user->where('branch_id', $branch));
        });
    }

    private function branches()
    {
        return Branch::where('is_active', true)->orderBy('name')->get(['id', 'name']);
    }

    private function filterCreatorBranch(Builder $query, array $dates): Builder
    {
        return $query->when($dates['branch_id'] ?? null, fn ($q, $branch) =>
            $q->whereHas('creator', fn ($user) => $user->where('branch_id', $branch))
        );
    }

    public function stock(Request $request)
    {
        $dates = $this->dates($request);
        $products = Product::with(['unit', 'stockBalance'])
            ->withSum([
                'stockMovements as total_in' => fn ($q) => $this->filterCreatorBranch($this->filterDates($q->whereIn('movement_type', ['INITIAL_STOCK', 'STOCK_IN', 'ADJUSTMENT_IN', 'OPNAME_ADJUSTMENT_IN', 'REVERSAL']), 'movement_date', $dates), $dates),
            ], 'quantity')
            ->withSum([
                'stockMovements as total_out' => fn ($q) => $this->filterCreatorBranch($this->filterDates($q->whereIn('movement_type', ['STOCK_OUT', 'ADJUSTMENT_OUT', 'OPNAME_ADJUSTMENT_OUT', 'DISTRIBUTION', 'DISTRIBUTION_OUT']), 'movement_date', $dates), $dates),
            ], 'quantity')
            ->latest()
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'sku' => $p->sku,
                'name' => $p->name,
                'unit' => $p->unit,
                'stock_balance' => $p->stockBalance,
                'minimum_stock' => $p->minimum_stock,
                'movements' => ['in' => $p->total_in, 'out' => $p->total_out],
            ]);

        return Inertia::render('laporan/stok', ['products' => $products, 'filters' => $dates, 'branches' => $this->branches()]);
    }

    public function opname(Request $request)
    {
        $dates = $this->dates($request);
        $opnames = $this->filterCreatorBranch(
            $this->filterDates(StockOpname::with(['creator', 'poster', 'items']), 'cutoff_at', $dates),
            $dates,
        )->latest()
            ->get()
            ->map(fn ($o) => [
                'id' => $o->id,
                'opname_number' => $o->opname_number,
                'cutoff_at' => $o->cutoff_at,
                'status' => $o->status,
                'creator' => $o->creator?->name,
                'poster' => $o->poster?->name,
                'surplus_count' => $o->items->where('difference_quantity', '>', 0)->count(),
                'shortage_count' => $o->items->where('difference_quantity', '<', 0)->count(),
                'total_diff' => $o->items->sum('difference_quantity'),
            ]);

        return Inertia::render('laporan/opname', ['opnames' => $opnames, 'filters' => $dates, 'branches' => $this->branches()]);
    }

    public function distribusi(Request $request)
    {
        $dates = $this->dates($request);
        $distributions = $this->filterBranch(
            $this->filterDates(StockDistribution::with(['user', 'items.product']), 'distribution_date', $dates),
            $dates,
            'user',
        )->latest()
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'distribution_number' => $d->distribution_number,
                'recipient_name' => $d->user?->name,
                'distribution_date' => $d->distribution_date,
                'total_distributed' => $d->items->sum('quantity'),
                'total_returned' => $d->items->sum('returned_quantity'),
                'remaining' => $d->items->sum('quantity') - $d->items->sum('returned_quantity'),
            ]);

        return Inertia::render('laporan/distribusi', ['distributions' => $distributions, 'filters' => $dates, 'branches' => $this->branches()]);
    }

    public function pendapatan(Request $request)
    {
        $dates = $this->dates($request);
        $incomes = $this->filterBranch(
            $this->filterDates(DailyIncome::with(['user', 'branch']), 'income_date', $dates),
            $dates,
        )->latest('income_date')->get();
        $distributions = $this->filterBranch(
            $this->filterDates(StockDistribution::with(['user', 'items.product']), 'distribution_date', $dates),
            $dates,
            'user',
        )->get();
        $capital = (float) $distributions->sum(fn ($d) => $d->items->sum(
            fn ($item) => ($item->quantity - $item->returned_quantity) * (float) ($item->product?->purchase_price ?? 0),
        ));
        $revenue = (float) $incomes->sum('amount');
        $expenses = $distributions
            ->flatMap(fn ($d) => $d->items->map(fn ($item) => [
                'id' => $item->id,
                'date' => $d->distribution_date,
                'distribution_number' => $d->distribution_number,
                'recipient_name' => $d->user?->name,
                'product_name' => $item->product?->name,
                'quantity' => $item->quantity - $item->returned_quantity,
                'unit_price' => (float) ($item->product?->purchase_price ?? 0),
                'subtotal' => ($item->quantity - $item->returned_quantity) * (float) ($item->product?->purchase_price ?? 0),
            ]))
            ->values()
            ->all();

        return Inertia::render('laporan/pendapatan', [
            'incomes' => $incomes,
            'filters' => $dates,
            'branches' => $this->branches(),
            'summary' => ['revenue' => $revenue, 'capital' => $capital, 'profit' => $revenue - $capital],
            'expenses' => $expenses,
        ]);
    }

    public function pengembalian(Request $request)
    {
        $dates = $this->dates($request);
        $returns = $this->filterBranch(
            $this->filterDates(StockReturn::with(['user', 'stockDistribution', 'items.product']), 'return_date', $dates),
            $dates,
            'user',
        )->latest()
            ->get()
            ->flatMap(fn ($r) => $r->items->map(fn ($item) => [
                'id' => $item->id,
                'return_number' => $r->return_number,
                'return_date' => $r->return_date,
                'distribution_number' => $r->stockDistribution?->distribution_number,
                'user_name' => $r->user?->name,
                'product_name' => $item->product?->name,
                'quantity' => $item->quantity,
            ]))
            ->values();

        return Inertia::render('laporan/pengembalian', ['returns' => $returns, 'filters' => $dates, 'branches' => $this->branches()]);
    }
}
