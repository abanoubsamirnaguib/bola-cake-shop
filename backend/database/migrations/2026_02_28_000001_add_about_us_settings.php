<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        $rows = [
            [
                'key'        => 'about_us_description',
                'value'      => '<p>Welcome to <strong>Sucre Pâtisserie</strong> — a house of haute French-Arabian pastry. From couture celebration cakes to gold-foiled macaron boxes, every piece is crafted with artisanal precision.</p>',
                'label'      => 'About Us Description',
                'group'      => 'about',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key'        => 'social_facebook',
                'value'      => '',
                'label'      => 'Facebook URL',
                'group'      => 'social',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key'        => 'social_instagram',
                'value'      => '',
                'label'      => 'Instagram URL',
                'group'      => 'social',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key'        => 'social_tiktok',
                'value'      => '',
                'label'      => 'TikTok URL',
                'group'      => 'social',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key'        => 'social_youtube',
                'value'      => '',
                'label'      => 'YouTube URL',
                'group'      => 'social',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        foreach ($rows as $row) {
            DB::table('settings')->updateOrInsert(['key' => $row['key']], $row);
        }
    }

    public function down(): void
    {
        DB::table('settings')->whereIn('key', [
            'about_us_description',
            'social_facebook',
            'social_instagram',
            'social_tiktok',
            'social_youtube',
        ])->delete();
    }
};
