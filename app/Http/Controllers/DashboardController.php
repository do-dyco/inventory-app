<?php

namespace App\Http\Controllers;

use App\Models\DailyIncome;
use App\Models\Product;
use App\Models\StockBalance;
use App\Models\StockDistribution;
use App\Models\StockDistributionItem;
use App\Models\StockMovement;
use App\Models\StockReturn;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isSuperadmin()) {
            return Inertia::render('dashboard', $this->superadminData());
        }

        return Inertia::render('dashboard', $this->userData($user));
    }

    private function monthlyProfit(?int $userId = null): float
    {
        $dates = [today()->startOfMonth()->toDateString(), today()->endOfMonth()->toDateString()];
        $revenue = DailyIncome::whereBetween('income_date', $dates)
            ->when($userId !== null, fn ($q) => $q->where('user_id', $userId))->sum('amount');
        // ponytail: same current master purchase prices as the income report; snapshot if prices need historical accounting.
        $capital = StockDistribution::where('status', 'POSTED')->whereBetween('distribution_date', $dates)
            ->when($userId !== null, fn ($q) => $q->where('user_id', $userId))
            ->with('items.product')->get()->sum(fn ($d) => $d->items->sum(
                fn ($item) => ($item->quantity - $item->returned_quantity) * (float) ($item->product?->purchase_price ?? 0),
            ));
        return (float) $revenue - $capital;
    }

    private function superadminData(): array
    {
        $totalActiveProducts = Product::where('is_active', true)->count();
        $totalStock = (int) StockBalance::sum('quantity');
        $totalDistributions = StockDistribution::count();
        $totalReturns = StockReturn::count();
        $totalDailyIncomeToday = (float) DailyIncome::whereDate('income_date', today()->subDay())->sum('amount');

        $lowStockProducts = Product::where('is_active', true)
            ->whereHas('stockBalance', fn ($q) => $q->whereColumn('quantity', '<', 'products.minimum_stock'))
            ->with(['stockBalance', 'unit'])
            ->get();

        $recentMovements = StockMovement::with('product:id,name')
            ->latest()
            ->limit(10)
            ->get(['id', 'product_id', 'movement_type', 'quantity', 'created_at']);

        return [
            'role' => 'superadmin',
            'totalActiveProducts' => $totalActiveProducts,
            'totalStock' => $totalStock,
            'monthlyProfit' => $this->monthlyProfit(),
            'totalDistributions' => $totalDistributions,
            'totalReturns' => $totalReturns,
            'totalDailyIncomeToday' => $totalDailyIncomeToday,
            'lowStockProducts' => $lowStockProducts,
            'recentMovements' => $recentMovements,
        ];
    }

    private function userData($user): array
    {
        $myDistributions = StockDistribution::where('user_id', $user->id)
            ->with(['items' => fn ($q) => $q->whereColumn('returned_quantity', '<', 'quantity')->with('product:id,name,sku')])
            ->latest()
            ->get();

        $totalDistributed = (int) StockDistributionItem::whereHas('stockDistribution', fn ($q) => $q->where('user_id', $user->id))->sum('quantity');
        $totalReturned = (int) StockDistributionItem::whereHas('stockDistribution', fn ($q) => $q->where('user_id', $user->id))->sum('returned_quantity');
        $todayIncome = (float) DailyIncome::where('user_id', $user->id)->whereDate('income_date', today()->subDay())->sum('amount');
        $recentIncomes = DailyIncome::where('user_id', $user->id)->latest()->limit(5)->get();

        return [
            'role' => 'user',
            'myDistributions' => $myDistributions,
            'totalDistributed' => $totalDistributed,
            'totalReturned' => $totalReturned,
            'todayIncome' => $todayIncome,
            'monthlyProfit' => $this->monthlyProfit($user->id),
            'recentIncomes' => $recentIncomes,
        ];
    }
}
