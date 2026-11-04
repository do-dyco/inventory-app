<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['stock_distribution_id', 'product_id', 'quantity', 'returned_quantity'])]
class StockDistributionItem extends Model
{
    use HasFactory;

    public function stockDistribution(): BelongsTo
    {
        return $this->belongsTo(StockDistribution::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function stockReturnItems(): HasMany
    {
        return $this->hasMany(StockReturnItem::class);
    }
}
