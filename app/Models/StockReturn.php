<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['return_number', 'stock_distribution_id', 'user_id', 'return_date', 'notes'])]
class StockReturn extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return ['return_date' => 'date'];
    }

    public function stockDistribution(): BelongsTo
    {
        return $this->belongsTo(StockDistribution::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(StockReturnItem::class);
    }
}
