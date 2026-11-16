<?php
// Run: php tests/stock-safety-check.php (all writes are rolled back).
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Controllers\StockDistributionController;
use App\Models\StockBalance;
use App\Models\StockDistribution;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

function check(bool $ok, string $message): void {
    if (! $ok) throw new RuntimeException($message);
    echo "PASS: $message\n";
}

DB::beginTransaction();
try {
    $user = User::where('role', 'superadmin')->firstOrFail();
    auth()->setUser($user);
    $balance = StockBalance::where('quantity', '>', 1)->firstOrFail();
    $before = $balance->quantity;
    $counts = [StockDistribution::count(), StockMovement::count()];
    $qty = intdiv($before, 2) + 1;
    $request = Request::create('/distribusi', 'POST', [
        'user_id' => $user->id,
        'distribution_date' => '2099-12-31',
        'items' => array_fill(0, 2, ['product_id' => $balance->product_id, 'quantity' => $qty]),
    ]);
    $request->setUserResolver(fn () => $user);
    try {
        (new StockDistributionController)->store($request);
        throw new RuntimeException('Duplicate-product overdraw was accepted');
    } catch (ValidationException $e) {
        check(str_contains(implode(' ', $e->validator->errors()->all()), 'tidak mencukupi'), 'Overdraw returns Indonesian validation notification');
    }
    check($balance->fresh()->quantity === $before, 'Duplicate-product overdraw leaves stock unchanged');
    check([StockDistribution::count(), StockMovement::count()] === $counts, 'Failed distribution leaves no header, items or movements');

    $stale = $balance->fresh();
    $balance->adjust(-$before);
    try {
        $stale->adjust(-1);
        throw new RuntimeException('Stale balance overdraw was accepted');
    } catch (ValidationException $e) {
        check($balance->fresh()->quantity === 0, 'Guard uses locked current balance, not stale model');
    }
    $balance->adjust($before);
    check($balance->fresh()->quantity === $before, 'Valid stock changes still work');
} finally {
    DB::rollBack();
}
echo "All test writes rolled back.\n";
