<?php

namespace App\Http\Controllers;

use App\Models\DailyIncome;
use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DailyIncomeController extends Controller
{
    public function index(Request $request)
    {
        $query = DailyIncome::with(['user', 'branch', 'menuItem'])->latest();

        if (!$request->user()->isSuperadmin()) {
            $query->where('user_id', $request->user()->id);
        }

        $menuItems = MenuItem::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('pendapatan/index', [
            'incomes' => $query->paginate(15),
            'menuItems' => $menuItems,
            'users' => $request->user()->isSuperadmin()
                ? User::where('role', 'user')->where('is_active', true)->with('branch:id,name')->orderBy('name')->get(['id', 'name', 'branch_id'])
                : null,
        ]);
    }

    public function template()
    {
        return view('pendapatan-template', [
            'menuItems' => MenuItem::where('is_active', true)->orderBy('category')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'income_date' => ['required', 'date'],
            'menu_item_id' => ['required', 'exists:menu_items,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'payment_method' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
            'user_id' => $request->user()->isSuperadmin()
                ? ['required', 'integer', 'exists:users,id']
                : ['nullable', 'integer', 'exists:users,id'],
        ]);
        $menu = MenuItem::findOrFail($validated['menu_item_id']);
        $validated['amount'] = $menu->price * $validated['quantity'];

        // ponytail: income belongs to the chosen branch user; superadmin may act on behalf
        $owner = $request->user()->isSuperadmin() ? User::findOrFail($validated['user_id']) : $request->user();

        DailyIncome::create(array_merge($validated, [
            'user_id' => $owner->id,
            'branch_id' => $owner->branch_id,
        ]));

        return redirect()->back()->with('success', 'Pendapatan dicatat.');
    }

    public function storeBatch(Request $request)
    {
        $validated = $request->validate([
            'income_date' => ['required', 'date'],
            'payment_method' => ['nullable', 'string', 'max:100'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.menu_item_id' => ['required', 'integer', 'exists:menu_items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'user_id' => $request->user()->isSuperadmin()
                ? ['required', 'integer', 'exists:users,id']
                : ['nullable', 'integer', 'exists:users,id'],
        ]);

        // ponytail: income belongs to the chosen branch user; superadmin may act on behalf
        $owner = $request->user()->isSuperadmin() ? User::findOrFail($validated['user_id']) : $request->user();

        $menus = MenuItem::findMany(collect($validated['items'])->pluck('menu_item_id'));

        \DB::transaction(function () use ($validated, $owner, $menus) {
            foreach ($validated['items'] as $item) {
                $menu = $menus->find($item['menu_item_id']);
                DailyIncome::create([
                    'income_date' => $validated['income_date'],
                    'menu_item_id' => $menu->id,
                    'quantity' => $item['quantity'],
                    'amount' => $menu->price * $item['quantity'],
                    'payment_method' => $validated['payment_method'] ?? null,
                    'user_id' => $owner->id,
                    'branch_id' => $owner->branch_id,
                ]);
            }
        });

        return redirect()->back()->with('success', 'Pendapatan dicatat.');
    }

    public function update(Request $request, DailyIncome $dailyIncome)
    {
        $user = $request->user();

        if (!$user->isSuperadmin() && $dailyIncome->user_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'income_date' => ['required', 'date'],
            'menu_item_id' => ['required', 'exists:menu_items,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'payment_method' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ]);
        $menu = \App\Models\MenuItem::findOrFail($validated['menu_item_id']);
        $validated['amount'] = $menu->price * $validated['quantity'];

        $dailyIncome->update($validated);

        return redirect()->back()->with('success', 'Pendapatan diperbarui.');
    }

    public function destroy(Request $request, DailyIncome $dailyIncome)
    {
        $user = $request->user();

        if (!$user->isSuperadmin() && $dailyIncome->user_id !== $user->id) {
            abort(403);
        }

        $dailyIncome->delete();

        return redirect()->back()->with('success', 'Income deleted.');
    }
}
