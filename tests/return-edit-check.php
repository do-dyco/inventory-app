<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
use App\Models\{StockReturn, StockBalance, StockMovement, User};
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
function check($ok, $msg) { if (!$ok) throw new RuntimeException($msg); echo "PASS: $msg\n"; }
DB::beginTransaction();
try {
    $return = StockReturn::has('items')->firstOrFail();
    $item = $return->items()->firstOrFail();
    $distItem = $item->stockDistributionItem;
    $balance = StockBalance::where('product_id', $item->product_id)->firstOrFail();
    $qty = $item->quantity; $stock = $balance->quantity; $returned = $distItem->returned_quantity;
    $user = User::where('role', 'superadmin')->firstOrFail();
    $controller = new App\Http\Controllers\StockReturnController;
    $send = function ($quantity) use ($controller, $return, $item, $user) {
        $request = Request::create('/pengembalian/' . $return->id, 'PUT', ['items' => [['id' => $item->id, 'quantity' => $quantity]]]);
        $request->setUserResolver(fn() => $user);
        $controller->update($request, $return);
    };
    $send($qty + 1);
    check($balance->fresh()->quantity === $stock + 1 && $distItem->fresh()->returned_quantity === $returned + 1, 'Increase updates warehouse and distributed return total');
    $send($qty);
    check($balance->fresh()->quantity === $stock && $distItem->fresh()->returned_quantity === $returned, 'Decrease reverses only delta');
    $count = StockMovement::count();
    try { $send($distItem->quantity + 1); throw new RuntimeException('Over-return accepted'); }
    catch (ValidationException $e) { check(StockMovement::count() === $count && $balance->fresh()->quantity === $stock, 'Over-return rejected without partial writes'); }
    $balance->adjust(-$stock);
    try { $send(0); throw new RuntimeException('Negative stock accepted'); }
    catch (ValidationException $e) { check($balance->fresh()->quantity === 0 && $item->fresh()->quantity === $qty, 'Return decrease cannot create negative warehouse stock'); }
} finally { DB::rollBack(); }
echo "All writes rolled back.\n";
