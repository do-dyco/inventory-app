<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\DailyIncomeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MenuItemController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\StockDistributionController;
use App\Http\Controllers\StockOpnameController;
use App\Http\Controllers\StockReturnController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Pendapatan
    Route::get('pendapatan', [DailyIncomeController::class, 'index'])->name('pendapatan.index');
    Route::get('pendapatan/template', [DailyIncomeController::class, 'template'])->name('pendapatan.template');
    Route::post('pendapatan', [DailyIncomeController::class, 'store'])->name('pendapatan.store');
    Route::post('pendapatan/batch', [DailyIncomeController::class, 'storeBatch'])->name('pendapatan.storeBatch');
    Route::put('pendapatan/{dailyIncome}', [DailyIncomeController::class, 'update'])->name('pendapatan.update');
    Route::delete('pendapatan/{dailyIncome}', [DailyIncomeController::class, 'destroy'])->name('pendapatan.destroy');

    // Distribusi
    Route::get('distribusi', [StockDistributionController::class, 'index'])->name('distribusi.index');
    Route::get('distribusi/create', [StockDistributionController::class, 'create'])->name('distribusi.create');
    Route::post('distribusi', [StockDistributionController::class, 'store'])->name('distribusi.store');
    Route::put('distribusi/{distribution}', [StockDistributionController::class, 'update'])->name('distribusi.update');
    Route::get('distribusi/{distribution}', [StockDistributionController::class, 'show'])->name('distribusi.show');

    // Pengembalian
    Route::get('pengembalian', [StockReturnController::class, 'index'])->name('pengembalian.index');
    Route::get('pengembalian/create', [StockReturnController::class, 'create'])->name('pengembalian.create');
    Route::get('pengembalian/{return}', [StockReturnController::class, 'show'])->name('pengembalian.show');
    Route::post('pengembalian', [StockReturnController::class, 'store'])->name('pengembalian.store');
    Route::put('pengembalian/{return}', [StockReturnController::class, 'update'])->name('pengembalian.update');
});

Route::middleware(['auth', 'verified', 'role:superadmin'])->group(function () {
    // Master Cabang
    Route::get('cabang', [BranchController::class, 'index'])->name('cabang.index');
    Route::post('cabang', [BranchController::class, 'store'])->name('cabang.store');
    Route::put('cabang/{branch}', [BranchController::class, 'update'])->name('cabang.update');
    Route::patch('cabang/{branch}/toggle', [BranchController::class, 'toggleActive'])->name('cabang.toggle');

    // Master Menu
    Route::get('menu', [MenuItemController::class, 'index'])->name('menu.index');
    Route::post('menu', [MenuItemController::class, 'store'])->name('menu.store');
    Route::put('menu/{menuItem}', [MenuItemController::class, 'update'])->name('menu.update');
    Route::patch('menu/{menuItem}/toggle', [MenuItemController::class, 'toggleActive'])->name('menu.toggle');

    // Master User
    Route::get('users', [UserController::class, 'index'])->name('users.index');
    Route::post('users', [UserController::class, 'store'])->name('users.store');
    Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::patch('users/{user}/toggle', [UserController::class, 'toggleActive'])->name('users.toggle');

    // Master Satuan
    Route::get('units', [UnitController::class, 'index'])->name('units.index');
    Route::post('units', [UnitController::class, 'store'])->name('units.store');
    Route::put('units/{unit}', [UnitController::class, 'update'])->name('units.update');
    Route::patch('units/{unit}/toggle', [UnitController::class, 'toggleActive'])->name('units.toggle');

    // Master Barang
    Route::get('products', [ProductController::class, 'index'])->name('products.index');
    Route::post('products', [ProductController::class, 'store'])->name('products.store');
    Route::put('products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::patch('products/{product}/toggle', [ProductController::class, 'toggleActive'])->name('products.toggle');

    // Stok
    Route::get('stok', [StockController::class, 'index'])->name('stok.index');
    Route::post('stok/initial', [StockController::class, 'storeInitial'])->name('stok.initial');
    Route::post('stok/in', [StockController::class, 'storeIn'])->name('stok.in');
    Route::post('stok/batch', [StockController::class, 'storeBatch'])->name('stok.batch');
    Route::post('stok/adjustment', [StockController::class, 'storeAdjustment'])->name('stok.adjustment');

    Route::patch('distribusi/{distribution}/cancel', [StockDistributionController::class, 'cancel'])->name('distribusi.cancel');

    // Opname
    Route::get('opname', [StockOpnameController::class, 'index'])->name('opname.index');
    Route::post('opname', [StockOpnameController::class, 'create'])->name('opname.create');
    Route::get('opname/{opname}', [StockOpnameController::class, 'show'])->name('opname.show');
    Route::put('opname/{opname}/items/{item}', [StockOpnameController::class, 'updateItem'])->name('opname.items.update');
    Route::patch('opname/{opname}/post', [StockOpnameController::class, 'post'])->name('opname.post');
    Route::patch('opname/{opname}/cancel', [StockOpnameController::class, 'cancel'])->name('opname.cancel');

    // Laporan
    Route::get('laporan/stok', [ReportController::class, 'stock'])->name('laporan.stok');
    Route::get('laporan/opname', [ReportController::class, 'opname'])->name('laporan.opname');
    Route::get('laporan/distribusi', [ReportController::class, 'distribusi'])->name('laporan.distribusi');
    Route::get('laporan/pendapatan', [ReportController::class, 'pendapatan'])->name('laporan.pendapatan');
    Route::get('laporan/pengembalian', [ReportController::class, 'pengembalian'])->name('laporan.pengembalian');

    // Audit
    Route::get('audit', [ActivityLogController::class, 'index'])->name('audit.index');
});

require __DIR__.'/settings.php';
