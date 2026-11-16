<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BranchController extends Controller
{
    public function index()
    {
        $branches = Branch::withCount('users')->latest()->get();

        return Inertia::render('master/cabang', ['branches' => $branches]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:branches,code'],
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        Branch::create($validated);

        return redirect()->back()->with('success', 'Cabang dibuat.');
    }

    public function update(Request $request, Branch $branch)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $branch->update($validated);

        return redirect()->back()->with('success', 'Cabang diperbarui.');
    }

    public function toggleActive(Branch $branch)
    {
        $branch->update(['is_active' => !$branch->is_active]);

        return redirect()->back()->with('success', 'Status cabang diubah.');
    }
}
