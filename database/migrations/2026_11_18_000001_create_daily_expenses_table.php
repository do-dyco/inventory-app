<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_expenses', function (Blueprint $t) {
            $t->id();
            $t->date('expense_date');
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $t->string('code', 50);
            $t->string('description')->nullable();
            $t->decimal('amount', 12, 2);
            $t->string('payment_method')->nullable();
            $t->text('notes')->nullable();
            $t->timestamps();

            $t->index(['expense_date', 'branch_id']);
            $t->index(['expense_date', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_expenses');
    }
};
