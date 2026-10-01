<?php

namespace Database\Seeders;

use App\Models\BannerSlide;
use App\Models\Category;
use App\Models\DiscountCode;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductImage;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed Sucre Pâtisserie demo data.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Sucre Admin',
            'email' => 'admin@sucre.test',
            'password' => Hash::make('password'),
        ]);

        // ─── Categories ───────────────────────────────────────────────────────
        $cakes = Category::create([
            'name' => 'Celebration Cakes',
            'name_ar' => 'كيك المناسبات',
            'slug' => 'cakes',
            'tagline' => 'Signature Pâtisserie',
            'tagline_ar' => 'توقيع باتisserie',
            'cover_image' => 'pastry/cake-hero.png',
            'description' => 'Couture multi-tier celebration cakes finished with edible flowers, macarons and gold leaf.',
            'description_ar' => 'كيك احتفالي فاخر متعدد الطبقات مزيّن بأزهار صالحة للأكل وماكرون وورق ذهب.',
            'tags' => ['Floral', 'Berry', 'Vanilla', 'Occasion'],
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $tarts = Category::create([
            'name' => 'French Tarts',
            'name_ar' => 'التارت الفرنسي',
            'slug' => 'tarts',
            'tagline' => 'Gourmet Boutique',
            'tagline_ar' => 'بوتيك الذواقة',
            'cover_image' => 'pastry/tarts-macarons.png',
            'description' => 'Exquisite French tarts and petits fours crafted with seasonal fruit and delicate creams.',
            'description_ar' => 'تارت فرنسي فاخر وبيتيفور محضّر بفاكهة الموسم وكريمات رقيقة.',
            'tags' => ['Raspberry', 'Pistachio', 'Cream', 'Fruit'],
            'sort_order' => 2,
            'is_active' => true,
        ]);

        $macarons = Category::create([
            'name' => 'Macaron Boxes',
            'name_ar' => 'صناديق الماكرون',
            'slug' => 'macarons',
            'tagline' => 'Luxury Gift',
            'tagline_ar' => 'هدية فاخرة',
            'cover_image' => 'pastry/macaron-box.png',
            'description' => 'Assorted pastel French macarons in elegant gold-foiled gift packaging.',
            'description_ar' => 'تشكيلة ماكرون فرنسي بألوان الباستيل في علب هدايا أنيقة بورق ذهبي.',
            'tags' => ['Rose', 'Pistachio', 'Vanilla', 'Gift'],
            'sort_order' => 3,
            'is_active' => true,
        ]);

        $offers = Category::create([
            'name' => 'Offers',
            'name_ar' => 'عروض',
            'slug' => 'offers',
            'tagline' => 'Seasonal Selection',
            'tagline_ar' => 'اختيارات الموسم',
            'cover_image' => 'pastry/fraisier.png',
            'description' => 'Limited-time pastry boxes and celebration cakes at special prices.',
            'description_ar' => 'علب حلويات وكيك مناسبات بأسعار خاصة لفترة محدودة.',
            'tags' => ['Limited', 'Gift', 'Berry', 'Luxury'],
            'sort_order' => 4,
            'is_active' => true,
        ]);

        $shipping = [
            'standard' => '3-5 business days',
            'express' => '1-2 business days',
            'same_day' => 'Cairo same-day (order before 12pm)',
        ];

        // ─── Products ─────────────────────────────────────────────────────────
        $roseBerry = $this->createProduct([
            'name' => 'Rose & Berry Royale',
            'slug' => 'rose-berry-royale',
            'description' => 'A luxurious multi-tier strawberry and vanilla frosted celebration cake decorated with edible flowers and macarons.',
            'description_ar' => 'كيك احتفالي فاخر متعدد الطبقات بفروستينج الفراولة والفانيليا مزيّن بأزهار صالحة للأكل وماكرون.',
            'image' => 'pastry/cake-hero.png',
            'base_price' => 850,
            'discount_percentage' => 0,
            'rating' => 4.9,
            'reviews_count' => 64,
            'fragrance_notes' => [
                'top' => 'Madagascar Vanilla, Fresh Strawberry',
                'heart' => 'Rose Cream, Raspberry Couli',
                'base' => 'Soft Sponge, White Chocolate',
            ],
            'shipping_info' => $shipping,
            'tags' => ['Floral', 'Berry', 'Occasion', 'Vanilla'],
            'sort_order' => 1,
            'is_featured' => true,
            'categories' => [$cakes, $offers],
            'gallery' => [
                ['url' => 'pastry/cake-hero.png', 'alt' => 'Rose & Berry Royale cake'],
                ['url' => 'pastry/fraisier.png', 'alt' => 'Berry cake slice detail'],
            ],
            'attributes' => [
                ['name' => 'Petite', 'value' => '6 servings', 'price' => 480, 'stock' => 20, 'sku' => 'ROSE-PETITE', 'is_default' => false, 'discount' => 0],
                ['name' => 'Classic', 'value' => '10 servings', 'price' => 640, 'stock' => 15, 'sku' => 'ROSE-CLASSIC', 'is_default' => true, 'discount' => 25, 'is_suggested' => true],
                ['name' => 'Celebration', 'value' => '16 servings', 'price' => 980, 'stock' => 8, 'sku' => 'ROSE-CELEB', 'is_default' => false, 'discount' => 0],
            ],
        ]);

        $framboise = $this->createProduct([
            'name' => 'Framboise & Rose',
            'slug' => 'framboise-rose',
            'description' => 'Exquisite French raspberry tarts and pink macarons presented on an elegant ceramic stand.',
            'description_ar' => 'تارت التوت الفرنسي وماكرون الورد الفاخر على حامل سيراميك أنيق.',
            'image' => 'pastry/tarts-macarons.png',
            'base_price' => 520,
            'discount_percentage' => 0,
            'rating' => 4.8,
            'reviews_count' => 41,
            'fragrance_notes' => [
                'top' => 'Fresh Raspberry',
                'heart' => 'Rose Macaron, Almond',
                'base' => 'Butter Pastry Crust',
            ],
            'shipping_info' => $shipping,
            'tags' => ['Raspberry', 'Rose', 'Fruit', 'Cream'],
            'sort_order' => 2,
            'is_featured' => true,
            'categories' => [$tarts, $offers],
            'gallery' => [
                ['url' => 'pastry/tarts-macarons.png', 'alt' => 'Framboise tarts and macarons'],
            ],
            'attributes' => [
                ['name' => 'Box of 4', 'value' => '4 pieces', 'price' => 280, 'stock' => 30, 'sku' => 'FRAM-4', 'is_default' => false, 'discount' => 0],
                ['name' => 'Box of 8', 'value' => '8 pieces', 'price' => 420, 'stock' => 22, 'sku' => 'FRAM-8', 'is_default' => true, 'discount' => 20],
                ['name' => 'Party Stand', 'value' => '12 pieces', 'price' => 590, 'stock' => 12, 'sku' => 'FRAM-12', 'is_default' => false, 'discount' => 0],
            ],
        ]);

        $macaronBox = $this->createProduct([
            'name' => 'Les Délices Macaron',
            'slug' => 'les-delices-macaron',
            'description' => 'Artisanal box of pastel French macarons — rose, pistachio, raspberry and vanilla — in gold-foiled luxury gift packaging.',
            'description_ar' => 'علبة ماكرون فرنسي بألوان الباستيل — ورد، فستق، توت وفانيليا — في تغليف فاخر بورق ذهبي.',
            'image' => 'pastry/macaron-box.png',
            'base_price' => 380,
            'discount_percentage' => 0,
            'rating' => 4.9,
            'reviews_count' => 88,
            'fragrance_notes' => [
                'top' => 'Rose, Pistachio',
                'heart' => 'Raspberry, Vanilla Bean',
                'base' => 'Almond Meringue Shell',
            ],
            'shipping_info' => $shipping,
            'tags' => ['Rose', 'Pistachio', 'Vanilla', 'Gift'],
            'sort_order' => 3,
            'is_featured' => true,
            'categories' => [$macarons, $offers],
            'gallery' => [
                ['url' => 'pastry/macaron-box.png', 'alt' => 'Luxury macaron gift box'],
            ],
            'attributes' => [
                ['name' => 'Discovery', 'value' => '6 macarons', 'price' => 180, 'stock' => 40, 'sku' => 'MAC-6', 'is_default' => false, 'discount' => 0],
                ['name' => 'Gift Box', 'value' => '12 macarons', 'price' => 320, 'stock' => 28, 'sku' => 'MAC-12', 'is_default' => true, 'discount' => 15, 'is_suggested' => true],
                ['name' => 'Grand Assortment', 'value' => '24 macarons', 'price' => 560, 'stock' => 14, 'sku' => 'MAC-24', 'is_default' => false, 'discount' => 0],
            ],
        ]);

        $fraisier = $this->createProduct([
            'name' => 'Signature Fraisier',
            'slug' => 'signature-fraisier',
            'description' => 'French Strawberry Fraisier with glossy glazed strawberries and pistachio crumbles on marble.',
            'description_ar' => 'فريزييه فرنسي بالفراولة اللامعة وفتات الفستق على طبق رخامي.',
            'image' => 'pastry/fraisier.png',
            'base_price' => 460,
            'discount_percentage' => 0,
            'rating' => 4.7,
            'reviews_count' => 53,
            'fragrance_notes' => [
                'top' => 'Glazed Strawberry',
                'heart' => 'Diplomat Cream, Vanilla',
                'base' => 'Pistachio Crumble, Genoise',
            ],
            'shipping_info' => $shipping,
            'tags' => ['Berry', 'Pistachio', 'Cream', 'Luxury'],
            'sort_order' => 4,
            'is_featured' => true,
            'categories' => [$cakes, $tarts],
            'gallery' => [
                ['url' => 'pastry/fraisier.png', 'alt' => 'Signature Fraisier slice'],
                ['url' => 'pastry/cake-hero.png', 'alt' => 'Celebration cake styling'],
            ],
            'attributes' => [
                ['name' => 'Slice', 'value' => 'Individual', 'price' => 95, 'stock' => 50, 'sku' => 'FRAIS-SLICE', 'is_default' => false, 'discount' => 0],
                ['name' => 'Whole Cake', 'value' => '8 servings', 'price' => 460, 'stock' => 18, 'sku' => 'FRAIS-WHOLE', 'is_default' => true, 'discount' => 10],
            ],
        ]);

        // ─── Banner slides ────────────────────────────────────────────────────
        BannerSlide::create([
            'image_url' => asset('storage/pastry/cake-hero.png'),
            'title' => 'sucre',
            'title_ar' => 'سُكر',
            'subtitle' => 'For You • لكِ خصيصاً',
            'subtitle_ar' => 'لكِ خصيصاً • For You',
            'link_url' => '/categories/cakes',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        BannerSlide::create([
            'image_url' => asset('storage/pastry/tarts-macarons.png'),
            'title' => 'Haute Pâtisserie',
            'title_ar' => 'حلويات فرنسية فاخرة',
            'subtitle' => 'Tarts & Macarons',
            'subtitle_ar' => 'تارت وماكرون',
            'link_url' => '/categories/tarts',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        BannerSlide::create([
            'image_url' => asset('storage/pastry/macaron-box.png'),
            'title' => 'Luxury Gift Boxes',
            'title_ar' => 'علب هدايا فاخرة',
            'subtitle' => 'Gold-foiled assortments',
            'subtitle_ar' => 'تشكيلة بورق ذهبي',
            'link_url' => '/categories/macarons',
            'sort_order' => 3,
            'is_active' => true,
        ]);

        // ─── Discount codes ───────────────────────────────────────────────────
        DiscountCode::create([
            'code' => 'SUCRE20',
            'description' => 'Sucre welcome — 20% off',
            'type' => 'percentage',
            'value' => 20.00,
            'min_purchase' => 300.00,
            'max_discount' => 200.00,
            'usage_limit' => 100,
            'usage_count' => 0,
            'starts_at' => now(),
            'expires_at' => now()->addMonths(3),
            'is_active' => true,
        ]);

        DiscountCode::create([
            'code' => 'SWEET50',
            'description' => 'Flat 50 EGP off your order',
            'type' => 'fixed',
            'value' => 50.00,
            'min_purchase' => 250.00,
            'max_discount' => null,
            'usage_limit' => null,
            'usage_count' => 0,
            'starts_at' => now(),
            'expires_at' => null,
            'is_active' => true,
        ]);

        // ─── Settings ─────────────────────────────────────────────────────────
        $settings = [
            'shop_name' => 'Sucre Pâtisserie',
            'whatsapp_phone' => '201000000000',
            'contact_phone' => '201000000000',
            'contact_email' => 'hello@sucre.test',
            'social_instagram' => 'https://instagram.com/',
            'social_facebook' => '',
            'social_tiktok' => '',
            'social_youtube' => '',
            'about_us_description' => '<p>Welcome to <strong>Sucre Pâtisserie</strong> — a house of haute French-Arabian pastry. From couture celebration cakes to gold-foiled macaron boxes, every piece is crafted with artisanal precision and sensory refinement.</p><p>Haute pâtisserie &amp; couture celebration cakes for the moments that matter.</p>',
            'about_us_description_ar' => '<p>أهلاً بكم في <strong>سُكر باتisserie</strong> — بيت الحلويات الفرنسية-العربية الفاخرة. من كيك المناسبات الراقية إلى علب الماكرون المذهّبة، كل قطعة تُصنع بدقة حرفية وإحساس رفيع.</p><p>حلويات فاخرة وكيك احتفالي للحظات التي تهمّ.</p>',
        ];

        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                [
                    'value' => $value,
                    'label' => ucwords(str_replace('_', ' ', $key)),
                    'group' => str_starts_with($key, 'social_') ? 'social'
                        : (str_starts_with($key, 'about_') ? 'about'
                        : (str_starts_with($key, 'contact_') || $key === 'whatsapp_phone' ? 'contact' : 'general')),
                ]
            );
        }

        $this->command->info('Sucre Pâtisserie database seeded successfully!');
        $this->command->info('Categories: 4 | Products: 4 | Banner slides: 3 | Discount codes: 2');
        $this->command->info('Admin: admin@sucre.test / password');
    }

    /**
     * Helper to create a product with categories, gallery and size attributes.
     */
    private function createProduct(array $data): Product
    {
        $categories = $data['categories'] ?? [];
        $gallery = $data['gallery'] ?? [];
        $attributes = $data['attributes'] ?? [];
        unset($data['categories'], $data['gallery'], $data['attributes']);

        $product = Product::create([
            ...$data,
            'is_active' => true,
        ]);

        $product->categories()->attach(collect($categories)->pluck('id')->all());

        foreach ($gallery as $index => $image) {
            ProductImage::create([
                'product_id' => $product->id,
                'url' => $image['url'],
                'alt_text' => $image['alt'] ?? $product->name,
                'sort_order' => $index,
            ]);
        }

        foreach ($attributes as $index => $attr) {
            ProductAttribute::create([
                'product_id' => $product->id,
                'name' => $attr['name'],
                'value' => $attr['value'],
                'price' => $attr['price'],
                'discount_percentage' => $attr['discount'] ?? 0,
                'stock' => $attr['stock'],
                'sku' => $attr['sku'],
                'is_active' => true,
                'is_default' => (bool) ($attr['is_default'] ?? false),
                'is_suggested' => (bool) ($attr['is_suggested'] ?? false),
                'image_url' => $product->image,
                'sort_order' => $index,
            ]);
        }

        return $product;
    }
}
