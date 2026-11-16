<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockBalance;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StockController extends Controller
{
    public function index()
    {
        $products = Product::with(['unit', 'stockBalance'])
            ->latest()
            ->get();

        $movements = StockMovement::with('product:id,name')
            ->latest()
            ->limit(20)
            ->get();

        return Inertia::render('gudang/stok', [
            'products' => $products,
            'movements' => $movements,
        ]);
    }

    public function storeInitial(Request $request)
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string'],
        ]);

        $this->recordIn('INITIAL_STOCK', [$validated], $validated['notes'] ?? null);

        return redirect()->back()->with('success', 'Initial stock recorded.');
    }

    public function storeIn(Request $request)
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string'],
        ]);

        $this->recordIn('STOCK_IN', [$validated], $validated['notes'] ?? null);

        return redirect()->back()->with('success', 'Stock in recorded.');
    }

    public function storeBatch(Request $request)
    {
        $validated = $request->validate([
            'movement_type' => ['required', 'in:in,initial'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.purchase_price' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        $type = $validated['movement_type'] === 'initial' ? 'INITIAL_STOCK' : 'STOCK_IN';
        $this->recordIn($type, $validated['items'], $validated['notes'] ?? null);

        return redirect()->back()->with('success', 'Stok dicatat.');
    }

    private function recordIn(string $movementType, array $items, ?string $notes): void
    {
        DB::transaction(function () use ($movementType, $items, $notes) {
            foreach ($items as $item) {
                if (isset($item['purchase_price']) && $item['purchase_price'] !== null) {
                    Product::where('id', $item['product_id'])->update(['purchase_price' => $item['purchase_price']]);
                }
                $movement = StockMovement::create([
                    'product_id' => $item['product_id'],
                    'reference_type' => 'App\\Models\\StockMovement',
                    'reference_id' => 0,
                    'movement_type' => $movementType,
                    'quantity' => $item['quantity'],
                    'movement_date' => now(),
                    'notes' => $notes,
                    'created_by' => auth()->id(),
                ]);
                $movement->update(['reference_id' => $movement->id]);

                StockBalance::where('product_id', $item['product_id'])->firstOrFail()->adjust($item['quantity']);
            }
        });
    }

    public function storeAdjustment(Request $request)
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'type' => ['required', 'in:in,out'],
            'notes' => ['required', 'string'],
        ]);

        DB::transaction(function () use ($validated) {
            $delta = $validated['type'] === 'in' ? $validated['quantity'] : -$validated['quantity'];
            $movementType = $validated['type'] === 'in' ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT';

            $balance = StockBalance::where('product_id', $validated['product_id'])->lockForUpdate()->firstOrFail();

            $movement = StockMovement::create([
                'product_id' => $validated['product_id'],
                'reference_type' => 'App\\Models\\StockMovement',
                'reference_id' => 0,
                'movement_type' => $movementType,
                'quantity' => $validated['quantity'],
                'movement_date' => now(),
                'notes' => $validated['notes'],
                'created_by' => auth()->id(),
            ]);
            $movement->update(['reference_id' => $movement->id]);

            $balance->adjust($delta);
        });

        return redirect()->back()->with('success', 'Stock adjustment recorded.');
    }
}
