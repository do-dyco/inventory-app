<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['stock_opname_id', 'product_id', 'system_quantity', 'physical_quantity', 'difference_quantity', 'notes', 'counted_by', 'counted_at'])]
class StockOpnameItem extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return ['counted_at' => 'datetime'];
    }

    public function stockOpname(): BelongsTo
    {
        return $this->belongsTo(StockOpname::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
