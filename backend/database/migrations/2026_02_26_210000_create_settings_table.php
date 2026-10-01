<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('label')->nullable();
            $table->string('group')->default('general');
            $table->timestamps();
        });

        // Seed default settings
        DB::table('settings')->insert([
            [
                'key'        => 'whatsapp_phone',
                'value'      => '201068644570',
                'label'      => 'WhatsApp Phone Number',
                'group'      => 'whatsapp',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key'        => 'shop_name',
                'value'      => 'Sucre Pâtisserie',
                'label'      => 'Shop Name',
                'group'      => 'general',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
