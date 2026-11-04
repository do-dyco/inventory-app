<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['distribution_number', 'user_id', 'distribution_date', 'notes', 'status', 'created_by'])]
class StockDistribution extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return ['distribution_date' => 'date'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(StockDistributionItem::class);
    }

    public function returns(): HasMany
    {
        return $this->hasMany(StockReturn::class);
    }
}
