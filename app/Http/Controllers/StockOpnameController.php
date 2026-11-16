<?php

namespace App\Http\Controllers;

use App\Models\StockBalance;
use App\Models\StockMovement;
use App\Models\StockOpname;
use App\Models\StockOpnameItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StockOpnameController extends Controller
{
    public function index()
    {
        $opnames = StockOpname::with(['creator', 'poster'])
            ->withCount('items as items_count')
            ->latest()
            ->paginate(15);

        return Inertia::render('gudang/opname', ['opnames' => $opnames]);
    }

    public function create()
    {
        if (StockOpname::whereIn('status', ['DRAFT', 'COUNTING'])->exists()) {
            return redirect()->back()->with('error', 'An active opname session already exists.');
        }

        $opname = DB::transaction(function () {
            $date = now();
            $prefix = 'OP-' . $date->format('Ymd') . '-';
            $latest = StockOpname::where('opname_number', 'like', $prefix . '%')->latest('id')->lockForUpdate()->first();
            $seq = $latest ? ((int) substr($latest->opname_number, -3)) + 1 : 1;

            $opname = StockOpname::create([
                'opname_number' => $prefix . str_pad((string) $seq, 3, '0', STR_PAD_LEFT),
                'cutoff_at' => $date,
                'status' => 'DRAFT',
                'created_by' => auth()->id(),
            ]);

            $balances = StockBalance::with('product')->get();
            $rows = $balances->map(fn ($b) => [
                'stock_opname_id' => $opname->id,
                'product_id' => $b->product_id,
                'system_quantity' => $b->quantity,
                'created_at' => now(),
                'updated_at' => now(),
            ])->all();
            StockOpnameItem::insert($rows);

            return $opname;
        });

        return redirect()->route('opname.show', $opname);
    }

    public function show(StockOpname $opname)
    {
        $opname->load(['items.product.unit', 'creator', 'poster']);

        return Inertia::render('gudang/opname-show', ['opname' => $opname]);
    }

    public function updateItem(Request $request, StockOpname $opname, StockOpnameItem $item)
    {
        $validated = $request->validate([
            'physical_quantity' => ['required', 'integer', 'min:0'],
        ]);

        $item->update([
            'physical_quantity' => $validated['physical_quantity'],
            'difference_quantity' => $validated['physical_quantity'] - $item->system_quantity,
            'counted_by' => auth()->id(),
            'counted_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Item counted.');
    }

    public function post(StockOpname $opname)
    {
        if (!in_array($opname->status, ['DRAFT', 'COUNTING'])) {
            return redirect()->back()->with('error', 'Opname cannot be posted.');
        }

        $opname->load('items');

        if ($opname->items->contains(fn ($i) => $i->physical_quantity === null)) {
            return redirect()->back()->with('error', 'All items must be counted before posting.');
        }

        DB::transaction(function () use ($opname) {
            foreach ($opname->items as $item) {
                if ($item->difference_quantity == 0) {
                    continue;
                }

                $movement = StockMovement::create([
                    'product_id' => $item->product_id,
                    'reference_type' => 'App\\Models\\StockOpname',
                    'reference_id' => $opname->id,
                    'movement_type' => $item->difference_quantity > 0 ? 'OPNAME_ADJUSTMENT_IN' : 'OPNAME_ADJUSTMENT_OUT',
                    'quantity' => abs($item->difference_quantity),
                    'movement_date' => now(),
                    'notes' => 'Opname ' . $opname->opname_number,
                    'created_by' => auth()->id(),
                ]);

                StockBalance::where('product_id', $item->product_id)->firstOrFail()->adjust($item->difference_quantity);
            }

            $opname->update([
                'status' => 'POSTED',
                'posted_by' => auth()->id(),
                'posted_at' => now(),
            ]);
        });

        return redirect()->back()->with('success', 'Opname posted.');
    }

    public function cancel(Request $request, StockOpname $opname)
    {
        if (!in_array($opname->status, ['DRAFT', 'COUNTING'])) {
            return redirect()->back()->with('error', 'Opname cannot be cancelled.');
        }

        $validated = $request->validate([
            'cancellation_reason' => ['required', 'string'],
        ]);

        $opname->update([
            'status' => 'CANCELLED',
            'cancelled_by' => auth()->id(),
            'cancelled_at' => now(),
            'cancellation_reason' => $validated['cancellation_reason'],
        ]);

        return redirect()->back()->with('success', 'Opname cancelled.');
    }
}
