<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_items', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->decimal('price', 15, 2);
            $t->string('category')->nullable();
            $t->boolean('is_active')->default(true);
            $t->timestamps();
        });

        Schema::table('daily_incomes', function (Blueprint $t) {
            $t->foreignId('menu_item_id')->nullable()->constrained('menu_items')->after('branch_id');
            $t->integer('quantity')->nullable()->after('menu_item_id');
        });
    }

    public function down(): void
    {
        Schema::table('daily_incomes', fn (Blueprint $t) => $t->dropForeign(['menu_item_id'])->dropColumn(['menu_item_id', 'quantity']));
        Schema::dropIfExists('menu_items');
    }
};
