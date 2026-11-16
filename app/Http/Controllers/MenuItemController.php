<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuItemController extends Controller
{
    public function index()
    {
        $items = MenuItem::latest()->get();

        return Inertia::render('master/menu', ['items' => $items]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'category' => ['nullable', 'string', 'max:100'],
            'is_active' => ['boolean'],
        ]);

        MenuItem::create($validated);

        return redirect()->back()->with('success', 'Menu ditambahkan.');
    }

    public function update(Request $request, MenuItem $menuItem)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'category' => ['nullable', 'string', 'max:100'],
            'is_active' => ['boolean'],
        ]);

        $menuItem->update($validated);

        return redirect()->back()->with('success', 'Menu diperbarui.');
    }

    public function toggleActive(MenuItem $menuItem)
    {
        $menuItem->update(['is_active' => !$menuItem->is_active]);

        return redirect()->back()->with('success', 'Status menu diubah.');
    }
}
