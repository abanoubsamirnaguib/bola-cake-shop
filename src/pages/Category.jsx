import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  useIonModal,
  useIonRouter,
} from '@ionic/react';
import { chevronBack, optionsOutline } from 'ionicons/icons';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { FilterModal } from '../components/FilterModal';
import { ProductModal } from '../components/ProductModal';
import { FALLBACK_IMG, productInfo, getDisplayImage, getDisplayPrice, getOriginalPrice, hasDiscount } from '../utils';
import { useI18n } from '../i18n';
import { LanguageToggle } from '../components/LanguageToggle';
import { fetchCategory, fetchCategoryTags, fetchProducts } from '../services/api';

const StarRating = ({ rating }) => {
  const stars = Math.round(rating);
  return (
    <span style={{ color: '#C99A75', fontSize: '0.7rem', letterSpacing: '1px' }}>
      {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
      <span style={{ color: '#78676B', marginLeft: '4px' }}>{rating}</span>
    </span>
  );
};

const Category = () => {
  const router = useIonRouter();
  const { category } = useParams();
  const { t, language } = useI18n();
  const productsRef = useRef();

  // Static fallback info (used until API data arrives)
  const staticInfo = productInfo[category];

  // Category metadata from backend
  const [categoryInfo, setCategoryInfo] = useState(null);

  // Dynamic tags loaded from the backend (used as filter chips)
  const [availableTags, setAvailableTags] = useState([]);

  // Products state
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState('All');
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Derive display values: prefer API data, fall back to static
  const coverImage  = categoryInfo?.cover_image || FALLBACK_IMG;
  const tagline     = categoryInfo?.tagline     || staticInfo?.tagline    || '';
  const taglineAr   = categoryInfo?.tagline_ar  || tagline;
  // filters = dynamic tags from API (with 'None' prepended), fall back to static list
  const filters = availableTags.length > 0
    ? ['All', ...availableTags]
    : ['All'];
  const searchPlaceholder = t('search.placeholder', {
    subject: t('search.subjects.fragrances', null, 'fragrances'),
  });

  // ─── Modals ───────────────────────────────────────────────────────────────────
  const [presentProductModal, dismissProductModal] = useIonModal(ProductModal, {
    dismiss: () => dismissProductModal(),
    category,
    type: category,
    product: selectedProduct,
  });

  const handleProductModal = (product) => {
    setSelectedProduct(product);
    presentProductModal();
  };

  const [present, dismiss] = useIonModal(FilterModal, {
    dismiss: () => dismiss(),
    filterCriteria,
    setFilterCriteria,
    productsRef,
    filters,
  });

  const openModal = () => {
    present({ breakpoints: [0, 0.35], initialBreakpoint: 0.35, backdropBreakpoint: 0 });
  };

  // ─── Fetch category metadata ──────────────────────────────────────────────────
  useEffect(() => {
    if (!category) return;
    fetchCategory(category).then(setCategoryInfo).catch(() => {/* use static fallback */});
    // Load tags for this category to populate the filter chips
    fetchCategoryTags(category)
      .then((tags) => setAvailableTags(Array.isArray(tags) ? tags : []))
      .catch(() => {/* keep static fallback */});
  }, [category]);

  // ─── Fetch products ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!category) { setLoading(false); return; }
    setLoading(true);
    setProducts([]);
    setFilteredProducts([]);
    setCurrentPage(1);
    fetchProducts(category, { per_page: 20, page: 1 })
      .then((resp) => {
        const data = resp?.data || [];
        setProducts(data);
        setFilteredProducts(data);
        setLastPage(resp?.last_page || 1);
        setActiveFilter('All');
      })
      .catch((err) => console.error('Failed to fetch products', err))
      .finally(() => setLoading(false));
  }, [category]);

  // Watch filterCriteria changes dispatched from FilterModal
  useEffect(() => {
    if (filterCriteria !== activeFilter) {
      applyFilter(filterCriteria);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCriteria]);

  // ─── Search ───────────────────────────────────────────────────────────────────
  const performSearch = async (e) => {
    const q = e.target.value?.trim() || '';
    if (!q) { setFilteredProducts(products); return; }
    setLoading(true);
    try {
      const resp = await fetchProducts(category, { search: q, per_page: 20 });
      setFilteredProducts(resp?.data || []);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Filter ───────────────────────────────────────────────────────────────────
  const applyFilter = async (f) => {
    setActiveFilter(f);
    if (f === 'All') { setFilteredProducts(products); return; }
    setLoading(true);
    try {
      const resp = await fetchProducts(category, { tag: f, per_page: 20 });
      setFilteredProducts(resp?.data || []);
    } catch {
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Load more (infinite scroll stub) ────────────────────────────────────────
  const loadMore = async () => {
    if (loadingMore || currentPage >= lastPage) return;
    const nextPage = currentPage + 1;
    setLoadingMore(true);
    try {
      const resp = await fetchProducts(category, { per_page: 20, page: nextPage });
      const more = resp?.data || [];
      setProducts((prev) => [...prev, ...more]);
      setFilteredProducts((prev) => [...prev, ...more]);
      setCurrentPage(nextPage);
    } catch (err) {
      console.error('Load more failed', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // ─── "Not found" state  ───────────────────────────────────────────────────────
  // Show not-found only when API confirmed the category doesn't exist AND static info is also missing
  const notFound = !loading && !staticInfo && !categoryInfo;

  if (notFound) {
    return (
      <IonPage>
        <IonHeader className="ion-no-border">
          <IonToolbar style={{ '--background': '#FBF8F5', '--border-color': 'transparent', '--min-height': '80px', height: '80px' }}>
            <IonButtons slot="start">
              <IonButton onClick={() => router.goBack()} style={{ '--color': '#5A2A38', '--color-hover': '#401523', '--background-hover': 'rgba(232, 190, 183, 0.22)', '--background-activated': 'rgba(232, 190, 183, 0.32)', '--ripple-color': 'rgba(90, 42, 56, 0.1)' }}>
                <IonIcon icon={chevronBack} />
              </IonButton>
            </IonButtons>
            <IonTitle style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, fontSize: '1.1rem', letterSpacing: '0.18em', color: '#5A2A38', textAlign: 'center', textTransform: 'uppercase' }}>
              <div onClick={() => { router.push('/'); setTimeout(() => window.location.hash = 'hero-section', 100); }} style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                  <img src="/assets/pastry/logo.svg" alt="Sucre" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }} />
                  {/* <span>{t('brand')}</span> */}
                </div>
              </div>
            </IonTitle>
            <IonButtons slot="end"><LanguageToggle /></IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen style={{ '--background': '#FBF8F5' }}>
          <div style={{ padding: '2.5rem 1.25rem' }}>
            <p className="section-label" style={{ margin: 0, marginBottom: '0.5rem' }}>{t('category.notFoundLabel')}</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 300, fontSize: '1.8rem', color: '#241419', margin: 0 }}>
              {t('category.notFoundTitle')}
            </h1>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const catDisplayName =
    language === 'ar'
      ? (categoryInfo?.name_ar || t(`categories.${category}`, null, categoryInfo?.name || category))
      : (categoryInfo?.name || t(`categories.${category}`, null, category));

  const catTagline = (() => {
    const baseTagline = tagline || '';
    const translated = t(`taglines.${category}`, null, baseTagline);
    if (language === 'ar') {
      return taglineAr || translated;
    }
    return translated;
  })();

  const catDescription =
    language === 'ar'
      ? (categoryInfo?.description_ar || categoryInfo?.description || '')
      : (categoryInfo?.description || categoryInfo?.description_ar || '');

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#FBF8F5', '--border-color': 'transparent', '--min-height': '80px', height: '80px' }}>
          <IonButtons slot="start">
            <IonButton onClick={() => router.goBack()} style={{ '--color': '#5A2A38', '--color-hover': '#401523', '--background-hover': 'rgba(232, 190, 183, 0.22)', '--background-activated': 'rgba(232, 190, 183, 0.32)', '--ripple-color': 'rgba(90, 42, 56, 0.1)' }}>
              <IonIcon icon={chevronBack} />
            </IonButton>
          </IonButtons>
          <IonTitle style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, fontSize: '1.4rem', letterSpacing: '0.2em', color: '#5A2A38', textAlign: 'center', textTransform: 'uppercase' }}>
            <div onClick={() => { router.push('/'); setTimeout(() => window.location.hash = 'hero-section', 100); }} style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <img src="/assets/pastry/logo.svg" alt="Sucre" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }} />
                {/* <span>{t('brand')}</span> */}
              </div>
            </div>
          </IonTitle>
          <IonButtons slot="end">
            <LanguageToggle />
            <IonButton onClick={openModal} style={{ '--color': '#5A2A38', '--color-hover': '#401523', '--background-hover': 'rgba(232, 190, 183, 0.22)', '--background-activated': 'rgba(232, 190, 183, 0.32)', '--ripple-color': 'rgba(90, 42, 56, 0.1)' }}>
              <IonIcon icon={optionsOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#FBF8F5' }}>

        {/* ── Hero Banner ── */}
        <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
          <img
            src={coverImage}
            alt={category}
            referrerPolicy="no-referrer"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(64,21,35,0.3) 0%, rgba(64,21,35,0.85) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1.5rem' }}>
            <p className="section-label" style={{ margin: 0, marginBottom: '4px' }}>{catTagline}</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, fontSize: '2.2rem', color: '#FBF8F5', margin: 0, textTransform: 'capitalize' }}>
              {catDisplayName}
            </h1>
          </div>
        </div>

        {/* ── Category Description (from admin, with Arabic variant) ── */}
        {catDescription && (
          <div
            style={{
              padding: '1rem 1.25rem 0',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.8rem',
              lineHeight: 1.6,
              color: '#78676B',
            }}
          >
            {catDescription}
          </div>
        )}

        {/* ── Search ── */}
        <div style={{ padding: '0.75rem 1rem 0' }}>
          <IonSearchbar
            color="light"
            animated
            placeholder={searchPlaceholder}
            onIonChange={(e) => performSearch(e)}
            style={{ '--background': '#F4ECE7', '--color': '#241419', '--placeholder-color': '#78676B', '--icon-color': '#5A2A38', '--border-radius': '4px', '--box-shadow': 'none', padding: 0 }}
          />
        </div>

        {/* ── Filter chips ── */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 1rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              className={`sucre-btn sucre-btn-chip${activeFilter === f ? ' is-active' : ''}`}
              onClick={() => applyFilter(f)}
              style={{
                borderRadius: '8px', padding: '6px 14px', fontSize: '0.65rem', fontWeight: 600,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                whiteSpace: 'nowrap', fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {t(`filters.${f}`, null, f)}
            </button>
          ))}
        </div>

        {/* ── Gold Divider ── */}
        <div className="bellezza-divider" style={{ margin: '0.25rem 1rem 0.75rem' }} />

        {/* ── Product Grid (skeleton while loading) ── */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0 1rem 6rem' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: '#FFFFFF', border: '1px solid #EFE7E1', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ height: '200px', background: 'linear-gradient(90deg, #EFE7E1 25%, #EAE1DB 50%, #EFE7E1 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                <div style={{ padding: '0.6rem 0.75rem 0.75rem' }}>
                  <div style={{ height: '12px', background: '#EFE7E1', borderRadius: '2px', marginBottom: '8px', width: '80%' }} />
                  <div style={{ height: '10px', background: '#EFE7E1', borderRadius: '2px', width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Product Grid ── */}
        {!loading && (
          <div ref={productsRef} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0 1rem 6rem' }}>
            {filteredProducts.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem 1rem', color: '#A0908A' }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', margin: 0 }}>{t('productType.noProducts')}</p>
              </div>
            )}

            {filteredProducts.map((product, index) => {
              const productDescription =
                language === 'ar'
                  ? (product.description_ar || product.description)
                  : product.description;
              const displayImage = getDisplayImage(product);
              if (!displayImage) return null;
              return (
                <div key={product.id || index} onClick={() => handleProductModal(product)} style={{ cursor: 'pointer' }}>
                  <div style={{ background: '#FFFFFF', border: '1px solid #EFE7E1', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 16px -4px rgba(90, 42, 56, 0.06)' }}>
                    <div style={{ position: 'relative', height: '200px', background: '#F5EFEB' }}>
                      <img
                        src={displayImage}
                        alt={product.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {hasDiscount(product) && (
                        <span style={{ position: 'absolute', top: '8px', right: '8px', background: '#FECAA2', color: '#795334', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.08em', padding: '3px 6px', borderRadius: '4px' }}>
                          -{Math.round(product.discount)}%
                        </span>
                      )}
                    </div>
                    <div style={{ padding: '0.6rem 0.75rem 0.75rem' }}>
                      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.9rem', color: '#401523', fontWeight: 500, margin: 0, marginBottom: '3px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product.title}
                      </p>
                      {productDescription && (
                        <p style={{ fontSize: '0.7rem', color: '#78676B', margin: '0 0 4px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {productDescription}
                        </p>
                      )}
                      {product.reviews > 0 && <StarRating rating={product.reviews} />}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '4px 0 0' }}>
                        {hasDiscount(product) && (
                          <p style={{ color: '#D5C2C5', fontSize: '0.75rem', fontWeight: 500, margin: 0, textDecoration: 'line-through' }}>
                            {getOriginalPrice(product)}
                          </p>
                        )}
                        <p style={{ color: '#5A2A38', fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>
                          {getDisplayPrice(product)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ── Load More ── */}
            {currentPage < lastPage && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', paddingTop: '0.5rem' }}>
                <button
                  type="button"
                  className="sucre-btn sucre-btn-outline"
                  onClick={loadMore}
                  disabled={loadingMore}
                  style={{
                    borderRadius: '8px',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    padding: '8px 24px',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    opacity: loadingMore ? 0.5 : 1,
                    cursor: loadingMore ? 'default' : 'pointer',
                  }}
                >
                  {loadingMore ? '...' : t('product.loadMore', null, 'Load More')}
                </button>
              </div>
            )}
          </div>
        )}

      </IonContent>
    </IonPage>
  );
};

export default Category;
