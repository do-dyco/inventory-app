<?php

namespace App\Http\Controllers;

use App\Models\StockBalance;
use App\Models\StockDistribution;
use App\Models\StockDistributionItem;
use App\Models\StockMovement;
use App\Models\StockReturn;
use App\Models\StockReturnItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StockReturnController extends Controller
{
    public function index(Request $request)
    {
        $returns = StockReturn::query()
            ->when(! $request->user()->isSuperadmin(), fn ($q) => $q->where('user_id', $request->user()->id))
            ->with('stockDistribution')
            ->withCount('items as total_items')
            ->latest()
            ->paginate(15);

        return Inertia::render('gudang/pengembalian', ['returns' => $returns]);
    }

    public function show(Request $request, StockReturn $return)
    {
        if (! $request->user()->isSuperadmin() && $return->user_id !== $request->user()->id) {
            abort(403);
        }
        $return->load(['items.product', 'stockDistribution', 'user']);

        return Inertia::render('gudang/pengembalian-show', ['return' => $return]);
    }

    public function update(Request $request, StockReturn $return)
    {
        abort_unless($request->user()->isSuperadmin() || $return->user_id === $request->user()->id, 403);
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'integer', 'distinct'],
            'items.*.quantity' => ['required', 'integer', 'min:0'],
        ]);
        DB::transaction(function () use ($return, $validated, $request) {
            $distribution = StockDistribution::whereKey($return->stock_distribution_id)->lockForUpdate()->firstOrFail();
            if ($distribution->status !== 'POSTED') {
                throw \Illuminate\Validation\ValidationException::withMessages(['quantity' => 'Distribusi sudah dibatalkan; pengembalian tidak bisa diedit.']);
            }
            foreach ($validated['items'] as $row) {
                $item = $return->items()->whereKey($row['id'])->lockForUpdate()->firstOrFail();
                $distItem = StockDistributionItem::whereKey($item->stock_distribution_item_id)->lockForUpdate()->firstOrFail();
                $delta = $row['quantity'] - $item->quantity;
                if ($delta === 0) continue;
                if ($distItem->returned_quantity + $delta > $distItem->quantity || $distItem->returned_quantity + $delta < 0) {
                    throw \Illuminate\Validation\ValidationException::withMessages(['quantity' => "Jumlah pengembalian {$item->product->name} melebihi jumlah distribusi yang tersisa."]);
                }
                StockBalance::where('product_id', $item->product_id)->firstOrFail()->adjust($delta);
                StockMovement::create([
                    'product_id' => $item->product_id,
                    'reference_type' => StockReturn::class,
                    'reference_id' => $return->id,
                    'movement_type' => $delta > 0 ? 'RETURN_IN' : 'ADJUSTMENT_OUT',
                    'quantity' => abs($delta),
                    'movement_date' => now(),
                    'notes' => "Koreksi {$return->return_number}",
                    'created_by' => $request->user()->id,
                ]);
                $distItem->increment('returned_quantity', $delta);
                $item->update(['quantity' => $row['quantity']]);
            }
        });
        return redirect()->back()->with('success', 'Pengembalian diperbarui.');
    }

    public function create(Request $request)
    {
        $distributions = StockDistribution::where('status', 'POSTED')
            ->when(! $request->user()->isSuperadmin(), fn ($q) => $q->where('user_id', $request->user()->id))
            ->with(['items' => fn ($q) => $q->whereColumn('returned_quantity', '<', 'quantity')->with('product'), 'user:id,name'])
            ->latest()
            ->get();

        return Inertia::render('gudang/pengembalian-create', ['distributions' => $distributions]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'stock_distribution_id' => ['required', 'exists:stock_distributions,id'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.stock_distribution_item_id' => ['required', 'exists:stock_distribution_items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $user = $request->user();

        DB::transaction(function () use ($validated, $user) {
            $distribution = StockDistribution::lockForUpdate()->findOrFail($validated['stock_distribution_id']);

            if (! $user->isSuperadmin() && $distribution->user_id !== $user->id) {
                abort(422, 'This distribution does not belong to you.');
            }

            $distItemIds = collect($validated['items'])->pluck('stock_distribution_item_id');
            $distItems = StockDistributionItem::whereIn('id', $distItemIds)->lockForUpdate()->get()->keyBy('id');

            foreach ($validated['items'] as $item) {
                $distItem = $distItems[$item['stock_distribution_item_id']];
                if ($distItem->returned_quantity + $item['quantity'] > $distItem->quantity) {
                    abort(422, 'Return quantity exceeds remaining for an item.');
                }
            }

            $prefix = 'RET-' . date('Ymd') . '-';
            $count = StockReturn::where('return_number', 'like', $prefix . '%')->count();
            $number = $prefix . str_pad($count + 1, 3, '0', STR_PAD_LEFT);

            $return = StockReturn::create([
                'return_number' => $number,
                'stock_distribution_id' => $distribution->id,
                'user_id' => $distribution->user_id,
                'return_date' => today(),
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $distItem = $distItems[$item['stock_distribution_item_id']];

                StockReturnItem::create([
                    'stock_return_id' => $return->id,
                    'stock_distribution_item_id' => $distItem->id,
                    'product_id' => $distItem->product_id,
                    'quantity' => $item['quantity'],
                ]);

                StockMovement::create([
                    'product_id' => $distItem->product_id,
                    'reference_type' => 'App\\Models\\StockReturn',
                    'reference_id' => $return->id,
                    'movement_type' => 'RETURN_IN',
                    'quantity' => $item['quantity'],
                    'movement_date' => now(),
                    'created_by' => $user->id,
                ]);

                StockBalance::where('product_id', $distItem->product_id)->firstOrFail()->adjust($item['quantity']);
                $distItem->increment('returned_quantity', $item['quantity']);
            }
        });

        return redirect()->back()->with('success', 'Return recorded.');
    }
}
