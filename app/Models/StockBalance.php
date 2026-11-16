<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

#[Fillable(['product_id', 'quantity'])]
class StockBalance extends Model
{
    use HasFactory;

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function adjust(int $delta): void
    {
        DB::transaction(function () use ($delta) {
            $balance = static::whereKey($this->id)->lockForUpdate()->firstOrFail();
            if ($balance->quantity + $delta < 0) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'quantity' => "Stok {$balance->product->name} tidak mencukupi. Tersedia {$balance->quantity}, diminta " . abs($delta) . '. Pengajuan tidak disimpan.',
                ]);
            }
            $this->increment('quantity', $delta);
            $this->refresh();
        });
    }
}
