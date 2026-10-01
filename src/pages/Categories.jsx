import {
  IonContent,
  IonHeader,
  IonPage,
  IonRouterLink,
  IonToolbar,
  IonTitle,
  IonButtons,
  useIonModal,
  useIonViewDidEnter,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { productInfo, FALLBACK_IMG, capitalize, getDisplayImage, getDisplayPrice, getOriginalPrice, hasDiscount } from '../utils';
import { useI18n } from '../i18n';
import { LanguageToggle } from '../components/LanguageToggle';
import { ProductModal } from '../components/ProductModal';
import { fetchCategories, fetchFeaturedProducts, fetchBannerSlides, fetchSettings } from '../services/api';
import styles from './Categories.module.scss';

// ─── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div
    style={{
      minWidth: '160px',
      borderRadius: '4px',
      overflow: 'hidden',
      background: '#FFFFFF',
      border: '1px solid #EFE7E1',
      flexShrink: 0,
    }}
  >
    <div
      style={{
        height: 200,
        background: 'linear-gradient(90deg, #EFE7E1 25%, #EAE1DB 50%, #EFE7E1 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
      }}
    />
  </div>
);

const Categories = () => {
  const { t, language } = useI18n();
  const [apiCategories, setApiCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState({});

  // ─── Site Settings (About Us, social links) ─────────────────────────────────
  const [siteSettings, setSiteSettings] = useState({});

  useEffect(() => {
    let cancelled = false;
    fetchSettings()
      .then((data) => { if (!cancelled) setSiteSettings(data || {}); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // ─── Banner Slides ────────────────────────────────────────────────────────────
  const [bannerSlides, setBannerSlides] = useState([]);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchBannerSlides()
      .then((data) => { if (!cancelled) setBannerSlides(Array.isArray(data) ? data : []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setBannerLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Auto-advance slider every 4 seconds
  useEffect(() => {
    if (bannerSlides.length < 2) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [bannerSlides]);

  // ─── Handle hash navigation to hero section ───────────────────────────────────
  useIonViewDidEnter(() => {
    if (window.location.hash === '#hero-section') {
      setTimeout(() => {
        const element = document.getElementById('hero-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Clear the hash from URL after scrolling
          window.history.replaceState(null, '', window.location.pathname);
        }
      }, 300);
    }
  });

  useEffect(() => {
    let cancelled = false;
    fetchCategories()
      .then((data) => { if (!cancelled) setApiCategories(Array.isArray(data) ? data : []); })
      .catch(() => {/* silent fallback to static data */})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchFeaturedProducts(10)
      .then((data) => { if (!cancelled) setFeaturedProducts(Array.isArray(data) ? data : []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setFeaturedLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // ─── Product modal ────────────────────────────────────────────────────────────
  const [presentProductModal, dismissProductModal] = useIonModal(ProductModal, {
    dismiss: () => dismissProductModal(),
    product: selectedProduct,
    category: selectedProduct?.category?.slug,
  });

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    presentProductModal();
  };

  /**
   * Merge API categories with static productInfo fallback.
   * API data takes precedence; static dict fills in missing cover images / taglines.
   */
  const categories = apiCategories.length > 0
    ? apiCategories.map((cat) => {
        const st = productInfo[cat.slug] || {};
        return {
          slug:        cat.slug,
          name:        cat.name,
          name_ar:     cat.name_ar,
          coverImage:  cat.cover_image || FALLBACK_IMG,
          tagline:     cat.tagline     ?? st.tagline     ?? '',
          tagline_ar:  cat.tagline_ar  ?? st.tagline_ar  ?? '',
        };
      })
    : Object.keys(productInfo).map((slug) => ({
        slug,
        name:       capitalize(slug),
        coverImage: FALLBACK_IMG,
        tagline:    productInfo[slug].tagline,
      }));

  const getCatName = (cat) => {
    if (language === 'ar') {
      if (cat.name_ar) return cat.name_ar;
      return t(`categories.${cat.slug}`, null, cat.name);
    }
    return t(`categories.${cat.slug}`, null, cat.name);
  };

  const getCatTagline = (cat) => {
    if (language === 'ar') {
      if (cat.tagline_ar) return cat.tagline_ar;
      return t(`taglines.${cat.slug}`, null, cat.tagline);
    }
    return t(`taglines.${cat.slug}`, null, cat.tagline);
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'rgba(251, 248, 245, 0.92)', '--border-color': 'transparent', '--min-height': '64px', height: '64px' }}>
          <IonTitle
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 500,
              fontSize: '1.2rem',
              letterSpacing: '0.18em',
              color: '#5A2A38',
              textAlign: 'center',
              textTransform: 'uppercase',
            }}
          >
            <div onClick={() => document.getElementById('hero-section')?.scrollIntoView({ behavior: 'smooth' })} style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.1rem', cursor: 'pointer' }}>
                <img src="/assets/pastry/logo.svg" alt="Sucre Pâtisserie" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/pastry/logo.png'; }} />
              </div>
            </div>
          </IonTitle>
          <IonButtons slot="end">
            <LanguageToggle />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#FBF8F5' }}>

        {/* ── Landing Slider (admin-managed banner slides) ── */}
        <div
          id="hero-section"
          style={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            background: '#FBF8F5',
            aspectRatio: '4 / 3',
            minHeight: 220,
            maxHeight: 380,
          }}
        >
          {/* Skeleton */}
          {bannerLoading && (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #EFE7E1 25%, #EAE1DB 50%, #EFE7E1 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
          )}

          {/* Slides */}
          {!bannerLoading && bannerSlides.length > 0 && bannerSlides.map((slide, idx) => {
            const isExternal = slide.link_url && (slide.link_url.startsWith('http://') || slide.link_url.startsWith('https://'));

            // Localized banner title/subtitle (fallback to default if missing)
            const slideTitle =
              language === 'ar'
                ? (slide.title_ar || slide.title)
                : slide.title;
            const slideSubtitle =
              language === 'ar'
                ? (slide.subtitle_ar || slide.subtitle)
                : slide.subtitle;
            const inner = (
              <>
                {slide.video_url ? (
                  <video
                    src={slide.video_url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <img
                    src={slide.image_url}
                    alt={slide.title || `slide-${idx}`}
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                )}
                {(slideTitle || slideSubtitle) && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(64,21,35,0.72) 0%, transparent 60%)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '1.25rem 1.5rem',
                    }}
                  >
                    {slideSubtitle && (
                      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#FECAA2', margin: 0, marginBottom: 4 }}>
                        {slideSubtitle}
                      </p>
                    )}
                    {slideTitle && (
                      <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, fontSize: 'clamp(1.4rem, 5vw, 2.2rem)', color: '#FBF8F5', margin: 0, letterSpacing: '0.08em' }}>
                        {slideTitle}
                      </h1>
                    )}
                  </div>
                )}
              </>
            );

            return (
              <div
                key={slide.id}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: idx === activeSlide ? 1 : 0,
                  transition: 'opacity 0.7s ease',
                  pointerEvents: idx === activeSlide ? 'auto' : 'none',
                  cursor: slide.link_url ? 'pointer' : 'default',
                }}
                onClick={() => {
                  if (!slide.link_url) return;
                  if (isExternal) window.open(slide.link_url, '_blank');
                  else window.location.hash = slide.link_url;
                }}
              >
                {inner}
              </div>
            );
          })}

          {/* Dot navigation */}
          {!bannerLoading && bannerSlides.length > 1 && (
            <div
              style={{
                position: 'absolute',
                bottom: 10,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 6,
                zIndex: 5,
              }}
            >
              {bannerSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setActiveSlide(idx); }}
                  style={{
                    width: idx === activeSlide ? 20 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: idx === activeSlide ? '#FECAA2' : 'rgba(251,248,245,0.45)',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Gold Divider ── */}
        <div className="bellezza-divider" style={{ margin: '1rem 1.25rem' }} />

        {/* ── Featured Horizontal Scroll ── */}
        <div style={{ padding: '0 0 0 1.25rem' }}>
          <p className="section-label" style={{ marginBottom: '0.75rem' }}>{t('featured.bestSeller')}</p>
          <div
            style={{
              display: 'flex',
              gap: '0.85rem',
              overflowX: 'auto',
              paddingRight: '1.25rem',
              paddingBottom: '0.5rem',
              scrollbarWidth: 'none',
            }}
          >
            {featuredLoading
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              : featuredProducts.length === 0
                ? null
                : featuredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
                    >
                      <div
                        style={{
                          minWidth: '160px',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          background: '#FFFFFF',
                          border: '1px solid #EFE7E1',
                          boxShadow: '0 4px 16px -4px rgba(90, 42, 56, 0.06)',
                          flexShrink: 0,
                        }}
                      >
                        <div style={{ position: 'relative', height: '200px' }}>
                          <img
                            src={getDisplayImage(product) || FALLBACK_IMG}
                            alt={product.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          {hasDiscount(product) ? (
                            <span
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: '#FECAA2',
                                color: '#795334',
                                fontSize: '0.55rem',
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                padding: '3px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              -{Math.round(product.discount)}%
                            </span>
                          ) : (
                            <span
                              style={{
                                position: 'absolute',
                                top: '8px',
                                left: '8px',
                                background: '#5A2A38',
                                color: '#FBF8F5',
                                fontSize: '0.55rem',
                                fontWeight: 600,
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                padding: '3px 7px',
                                borderRadius: '4px',
                              }}
                            >
                              {t('featured.bestSeller')}
                            </span>
                          )}
                        </div>
                        <div style={{ padding: '0.6rem 0.75rem' }}>
                          <p
                            style={{
                              fontFamily: "'Playfair Display', serif",
                              fontSize: '0.95rem',
                              color: '#401523',
                              fontWeight: 500,
                              margin: 0,
                              marginBottom: '2px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '140px',
                            }}
                          >
                            {product.title}
                          </p>
                          {(language === 'ar' ? (product.description_ar || product.description) : product.description) && (
                            <p style={{ fontSize: '0.65rem', color: '#78676B', margin: '0 0 4px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {language === 'ar' ? (product.description_ar || product.description) : product.description}
                            </p>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {hasDiscount(product) && (
                              <p
                                style={{
                                  fontSize: '0.7rem',
                                  color: '#D5C2C5',
                                  fontWeight: 500,
                                  margin: 0,
                                  textDecoration: 'line-through',
                                }}
                              >
                                {getOriginalPrice(product)}
                              </p>
                            )}
                            <p
                              style={{
                                fontSize: '0.75rem',
                                color: '#5A2A38',
                                fontWeight: 700,
                                margin: 0,
                              }}
                            >
                              {getDisplayPrice(product)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
            }
          </div>
        </div>

        {/* ── Gold Divider ── */}
        <div className="bellezza-divider" style={{ margin: '1.25rem 1.25rem 0.75rem' }} />

        {/* ── Category Cards ── */}
        <div style={{ padding: '0 1.25rem 1.5rem' }}>
          <p className="section-label" style={{ marginBottom: '0.75rem' }}>{t('home.collections')}</p>

          {loading && Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: 'block',
                marginBottom: '1rem',
                borderRadius: '4px',
                overflow: 'hidden',
                height: '160px',
                background: 'linear-gradient(90deg, #EFE7E1 25%, #EAE1DB 50%, #EFE7E1 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.4s infinite',
              }}
            />
          ))}

          {!loading && categories.map((cat) => (
            <IonRouterLink
              key={cat.slug}
              routerLink={`/categories/${cat.slug}`}
              style={{ display: 'block', textDecoration: 'none', marginBottom: '1rem' }}
            >
              <div className={styles.categoryCard}>
                <img
                  src={cat.coverImage}
                  alt={cat.slug}
                  className={styles.categoryCardImg}
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                />
                <div className={styles.categoryCardOverlay}>
                  <span className={styles.categoryCardTag}>{getCatTagline(cat)}</span>
                  <div className={styles.categoryCardText}>
                    <p className={styles.categoryCardSub}>{t('home.collection')}</p>
                    <h2 className={styles.categoryCardTitle}>{getCatName(cat)}</h2>
                  </div>
                  <span className={styles.categoryCardArrow}>→</span>
                </div>
              </div>
            </IonRouterLink>
          ))}
        </div>

        {/* ── About Us Section ── */}
        {(siteSettings.about_us_description || siteSettings.contact_phone || siteSettings.contact_email || siteSettings.social_facebook || siteSettings.social_instagram || siteSettings.social_tiktok || siteSettings.social_youtube) && (
          <div
            style={{
              padding: '2rem 1.25rem 6rem',
              borderTop: '1px solid #EFE7E1',
              marginTop: '0.5rem',
            }}
          >
            {/* Section label */}
            <p
              className="section-label"
              style={{ marginBottom: '1rem' }}
            >
              {t('aboutUs.title')}
            </p>

            {/* Rose-gold thin divider */}
            <div
              style={{
                width: '40px',
                height: '1px',
                background: '#C99A75',
                marginBottom: '1rem',
              }}
            />

            {/* Description — rendered as HTML exactly as admin styled it, with optional Arabic variant */}
            {(siteSettings.about_us_description || siteSettings.about_us_description_ar) && (
              <div
                className="about-us-content"
                dangerouslySetInnerHTML={{
                  __html:
                    language === 'ar'
                      ? (siteSettings.about_us_description_ar || siteSettings.about_us_description || '')
                      : (siteSettings.about_us_description || siteSettings.about_us_description_ar || ''),
                }}
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.875rem',
                  lineHeight: 1.75,
                  color: '#78676B',
                  marginBottom: '1.5rem',
                }}
              />
            )}

            {/* Social & contact icons — all in one row */}
            {(siteSettings.contact_phone || siteSettings.contact_email || siteSettings.social_facebook || siteSettings.social_instagram || siteSettings.social_tiktok || siteSettings.social_youtube) && (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>

                {/* WhatsApp */}
                {siteSettings.contact_phone && (
                  <a
                    href={`https://wa.me/${siteSettings.contact_phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="WhatsApp"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', background: '#FFFFFF', border: '1px solid #25D366', textDecoration: 'none' }}
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="#25D366">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                    </svg>
                  </a>
                )}

                {/* Call */}
                {siteSettings.contact_phone && (
                  <a
                    href={`tel:${siteSettings.contact_phone}`}
                    title={t('aboutUs.call')}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', background: '#FFFFFF', border: '1px solid #5A2A38', textDecoration: 'none' }}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#5A2A38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.09 6.09l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z" />
                    </svg>
                  </a>
                )}

                {/* Email */}
                {siteSettings.contact_email && (
                  <a
                    href={`mailto:${siteSettings.contact_email}`}
                    title={t('aboutUs.email')}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', background: '#FFFFFF', border: '1px solid #EA4335', textDecoration: 'none' }}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </a>
                )}

                {/* Facebook */}
                {siteSettings.social_facebook && (
                  <a href={siteSettings.social_facebook} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', background: '#FFFFFF', border: '1px solid #4267B2' }}
                    title="Facebook"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="#4267B2">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>
                )}

                {/* Instagram */}
                {siteSettings.social_instagram && (
                  <a href={siteSettings.social_instagram} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', background: '#FFFFFF', border: '1px solid #cc2366' }}
                    title="Instagram"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="url(#igGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <defs>
                        <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f09433" />
                          <stop offset="25%" stopColor="#e6683c" />
                          <stop offset="50%" stopColor="#dc2743" />
                          <stop offset="75%" stopColor="#cc2366" />
                          <stop offset="100%" stopColor="#bc1888" />
                        </linearGradient>
                      </defs>
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="0.5" fill="#dc2743" stroke="none" />
                    </svg>
                  </a>
                )}

                {/* TikTok */}
                {siteSettings.social_tiktok && (
                  <a href={siteSettings.social_tiktok} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', background: '#FFFFFF', border: '1px solid #69C9D0' }}
                    title="TikTok"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="#241419">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
                    </svg>
                  </a>
                )}

                {/* YouTube */}
                {siteSettings.social_youtube && (
                  <a href={siteSettings.social_youtube} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', background: '#FFFFFF', border: '1px solid #FF0000' }}
                    title="YouTube"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="#FF0000">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
                    </svg>
                  </a>
                )}

              </div>
            )}
          </div>
        )}

      </IonContent>
    </IonPage>
  );
};

export default Categories;
