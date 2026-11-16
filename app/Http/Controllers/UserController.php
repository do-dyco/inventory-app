<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('branch')->latest()->paginate(15);
        $branches = Branch::where('is_active', true)->get();

        return Inertia::render('master/users', ['users' => $users, 'branches' => $branches]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'in:superadmin,user'],
            'branch_id' => ['nullable', 'exists:branches,id'],
            'is_active' => ['boolean'],
        ]);

        User::create($validated);

        return redirect()->back()->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'role' => ['required', 'in:superadmin,user'],
            'branch_id' => ['nullable', 'exists:branches,id'],
            'is_active' => ['boolean'],
        ]);

        $user->update($validated);

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    public function toggleActive(User $user)
    {
        $user->update(['is_active' => !$user->is_active]);

        return redirect()->back()->with('success', 'User status toggled.');
    }
}
