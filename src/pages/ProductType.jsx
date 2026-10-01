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
import { useRef } from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { FilterModal } from '../components/FilterModal';
import { ProductModal } from '../components/ProductModal';
import { capitalize, productInfo, FALLBACK_IMG, getDisplayPrice, getOriginalPrice, hasDiscount } from '../utils';
import { useI18n } from '../i18n';
import { LanguageToggle } from '../components/LanguageToggle';

const StarRating = ({ rating }) => {
  const stars = Math.round(rating);
  return (
    <span style={{ color: '#C99A75', fontSize: '0.7rem', letterSpacing: '1px' }}>
      {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
      <span style={{ color: '#78676B', marginLeft: '4px' }}>{rating}</span>
    </span>
  );
};

const ProductType = () => {
  const router = useIonRouter();
  const { category, type } = useParams();
  const productsRef = useRef();
  const { t } = useI18n();

  const typeInfo = productInfo?.[category]?.productTypes?.[type];

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState('None');
  const [activeFilter, setActiveFilter] = useState('None');
  const [loading, setLoading] = useState(false);

  const filters = typeInfo?.filters || ['None'];
  const searchSubject = typeInfo?.searchPlaceholder || 'fragrances';
  const searchPlaceholder = t('search.placeholder', {
    subject: t(`search.subjects.${searchSubject}`, null, searchSubject),
  });

  const [selectedProduct, setSelectedProduct] = useState([]);
  const [presentProductModal, dismissProductModal] = useIonModal(ProductModal, {
    dismiss: () => dismissProductModal(),
    category,
    type,
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

  const notFound = !typeInfo;

  const BASE_URL = 'https://dummyjson.com/products';
  const SELECT = 'title,price,rating,thumbnail';

  const mapProduct = (p) => ({
    image: p.thumbnail,
    title: p.title,
    price: `\u20ac${Math.round(p.price * 6)}`,
    reviews: p.rating,
  });

  useEffect(() => {
    const getProducts = async () => {
      const currentTypeInfo = productInfo?.[category]?.productTypes?.[type];

      if (!currentTypeInfo) {
        setProducts([]);
        setFilteredProducts([]);
        setActiveFilter('None');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { apiCategory, apiSkip = 0 } = currentTypeInfo;
        const url = `${BASE_URL}/category/${apiCategory}?limit=12&skip=${apiSkip}&select=${SELECT}`;
        const res = await fetch(url);
        const data = await res.json();
        const mapped = (data.products || []).map(mapProduct);
        setProducts(mapped);
        setFilteredProducts(mapped);
        setActiveFilter('None');
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, [category, type]);

  const openModal = () => {
    if (notFound) return;
    present({
      breakpoints: [0, 0.35],
      initialBreakpoint: 0.35,
      backdropBreakpoint: 0,
    });
  };

  const performSearch = async (e) => {
    if (notFound) return;
    const q = e.target.value.trim();
    if (!q) {
      setFilteredProducts(products);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(q)}&limit=20&select=${SELECT}`);
      const data = await res.json();
      setFilteredProducts((data.products || []).map(mapProduct));
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = async (f) => {
    if (notFound) return;
    setActiveFilter(f);
    if (f === 'None') {
      setFilteredProducts(products);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(f)}&limit=12&select=${SELECT}`);
      const data = await res.json();
      const mapped = (data.products || []).map(mapProduct);
      setFilteredProducts(mapped.length > 0 ? mapped : products);
    } catch (err) {
      setFilteredProducts(products);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#FBF8F5', '--border-color': 'transparent' }}>
          <IonButtons slot="start">
            <IonButton onClick={() => router.goBack()} style={{ '--color': '#5A2A38', '--color-hover': '#401523', '--background-hover': 'rgba(232, 190, 183, 0.22)', '--background-activated': 'rgba(232, 190, 183, 0.32)', '--ripple-color': 'rgba(90, 42, 56, 0.1)' }}>
              <IonIcon icon={chevronBack} />
            </IonButton>
          </IonButtons>
          <IonTitle
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 300,
              fontSize: '1rem',
              letterSpacing: '0.25em',
              color: '#5A2A38',
              textTransform: 'uppercase',
            }}
          >
            <div onClick={() => { router.push('/'); setTimeout(() => window.location.hash = 'hero-section', 100); }} style={{ cursor: 'pointer' }}>
              {capitalize(type)}
            </div>
          </IonTitle>
          <IonButtons slot="end">
            <LanguageToggle />
            {!notFound && (
              <IonButton onClick={openModal} style={{ '--color': '#5A2A38', '--color-hover': '#401523', '--background-hover': 'rgba(232, 190, 183, 0.22)', '--background-activated': 'rgba(232, 190, 183, 0.32)', '--ripple-color': 'rgba(90, 42, 56, 0.1)' }}>
                <IonIcon icon={optionsOutline} />
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#FBF8F5' }}>

        {notFound ? (
          <div style={{ padding: '2.5rem 1.25rem' }}>
            <p className="section-label" style={{ margin: 0, marginBottom: '0.5rem' }}>{t('productType.notFoundLabel')}</p>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 300,
                fontSize: '1.8rem',
                color: '#241419',
                margin: 0,
              }}
            >
              {t('productType.notFoundTitle')}
            </h1>
          </div>
        ) : (
          <>

        {/* ── Search ── */}
        <div style={{ padding: '0.75rem 1rem 0' }}>
          <IonSearchbar
            color="light"
            animated
            placeholder={searchPlaceholder}
            onIonChange={(e) => performSearch(e)}
            style={{
              '--background': '#F4ECE7',
              '--color': '#241419',
              '--placeholder-color': '#78676B',
              '--icon-color': '#5A2A38',
              '--border-radius': '4px',
              '--box-shadow': 'none',
              padding: 0,
            }}
          />
        </div>

        {/* ── Filter chips ── */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              className={`sucre-btn sucre-btn-chip${activeFilter === f ? ' is-active' : ''}`}
              onClick={() => applyFilter(f)}
              style={{
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {t(`filters.${f}`, null, f)}
            </button>
          ))}
        </div>

        {/* ── Divider ── */}
        <div className="bellezza-divider" style={{ margin: '0.25rem 1rem 0.75rem' }} />

        {/* ── Product Grid ── */}
        {loading && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              padding: '0 1rem 6rem',
            }}
          >
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
        {!loading && (
        <div
          ref={productsRef}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            padding: '0 1rem 6rem',
          }}
        >
          {filteredProducts.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem 1rem', color: '#A0908A' }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', margin: 0 }}>{t('productType.noProducts')}</p>
            </div>
          )}
          {filteredProducts.map((product, index) => {
            if (!product.image || product.image === '' || product.image.includes('Placeholder')) return null;
            return (
              <div
                key={index}
                onClick={() => handleProductModal(product)}
                style={{ cursor: 'pointer' }}
              >
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #EFE7E1',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 16px -4px rgba(90, 42, 56, 0.06)',
                  }}
                >
                  <div style={{ position: 'relative', height: '200px', background: '#F5EFEB' }}>
                    <img
                      src={product.image}
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
                    <p
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '0.9rem',
                        color: '#401523',
                        fontWeight: 500,
                        margin: 0,
                        marginBottom: '3px',
                        lineHeight: 1.2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {product.title}
                    </p>
                    {product.reviews && <StarRating rating={product.reviews} />}
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
        </div>
        )}

          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProductType;