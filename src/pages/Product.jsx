import {
  IonContent,
  IonPage,
  IonSpinner,
  useIonModal,
  useIonRouter,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { ProductModal } from '../components/ProductModal';
import { fetchProduct } from '../services/api';

/**
 * Product detail page component
 * Loads a product by slug and displays it in a modal
 * When modal is dismissed, navigate back to category or home
 */
const Product = () => {
  const router = useIonRouter();
  const { category, slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await fetchProduct(slug);
        setProduct(data);
      } catch (err) {
        console.error('Error loading product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadProduct();
    }
  }, [slug]);

  // Set up product modal
  const [presentProductModal, dismissProductModal] = useIonModal(ProductModal, {
    dismiss: () => {
      dismissProductModal();
      // Navigate back to category or home
      const backUrl = category ? `/categories/${category}` : '/';
      router.push(backUrl, 'back');
    },
    category: category || product?.category?.slug,
    product: product,
  });

  // Show modal when product is loaded
  useEffect(() => {
    if (product && !loading) {
      presentProductModal({
        onDidDismiss: () => {
          // Navigate back when modal is dismissed
          const backUrl = category ? `/categories/${category}` : '/';
          router.push(backUrl, 'back');
        },
      });
    }
  }, [product, loading, category, presentProductModal, router]);

  return (
    <IonPage>
      <IonContent style={{ '--background': '#FBF8F5' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          {loading && <IonSpinner name="crescent" color="primary" />}
          {error && (
            <div style={{ color: '#241419', textAlign: 'center', padding: '2rem' }}>
              <p>Error loading product</p>
              <p style={{ fontSize: '0.9rem', color: '#78676B' }}>{error}</p>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Product;
