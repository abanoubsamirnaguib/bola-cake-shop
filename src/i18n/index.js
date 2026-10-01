import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'appLang';

const translations = {
  en: {
    brand: 'Sucre',
    language: 'EN',
    languageToggle: 'AR / EN',
    home: {
      welcome: 'Welcome back',
      best: 'best for',
      headline: 'Discover Our',
      headlineEmphasis: 'Haute Pâtisserie',
      featured: 'Featured',
      collections: 'Collections',
      collection: 'Collection',
    },
    featured: {
      bestSeller: 'Best Seller',
      newArrival: 'New Arrival',
      limited: 'Limited',
    },
    categories: {
      cakes: 'Celebration Cakes',
      tarts: 'French Tarts',
      macarons: 'Macaron Boxes',
      offers: 'Offers',
    },
    taglines: {
      cakes: 'Signature Pâtisserie',
      tarts: 'Gourmet Boutique',
      macarons: 'Luxury Gift',
      offers: 'Offers',
    },
    category: {
      notFoundLabel: 'Not found',
      notFoundTitle: 'This collection doesn\'t exist',
      selectCollection: 'Select Collection',
    },
    productType: {
      notFoundLabel: 'Not found',
      notFoundTitle: 'This product type doesn\'t exist',
      noProducts: 'No products found',
    },
    search: {
      placeholder: 'Search {{subject}}...',
      subjects: {
        fragrances: 'pastries',
        collection: 'collection',
        beauty: 'desserts',
        shirts: 'boxes',
        skincare: 'sweets',
        pastries: 'pastries',
      },
    },
    filter: {
      title: 'Filter by',
    },
    favourites: {
      title: 'Wishlist',
      emptyTitle: 'Your wishlist is empty',
      emptySubtitle: 'Save pastries you love',
      saved: '{{count}} saved {{itemLabel}}',
      itemSingular: 'pastry',
      itemPlural: 'pastries',
    },
    cart: {
      title: 'Your Bag',
      itemsInBag: '{{count}} {{itemLabel}} in your bag',
      itemSingular: 'Item',
      itemPlural: 'Items',
      reviewCheckout: 'Review & Checkout',
      emptyTitle: 'Your bag is empty',
      emptySubtitle: 'Add some sweets to get started',
      total: 'Total',
      checkout: 'Send Order →',
      continueToCheckout: 'Continue to Checkout →',
      backToCart: '← Back to Cart',
      checkoutDetails: 'Your Details',
      name: 'Name',
      phone: 'Phone',
      whatsappNumber: 'WhatsApp Number',
      address: 'Address',    
      orderSummary: 'Order Summary',
      items: 'Items',
      fillDetails: 'Please enter your name, phone number, WhatsApp number, and address before checking out.',
      discount: 'Discount Code',
      discountPlaceholder: 'Enter discount code',
      applyDiscount: 'Apply',
      discountApplied: '✓ Discount applied!',
      discountInvalid: 'Invalid or expired code',
      removing: 'Remove',
      subtotal: 'Subtotal',
      discountAmount: 'Discount',
      finalTotal: 'Total After Discount',
      addedToBag: 'Added to bag successfully!',
      viewBag: 'View Bag',
      orderSent: 'Order sent successfully!',
      orderSentWhatsapp: 'Order sent to WhatsApp successfully!',
      suggestedHeading: 'Suggested Products',
      addToCart: 'Add',
    },
    product: {
      size: 'Select Size',
      about: 'About This Pastry',
      description:
        'An exquisite creation of rare ingredients and artisanal craft, this pastry opens with delicate layers that reveal a rich, decadent heart. Crafted in the tradition of haute pâtisserie, each piece is a work of art — a sensory journey that lingers long after the last bite.',
      price: 'Price',
      reviews: '{{count}} review{{suffix}}',
    },
    actions: {
      addToBag: 'Add to Bag',
    },
    specs: {
      details: {
        header: 'Flavor Notes',
        options: [
          { label: 'Top', value: 'Madagascar Vanilla, Rose' },
          { label: 'Heart', value: 'Raspberry, Pistachio' },
          { label: 'Base', value: 'Almond, Cream, Cocoa' },
        ],
      },
      shipping: {
        header: 'Shipping',
        options: [
          { label: 'Standard', value: '3-5 business days' },
          { label: 'Express', value: '1-2 business days' },
          { label: 'International', value: '7-14 business days' },
        ],
      },
      sizes: {
        header: 'Available Sizes',
        wrapText: true,
        options: [
          { label: 'Petite', value: 'Individual' },
          { label: 'Classic', value: '6–8 servings' },
          { label: 'Celebration', value: '12–16 servings' },
        ],
      },
    },
    filters: {
      None: 'None',
      Floral: 'Floral',
      Perfume: 'Pastry',
      Beauty: 'Dessert',
      Essence: 'Signature',
      Skin: 'Macaron',
      Cream: 'Cream',
      Serum: 'Tart',
      Glow: 'Glaze',
      Mascara: 'Chocolate',
      Lipstick: 'Berry',
      Eye: 'Pistachio',
      Face: 'Vanilla',
      Watch: 'Gift',
      Gold: 'Gold',
      Steel: 'Classic',
      Luxury: 'Luxury',
      Shirt: 'Box',
      Slim: 'Mini',
      Formal: 'Occasion',
      Cotton: 'Soft',
      Mist: 'Rose',
      Moisturizer: 'Buttercream',
      SPF: 'Fresh',
      Lip: 'Fruit',
    },
    aboutUs: {
      title: 'About Us',
      call: 'Call Us',
      email: 'Email Us',
    },
  },
  ar: {
    brand: 'سُكر',
    language: 'AR',
    languageToggle: 'EN / AR',
    home: {
      welcome: 'أهلا بعودتك',
      best: 'أفضل',
      headline: 'اكتشفي',
      headlineEmphasis: 'حلوياتنا الفاخرة',
      featured: 'مختارات مميزة',
      collections: 'المجموعات',
      collection: 'مجموعة',
    },
    featured: {
      bestSeller: 'الأكثر مبيعا',
      newArrival: 'وصل حديثا',
      limited: 'إصدار محدود',
    },
    categories: {
      cakes: 'كيك المناسبات',
      tarts: 'التارت الفرنسي',
      macarons: 'صناديق الماكرون',
      offers: 'عروض',
    },
    taglines: {
      cakes: 'توقيع باتisserie',
      tarts: 'بوتيك الذواقة',
      macarons: 'هدية فاخرة',
      offers: 'عروض',
    },
    category: {
      notFoundLabel: 'غير موجود',
      notFoundTitle: 'هذه المجموعة غير موجودة',
      selectCollection: 'اختر المجموعة',
    },
    productType: {
      notFoundLabel: 'غير موجود',
      notFoundTitle: 'نوع المنتج غير موجود',
      noProducts: 'لا توجد منتجات',
    },
    search: {
      placeholder: 'ابحث عن {{subject}}...',
      subjects: {
        fragrances: 'الحلويات',
        collection: 'المجموعة',
        beauty: 'الحلويات',
        shirts: 'الصناديق',
        skincare: 'الحلويات',
        pastries: 'الحلويات',
      },
    },
    filter: {
      title: 'تصفية حسب',
    },
    favourites: {
      title: 'المفضلة',
      emptyTitle: 'قائمة المفضلة فارغة',
      emptySubtitle: 'احفظ الحلويات التي تحبها',
      saved: '{{count}} {{itemLabel}} محفوظة',
      itemSingular: 'حلوى',
      itemPlural: 'حلويات',
    },
    cart: {
      title: 'حقيبتك',
      itemsInBag: '{{count}} {{itemLabel}} في الحقيبة',
      itemSingular: 'قطعة',
      itemPlural: 'قطع',
      reviewCheckout: 'مراجعة وانهاء الطلب',
      emptyTitle: 'حقيبتك فارغة',
      emptySubtitle: 'أضف بعض الحلويات للبدء',
      total: 'الاجمالي',
      checkout: 'إرسال الطلب ←',
      continueToCheckout: 'متابعة الطلب ←',
      backToCart: '→ العودة للسلة',
      checkoutDetails: 'بياناتك',
      name: 'الاسم',
      phone: 'الهاتف',
      whatsappNumber: 'رقم واتساب',
      address: 'العنوان',
      orderSummary: 'ملخص الطلب',
      items: 'المنتجات',
      fillDetails: 'يرجى إدخال اسمك ورقم الهاتف ورقم واتساب وعنوانك قبل إنهاء الطلب.',
      discount: 'كود الخصم',
      discountPlaceholder: 'ادخل كود الخصم',
      applyDiscount: 'تطبيق',
      discountApplied: '✓ تم تطبيق الخصم!',
      discountInvalid: 'كود غير صالح أو منتهي الصلاحية',
      removing: 'حذف',
      subtotal: 'الاجمالي قبل الخصم',
      discountAmount: 'الخصم',
      finalTotal: 'الاجمالي بعد الخصم',
      addedToBag: 'تم الإضافة إلى السلة بنجاح!',
      viewBag: 'عرض السلة',
      orderSent: 'تم إرسال الطلب بنجاح!',
      orderSentWhatsapp: 'تم إرسال الطلب إلى واتساب بنجاح!',
      suggestedHeading: 'منتجات مقترحة',
      addToCart: 'إضافة',
    },
    product: {
      size: 'اختر الحجم',
      about: 'حول هذه الحلوى',
      description:
        'إبداع راقٍ من مكونات نادرة وحِرفة فنية، تكشف هذه الحلوى عن طبقات رقيقة وقلب غني وفاخر. صُنعت بروح الحلويات الفرنسية الراقية لتكون قطعة فنية تدوم في الذاكرة بعد آخر قضمة.',
      price: 'السعر',
      reviews: '{{count}} مراجعة',
    },
    actions: {
      addToBag: 'اضف الى الحقيبة',
    },
    specs: {
      details: {
        header: 'نكهات',
        options: [
          { label: 'الافتتاح', value: 'فانيليا مدغشقر، ورد' },
          { label: 'القلب', value: 'توت العليق، فستق' },
          { label: 'القاعدة', value: 'لوز، كريمة، كاكاو' },
        ],
      },
      shipping: {
        header: 'الشحن',
        options: [
          { label: 'عادي', value: '3-5 ايام عمل' },
          { label: 'سريع', value: '1-2 يوم عمل' },
          { label: 'دولي', value: '7-14 يوم عمل' },
        ],
      },
      sizes: {
        header: 'الاحجام المتاحة',
        wrapText: true,
        options: [
          { label: 'فردي', value: 'قطعة واحدة' },
          { label: 'كلاسيك', value: '6–8 أشخاص' },
          { label: 'احتفال', value: '12–16 شخص' },
        ],
      },
    },
    filters: {
      None: 'بدون',
      Floral: 'زهري',
      Perfume: 'حلوى',
      Beauty: 'تحلية',
      Essence: 'توقيع',
      Skin: 'ماكرون',
      Cream: 'كريمة',
      Serum: 'تارت',
      Glow: 'جليز',
      Mascara: 'شوكولاتة',
      Lipstick: 'توت',
      Eye: 'فستق',
      Face: 'فانيليا',
      Watch: 'هدية',
      Gold: 'ذهبي',
      Steel: 'كلاسيك',
      Luxury: 'فاخر',
      Shirt: 'صندوق',
      Slim: 'ميني',
      Formal: 'مناسبة',
      Cotton: 'ناعم',
      Mist: 'ورد',
      Moisturizer: 'زبدة',
      SPF: 'طازج',
      Lip: 'فاكهة',
    },
    aboutUs: {
      title: 'من نحن',
      call: 'اتصل بنا',
      email: 'راسلنا',
    },
  },
};

const I18nContext = createContext({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: () => '',
});

const getStoredLanguage = () => {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'ar' || stored === 'en') return stored;
  const browserLang = window.navigator.language || '';
  return browserLang.toLowerCase().startsWith('ar') ? 'ar' : 'en';
};

const getValue = (obj, path) => {
  if (!obj) return undefined;
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

const formatText = (text, vars) => {
  if (!vars) return text;
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => (vars[key] !== undefined ? String(vars[key]) : ''));
};

export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState(getStoredLanguage());

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, language);
    }
  }, [language]);

  const toggleLanguage = () => setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));

  const t = useCallback((key, vars, fallback) => {
    const template = getValue(translations[language], key) ?? getValue(translations.en, key) ?? fallback ?? key;
    if (typeof template !== 'string') return template;
    return formatText(template, vars);
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      translations: translations[language],
    }),
    [language, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);

export const getSpecsByLanguage = (language) => translations[language]?.specs || translations.en.specs;
