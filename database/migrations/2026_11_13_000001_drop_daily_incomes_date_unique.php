<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// daily_incomes stores one row per menu item per day; the old unique(user_id,
// income_date) blocked recording a second menu on the same day. MySQL uses the
// unique index for the user_id FK, so it must be dropped and re-added.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('daily_incomes', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropUnique(['user_id', 'income_date']);
            $table->foreign('user_id')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::table('daily_incomes', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->unique(['user_id', 'income_date']);
            $table->foreign('user_id')->references('id')->on('users');
        });
    }
};
