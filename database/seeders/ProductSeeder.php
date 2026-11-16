<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\StockBalance;
use App\Models\StockMovement;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $unit = Unit::where('code', 'PCS')->firstOrFail();
        $admin = User::where('role', 'superadmin')->first();

        foreach ([
            ['sku' => 'TORTILA-SMALL', 'name' => 'Tortila Small', 'price' => 7000, 'stock' => 100],
            ['sku' => 'TORTILA-LARGE', 'name' => 'Tortila Large', 'price' => 9000, 'stock' => 100],
            ['sku' => 'AYAM-CRISPY', 'name' => 'Ayam Crispy', 'price' => 15000, 'stock' => 50],
            ['sku' => 'SAUS-KEJU', 'name' => 'Saus Keju', 'price' => 3000, 'stock' => 100],
        ] as $sample) {
            $product = Product::updateOrCreate(
                ['sku' => $sample['sku']],
                [
                    'name' => $sample['name'],
                    'unit_id' => $unit->id,
                    'purchase_price' => $sample['price'],
                    'minimum_stock' => 10,
                    'is_active' => true,
                ],
            );

            $balance = StockBalance::firstOrCreate(
                ['product_id' => $product->id],
                ['quantity' => $sample['stock']],
            );

            if ($balance->wasRecentlyCreated && $admin) {
                StockMovement::create([
                    'product_id' => $product->id,
                    'reference_type' => self::class,
                    'reference_id' => $product->id,
                    'movement_type' => 'INITIAL_STOCK',
                    'quantity' => $sample['stock'],
                    'movement_date' => now(),
                    'notes' => 'Sample data',
                    'created_by' => $admin->id,
                ]);
            }
        }
    }
}
