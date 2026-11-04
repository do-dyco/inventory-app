<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UnitController extends Controller
{
    public function index()
    {
        $units = Unit::latest()->get();

        return Inertia::render('master/units', ['units' => $units]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:units,code'],
            'name' => ['required', 'string', 'max:255'],
            'symbol' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
        ]);

        Unit::create($validated);

        return redirect()->back()->with('success', 'Unit created successfully.');
    }

    public function update(Request $request, Unit $unit)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'symbol' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
        ]);

        $unit->update($validated);

        return redirect()->back()->with('success', 'Unit updated successfully.');
    }

    public function toggleActive(Unit $unit)
    {
        $unit->update(['is_active' => !$unit->is_active]);

        return redirect()->back()->with('success', 'Unit status toggled.');
    }
}
