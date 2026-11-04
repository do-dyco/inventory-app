<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. units
        Schema::create('units', function (Blueprint $t) {
            $t->id();
            $t->string('code')->unique();
            $t->string('name');
            $t->string('symbol')->nullable();
            $t->boolean('is_active')->default(true);
            $t->timestamps();
        });

        // 2. products
        Schema::create('products', function (Blueprint $t) {
            $t->id();
            $t->string('sku')->unique();
            $t->string('name');
            $t->foreignId('unit_id')->constrained('units');
            $t->decimal('purchase_price', 15, 2)->nullable();
            $t->decimal('selling_price', 15, 2)->nullable();
            $t->integer('minimum_stock')->default(0);
            $t->boolean('is_active')->default(true);
            $t->timestamps();
        });

        // 3. stock_balances
        Schema::create('stock_balances', function (Blueprint $t) {
            $t->id();
            $t->foreignId('product_id')->unique()->constrained('products');
            $t->integer('quantity')->default(0);
            $t->timestamps();
        });

        // 4. stock_movements (ledger)
        Schema::create('stock_movements', function (Blueprint $t) {
            $t->id();
            $t->foreignId('product_id')->constrained('products');
            $t->string('reference_type'); // e.g. App\Models\StockDistribution
            $t->unsignedBigInteger('reference_id');
            $t->string('movement_type'); // INITIAL_STOCK, STOCK_IN, DISTRIBUTION_OUT, etc.
            $t->integer('quantity'); // always positive
            $t->datetime('movement_date');
            $t->text('notes')->nullable();
            $t->foreignId('created_by')->nullable()->constrained('users');
            $t->timestamp('created_at')->useCurrent();
        });

        // 5. stock_distributions (header)
        Schema::create('stock_distributions', function (Blueprint $t) {
            $t->id();
            $t->string('distribution_number')->unique();
            $t->foreignId('user_id')->constrained('users'); // penerima
            $t->date('distribution_date');
            $t->text('notes')->nullable();
            $t->string('status')->default('POSTED'); // POSTED, CANCELLED
            $t->foreignId('created_by')->constrained('users'); // superadmin
            $t->timestamps();
        });

        // 6. stock_distribution_items
        Schema::create('stock_distribution_items', function (Blueprint $t) {
            $t->id();
            $t->foreignId('stock_distribution_id')->constrained('stock_distributions')->cascadeOnDelete();
            $t->foreignId('product_id')->constrained('products');
            $t->integer('quantity');
            $t->integer('returned_quantity')->default(0);
            $t->timestamps();
        });

        // 7. stock_returns (header)
        Schema::create('stock_returns', function (Blueprint $t) {
            $t->id();
            $t->string('return_number')->unique();
            $t->foreignId('stock_distribution_id')->constrained('stock_distributions');
            $t->foreignId('user_id')->constrained('users');
            $t->date('return_date');
            $t->text('notes')->nullable();
            $t->timestamps();
        });

        // 8. stock_return_items
        Schema::create('stock_return_items', function (Blueprint $t) {
            $t->id();
            $t->foreignId('stock_return_id')->constrained('stock_returns')->cascadeOnDelete();
            $t->foreignId('stock_distribution_item_id')->constrained('stock_distribution_items');
            $t->foreignId('product_id')->constrained('products');
            $t->integer('quantity');
            $t->timestamps();
        });

        // 9. daily_incomes
        Schema::create('daily_incomes', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained('users');
            $t->date('income_date');
            $t->decimal('amount', 15, 2);
            $t->string('payment_method')->nullable();
            $t->text('notes')->nullable();
            $t->timestamps();
            $t->unique(['user_id', 'income_date']);
        });

        // 10. activity_logs
        Schema::create('activity_logs', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->nullable()->constrained('users');
            $t->string('action');
            $t->string('subject_type')->nullable();
            $t->unsignedBigInteger('subject_id')->nullable();
            $t->text('description')->nullable();
            $t->json('properties')->nullable();
            $t->timestamp('created_at')->useCurrent();
        });

        // 11. stock_opnames
        Schema::create('stock_opnames', function (Blueprint $t) {
            $t->id();
            $t->string('opname_number')->unique();
            $t->datetime('cutoff_at');
            $t->string('status')->default('DRAFT'); // DRAFT, COUNTING, POSTED, CANCELLED
            $t->text('notes')->nullable();
            $t->foreignId('created_by')->constrained('users');
            $t->foreignId('posted_by')->nullable()->constrained('users');
            $t->datetime('posted_at')->nullable();
            $t->foreignId('cancelled_by')->nullable()->constrained('users');
            $t->datetime('cancelled_at')->nullable();
            $t->text('cancellation_reason')->nullable();
            $t->timestamps();
        });

        // 12. stock_opname_items
        Schema::create('stock_opname_items', function (Blueprint $t) {
            $t->id();
            $t->foreignId('stock_opname_id')->constrained('stock_opnames')->cascadeOnDelete();
            $t->foreignId('product_id')->constrained('products');
            $t->integer('system_quantity');
            $t->integer('physical_quantity')->nullable();
            $t->integer('difference_quantity')->nullable();
            $t->text('notes')->nullable();
            $t->foreignId('counted_by')->nullable()->constrained('users');
            $t->datetime('counted_at')->nullable();
            $t->timestamps();
            $t->unique(['stock_opname_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_opname_items');
        Schema::dropIfExists('stock_opnames');
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('daily_incomes');
        Schema::dropIfExists('stock_return_items');
        Schema::dropIfExists('stock_returns');
        Schema::dropIfExists('stock_distribution_items');
        Schema::dropIfExists('stock_distributions');
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('stock_balances');
        Schema::dropIfExists('products');
        Schema::dropIfExists('units');
    }
};
