<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
function check($ok, $message) { if (!$ok) throw new RuntimeException($message); echo "PASS: $message\n"; }
$controller = new App\Http\Controllers\DashboardController;
$method = new ReflectionMethod($controller, 'monthlyProfit');
$dates = [today()->startOfMonth()->toDateString(), today()->endOfMonth()->toDateString()];
foreach ([null, App\Models\User::firstOrFail()->id] as $userId) {
    $revenue = App\Models\DailyIncome::whereBetween('income_date', $dates)->when($userId !== null, fn($q) => $q->where('user_id', $userId))->sum('amount');
    $capital = Illuminate\Support\Facades\DB::table('stock_distribution_items as i')->join('stock_distributions as d', 'd.id', '=', 'i.stock_distribution_id')->join('products as p', 'p.id', '=', 'i.product_id')->where('d.status', 'POSTED')->whereBetween('d.distribution_date', $dates)->when($userId !== null, fn($q) => $q->where('d.user_id', $userId))->selectRaw('COALESCE(SUM((i.quantity-i.returned_quantity)*p.purchase_price),0) as amount')->value('amount');
    check(abs($method->invoke($controller, $userId) - ($revenue - $capital)) < 0.001, 'Monthly profit matches independent SQL calculation, scope=' . ($userId ?? 'all'));
}
foreach ([3, 24, 49] as $count) {
    $menus = collect(range(1, $count))->map(fn($i) => (object)['name' => "Menu $i", 'category' => 'Kategori']);
    $html = view('pendapatan-template', ['menuItems' => $menus])->render();
    check(substr_count($html, '<section class="page">') === (int)ceil($count / 24), "Template pagination for $count menus");
    check(substr_count($html, '<div class="name">') === $count && !str_contains($html, 'class="count"'), 'Every menu is listed without writing boxes');
}
