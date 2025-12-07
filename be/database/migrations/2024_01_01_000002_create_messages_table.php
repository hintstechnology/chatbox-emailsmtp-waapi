<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->string('session_id');
            $table->enum('type', ['user', 'admin', 'system']);
            $table->text('text');
            $table->string('admin_name')->nullable();
            $table->string('admin_email')->nullable();
            $table->string('admin_avatar')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index('session_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};

