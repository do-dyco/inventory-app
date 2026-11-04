<?php

namespace Database\Seeders;

use App\Models\Unit;
use Illuminate\Database\Seeder;

class UnitSeeder extends Seeder
{
    public function run(): void
    {
        $units = [
            ['code' => 'PCS', 'name' => 'Pieces', 'symbol' => 'pcs'],
            ['code' => 'UNIT', 'name' => 'Unit', 'symbol' => 'unit'],
            ['code' => 'BOX', 'name' => 'Box', 'symbol' => 'box'],
            ['code' => 'PACK', 'name' => 'Pack', 'symbol' => 'pack'],
            ['code' => 'DUS', 'name' => 'Dus', 'symbol' => 'dus'],
            ['code' => 'KG', 'name' => 'Kilogram', 'symbol' => 'kg'],
            ['code' => 'GR', 'name' => 'Gram', 'symbol' => 'g'],
            ['code' => 'L', 'name' => 'Liter', 'symbol' => 'L'],
            ['code' => 'ML', 'name' => 'Mililiter', 'symbol' => 'ml'],
            ['code' => 'BTL', 'name' => 'Botol', 'symbol' => 'botol'],
            ['code' => 'SAK', 'name' => 'Sak', 'symbol' => 'sak'],
            ['code' => 'SET', 'name' => 'Set', 'symbol' => 'set'],
        ];

        foreach ($units as $unit) {
            Unit::updateOrCreate(
                ['code' => $unit['code']],
                [
                    'name' => $unit['name'],
                    'symbol' => $unit['symbol'],
                    'is_active' => true,
                ]
            );
        }
    }
}
