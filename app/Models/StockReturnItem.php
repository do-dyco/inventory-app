<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['stock_return_id', 'stock_distribution_item_id', 'product_id', 'quantity'])]
class StockReturnItem extends Model
{
    use HasFactory;

    public function stockReturn(): BelongsTo
    {
        return $this->belongsTo(StockReturn::class);
    }

    public function stockDistributionItem(): BelongsTo
    {
        return $this->belongsTo(StockDistributionItem::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
