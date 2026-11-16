<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branches', function (Blueprint $t) {
            $t->id();
            $t->string('code')->unique();
            $t->string('name');
            $t->text('address')->nullable();
            $t->boolean('is_active')->default(true);
            $t->timestamps();
        });

        Schema::table('users', function (Blueprint $t) {
            $t->foreignId('branch_id')->nullable()->constrained('branches')->after('role');
        });

        Schema::table('daily_incomes', function (Blueprint $t) {
            $t->foreignId('branch_id')->nullable()->constrained('branches')->after('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('daily_incomes', fn (Blueprint $t) => $t->dropForeign(['branch_id'])->dropColumn('branch_id'));
        Schema::table('users', fn (Blueprint $t) => $t->dropForeign(['branch_id'])->dropColumn('branch_id'));
        Schema::dropIfExists('branches');
    }
};
