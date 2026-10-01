import {
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  useIonModal,
  useIonRouter,
} from '@ionic/react';
import { heartOutline } from 'ionicons/icons';
import { useStoreState } from 'pullstate';
import { useState } from 'react';
import { ProductModal } from '../components/ProductModal';
import { LanguageToggle } from '../components/LanguageToggle';
import { FavouritesStore } from '../store';
import { getFavourites } from '../store/Selectors';
import { FALLBACK_IMG, getDisplayImage, getDisplayPrice, getOriginalPrice, hasDiscount } from '../utils';
import { useI18n } from '../i18n';

const Favourites = () => {
  const favourites = useStoreState(FavouritesStore, getFavourites);
  const { t } = useI18n();
  const router = useIonRouter();

  const [selectedProduct, setSelectedProduct] = useState([]);
  const [presentProductModal, dismissProductModal] = useIonModal(ProductModal, {
    dismiss: () => dismissProductModal(),
    product: selectedProduct,
  });

  const handleProductModal = (product) => {
    setSelectedProduct(product);
    presentProductModal();
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#FBF8F5', '--border-color': 'transparent' }}>
          <IonTitle
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 300,
              fontSize: '1.4rem',
              letterSpacing: '0.25em',
              color: '#5A2A38',
              textAlign: 'center',
              textTransform: 'uppercase',
            }}
          >
            <div onClick={() => { router.push('/'); setTimeout(() => window.location.hash = 'hero-section', 100); }} style={{ cursor: 'pointer' }}>
              {t('favourites.title')}
            </div>
          </IonTitle>
          <IonButtons slot="end">
            <LanguageToggle />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#FBF8F5' }}>

        {/* ── Empty State ── */}
        {favourites.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '70vh',
              gap: '1rem',
            }}
          >
            <IonIcon
              icon={heartOutline}
              style={{ color: '#EFE7E1', fontSize: '4rem' }}
            />
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 300,
                color: '#78676B',
                margin: 0,
                fontSize: '1.75rem',
              }}
            >
              {t('favourites.emptyTitle')}
            </h2>
            <p
              style={{
                color: '#A0908A',
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                margin: 0,
              }}
            >
              {t('favourites.emptySubtitle')}
            </p>
          </div>
        )}

        {/* ── Favourites Grid ── */}
        {favourites.length > 0 && (
          <>
            <div style={{ padding: '1.25rem 1.25rem 0.75rem' }}>
              <p className="section-label" style={{ margin: 0 }}>
                {t('favourites.saved', {
                  count: favourites.length,
                  itemLabel: favourites.length === 1 ? t('favourites.itemSingular') : t('favourites.itemPlural'),
                })}
              </p>
            </div>
            <div className="bellezza-divider" style={{ margin: '0 1.25rem 0.75rem' }} />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                padding: '0 1.25rem 6rem',
              }}
            >
              {favourites.map((product, index) => {
                const displayImage = getDisplayImage(product);
                if (!displayImage || displayImage === '' || displayImage.includes('Placeholder')) return null;
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
                          src={displayImage}
                          alt={product.title}
                          referrerPolicy="no-referrer"
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {hasDiscount(product) && (
                          <span style={{ position: 'absolute', top: '8px', left: '8px', background: '#FECAA2', color: '#795334', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.08em', padding: '3px 6px', borderRadius: '4px' }}>
                            -{Math.round(product.discount)}%
                          </span>
                        )}
                        <div
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            color: '#5A2A38',
                            fontSize: '1.1rem',
                          }}
                        >
                          ♥
                        </div>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Favourites;
