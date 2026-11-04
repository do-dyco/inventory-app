<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['sku', 'name', 'unit_id', 'purchase_price', 'selling_price', 'minimum_stock', 'is_active'])]
class Product extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'purchase_price' => 'decimal:2',
            'selling_price' => 'decimal:2',
        ];
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function stockBalance(): HasOne
    {
        return $this->hasOne(StockBalance::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function stockDistributionItems(): HasMany
    {
        return $this->hasMany(StockDistributionItem::class);
    }

    public function stockReturnItems(): HasMany
    {
        return $this->hasMany(StockReturnItem::class);
    }
}
