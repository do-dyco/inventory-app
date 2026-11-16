<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockBalance;
use App\Models\StockDistribution;
use App\Models\StockDistributionItem;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class StockDistributionController extends Controller
{
    public function index(Request $request)
    {
        $distributions = StockDistribution::with(['user', 'creator'])
            ->withCount('items as total_items')
            ->when(! $request->user()->isSuperadmin(), fn ($q) => $q->where('user_id', $request->user()->id))
            ->latest()
            ->paginate(15);

        return Inertia::render('gudang/distribusi', ['distributions' => $distributions]);
    }

    public function create(Request $request)
    {
        $users = $request->user()->isSuperadmin()
            ? User::where('role', 'user')->where('is_active', true)->get()
            : collect([$request->user()->only(['id', 'name'])]);
        $products = Product::where('is_active', true)->with('stockBalance')->get();

        return Inertia::render('gudang/distribusi-create', [
            'users' => $users,
            'products' => $products,
            'isSuperadmin' => $request->user()->isSuperadmin(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'distribution_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        if (! $request->user()->isSuperadmin() && (int) $validated['user_id'] !== $request->user()->id) {
            abort(403);
        }

        $distribution = DB::transaction(function () use ($validated) {
            $date = $validated['distribution_date'];
            $prefix = 'DIST-' . date('Ymd', strtotime($date)) . '-';
            $count = StockDistribution::where('distribution_number', 'like', $prefix . '%')->count();
            $number = $prefix . str_pad($count + 1, 3, '0', STR_PAD_LEFT);

            $dist = StockDistribution::create([
                'distribution_number' => $number,
                'user_id' => $validated['user_id'],
                'distribution_date' => $date,
                'notes' => $validated['notes'] ?? null,
                'status' => 'POSTED',
                'created_by' => auth()->id(),
            ]);

            foreach ($validated['items'] as $item) {
                StockDistributionItem::create([
                    'stock_distribution_id' => $dist->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'returned_quantity' => 0,
                ]);

                StockMovement::create([
                    'product_id' => $item['product_id'],
                    'reference_type' => 'App\\Models\\StockDistribution',
                    'reference_id' => $dist->id,
                    'movement_type' => 'DISTRIBUTION_OUT',
                    'quantity' => $item['quantity'],
                    'movement_date' => now(),
                    'created_by' => auth()->id(),
                ]);

                StockBalance::where('product_id', $item['product_id'])->firstOrFail()->adjust(-$item['quantity']);
            }

            return $dist;
        });

        return redirect()->route('distribusi.show', $distribution)->with('success', 'Distribution created.');
    }

    public function show(Request $request, StockDistribution $distribution)
    {
        if (! $request->user()->isSuperadmin() && $distribution->user_id !== $request->user()->id) {
            abort(403);
        }
        $distribution->load(['items.product.stockBalance', 'user', 'creator', 'returns.items.product']);

        return Inertia::render('gudang/distribusi-show', ['distribution' => $distribution]);
    }

    public function update(Request $request, StockDistribution $distribution)
    {
        if (! $request->user()->isSuperadmin() && $distribution->user_id !== $request->user()->id) {
            abort(403);
        }
        if ($distribution->status !== 'POSTED') {
            throw ValidationException::withMessages(['message' => 'Hanya distribusi berstatus POSTED yang bisa diedit.']);
        }

        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        DB::transaction(function () use ($distribution, $validated) {
            foreach ($validated['items'] as $row) {
                $item = $distribution->items()->where('id', $row['id'])->firstOrFail();
                if ($row['quantity'] < $item->returned_quantity) {
                    throw ValidationException::withMessages(['message' => "Jumlah {$item->product->name} tidak boleh di bawah jumlah yang sudah dikembalikan ({$item->returned_quantity})."]);
                }
                $delta = $row['quantity'] - $item->quantity;
                if ($delta === 0) {
                    continue;
                }

                if ($delta > 0) {
                    $balance = StockBalance::where('product_id', $item->product_id)->lockForUpdate()->firstOrFail();
                    StockMovement::create([
                        'product_id' => $item->product_id,
                        'reference_type' => 'App\\Models\\StockDistribution',
                        'reference_id' => $distribution->id,
                        'movement_type' => 'DISTRIBUTION_OUT',
                        'quantity' => $delta,
                        'movement_date' => now(),
                        'created_by' => auth()->id(),
                    ]);
                    $balance->adjust(-$delta);
                } else {
                    StockMovement::create([
                        'product_id' => $item->product_id,
                        'reference_type' => 'App\\Models\\StockDistribution',
                        'reference_id' => $distribution->id,
                        'movement_type' => 'REVERSAL',
                        'quantity' => abs($delta),
                        'movement_date' => now(),
                        'notes' => "Reversal for {$distribution->distribution_number}",
                        'created_by' => auth()->id(),
                    ]);
                    StockBalance::where('product_id', $item->product_id)->firstOrFail()->adjust(abs($delta));
                }

                $item->update(['quantity' => $row['quantity']]);
            }
        });

        return redirect()->back()->with('success', 'Distribution updated.');
    }

    public function cancel(StockDistribution $distribution)
    {
        if ($distribution->status !== 'POSTED' || $distribution->returns()->exists()) {
            abort(422, 'Cannot cancel this distribution.');
        }

        DB::transaction(function () use ($distribution) {
            foreach ($distribution->items as $item) {
                StockMovement::create([
                    'product_id' => $item->product_id,
                    'reference_type' => 'App\\Models\\StockDistribution',
                    'reference_id' => $distribution->id,
                    'movement_type' => 'REVERSAL',
                    'quantity' => $item->quantity,
                    'movement_date' => now(),
                    'notes' => "Reversal for {$distribution->distribution_number}",
                    'created_by' => auth()->id(),
                ]);

                StockBalance::where('product_id', $item->product_id)->firstOrFail()->adjust($item->quantity);
            }

            $distribution->update(['status' => 'CANCELLED']);
        });

        return redirect()->back()->with('success', 'Distribution cancelled.');
    }
}
