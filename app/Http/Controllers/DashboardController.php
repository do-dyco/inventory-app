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

    private function superadminData(): array
    {
        $totalActiveProducts = Product::where('is_active', true)->count();
        $totalStock = (int) StockBalance::sum('quantity');
        $totalDistributions = StockDistribution::count();
        $totalReturns = StockReturn::count();
        $totalDailyIncomeToday = (float) DailyIncome::whereDate('income_date', today())->sum('amount');

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
        $todayIncome = (float) DailyIncome::where('user_id', $user->id)->whereDate('income_date', today())->sum('amount');
        $recentIncomes = DailyIncome::where('user_id', $user->id)->latest()->limit(5)->get();

        return [
            'role' => 'user',
            'myDistributions' => $myDistributions,
            'totalDistributed' => $totalDistributed,
            'totalReturned' => $totalReturned,
            'todayIncome' => $todayIncome,
            'recentIncomes' => $recentIncomes,
        ];
    }
}
