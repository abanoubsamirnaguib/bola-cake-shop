import { useStoreState } from "pullstate";
import { useEffect, useState } from "react";
import { CartStore } from "../store";
import { increaseQty, decreaseQty, removeFromCart, clearCart, addToCart } from "../store/CartStore";
import { getCart } from "../store/Selectors";
import {
  FALLBACK_IMG,
  getDefaultProductAttribute,
  getSuggestedDisplayImage,
  getSuggestedDisplayPrice,
  getSuggestedOriginalPrice,
  getSuggestedProductAttribute,
  hasSuggestedDiscount,
} from "../utils";
import { useI18n } from '../i18n';
import { sendWhatsappMessage, validateDiscountCode, fetchSettings, fetchSuggestedProducts } from '../services/api';
import { ProductModal } from './ProductModal';

const {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
  IonContent,
  IonInput,
  IonLabel,
  IonThumbnail,
  IonFooter,
  IonButton,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonItem,
  IonModal,
  useIonToast,
} = require("@ionic/react");
const { closeOutline, trashOutline } = require("ionicons/icons");

export const CartModal = (props) => {
  const cart = useStoreState(CartStore, getCart);
  const [totalPrice, setTotalPrice] = useState(0);
  const { t, language } = useI18n();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [present] = useIonToast();

  // Discount coupon state
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountError, setDiscountError] = useState('');
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [waPhone, setWaPhone] = useState('201234567899');
  const [step, setStep] = useState(1); // 1 = cart review, 2 = checkout details

  // Suggested products state
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    fetchSettings().then(s => {
      if (s?.whatsapp_phone) setWaPhone(s.whatsapp_phone);
    }).catch(() => {});

    // Fetch suggested products
    fetchSuggestedProducts(10).then(products => {
      console.log('Suggested products fetched:', products);
      setSuggestedProducts(products || []);
    }).catch((error) => {
      console.error('Error fetching suggested products:', error);
      setSuggestedProducts([]);
    });
  }, []);

  const finalTotal = Math.max(0, totalPrice - discountAmount);

  const applyDiscount = async () => {
    if (!discountCode.trim()) return;
    setApplyingDiscount(true);
    setDiscountError('');
    try {
      const res = await validateDiscountCode(discountCode.trim(), totalPrice);
      if (res.valid) {
        setDiscountAmount(Number(res.discount_amount) || 0);
        setDiscountApplied(true);
      } else {
        setDiscountAmount(0);
        setDiscountApplied(false);
        setDiscountError(res.message || t('cart.discountInvalid'));
      }
    } catch {
      setDiscountAmount(0);
      setDiscountApplied(false);
      setDiscountError(t('cart.discountInvalid'));
    } finally {
      setApplyingDiscount(false);
    }
  };

  const removeDiscount = () => {
    setDiscountCode('');
    setDiscountAmount(0);
    setDiscountApplied(false);
    setDiscountError('');
  };

  const handleQuickAddToCart = (product) => {
    const suggestedAttr = getSuggestedProductAttribute(product) || getDefaultProductAttribute(product);

    addToCart({
      id: product.id,
      slug: product.slug,
      title: product.title,
      image: getSuggestedDisplayImage(product),
      price: getSuggestedDisplayPrice(product),
      size: suggestedAttr?.value || null,
      attribute_id: suggestedAttr?.id || null,
      attribute_name: suggestedAttr?.name || null,
      attribute_value: suggestedAttr?.value || null,
    });

    present({
      message: t('cart.addedToBag'),
      duration: 1500,
      position: 'bottom',
      color: 'success',
    });
  };

  const handleOpenProduct = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleCheckout = async () => {
    if (!cart || cart.length === 0) return;
    
    if (!name.trim() || !address.trim() || !phone.trim() || !whatsappNumber.trim()) {
      window.alert((t && t('cart.fillDetails')) || 'Please enter your name, address, phone number, and WhatsApp number before checkout.');
      return;
    }

    const fmt = (n) => {
      const num = Number(n) || 0;
      return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' L.E';
    };

    const lines = [];
    lines.push((t && t('cart.orderSummary')) || 'Order Summary');
    lines.push(' ');
    lines.push(`${t('cart.name')}: ${name}`);
    lines.push(`${t('cart.phone')}: ${phone}`);
    if (whatsappNumber.trim()) {
      lines.push(`${t('cart.whatsappNumber')}: ${whatsappNumber}`);
    }
    lines.push(`${t('cart.address')}: ${address}`);
    lines.push(' ');
    lines.push(` ${t('cart.items')} : `);
    cart.forEach((item) => {
      const raw = String(item.price || '').replace(/[^0-9]/g, "");
      const unit = parseFloat(raw) || 0;
      const qty = item.qty || 1;
      const subtotal = unit * qty;
      const sizeText = item.size ? ` (${item.size})` : '';
      lines.push(`- ${item.title}${sizeText} x${qty} — ${fmt(subtotal)}`);
    });
    lines.push('');
    lines.push(`${t('cart.subtotal')}: ${fmt(totalPrice)}`);
    if (discountApplied && discountAmount > 0) {
      lines.push(`${t('cart.discountAmount')} (${discountCode}): -${fmt(discountAmount)}`);
      lines.push(`${t('cart.finalTotal')}: ${fmt(finalTotal)}`);
    } else {
      lines.push(`Total: ${fmt(totalPrice)}`);
    }
    lines.push('');

    const message = lines.join('\n');

    // Build the WhatsApp URL
    const targetUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;

    // Open the window NOW (inside user-gesture context) so browsers won't block it
    const newWindow = window.open('about:blank', '_blank');

    try {
      // map cart items to order_details expected by the API
      const order_details = cart.map(i => {
        const raw = String(i.price || '').replace(/[^0-9.]/g, "");
        const unit = parseFloat(raw) || 0;
        const qty = i.qty || 1;
        return {
          product_id: i.id || null,
          product_name: i.title,
          attribute_id: i.attribute_id || null,
          attribute_name: i.attribute_name || (i.size ? 'size' : null),
          attribute_value: i.attribute_value || i.size || null,
          quantity: qty,
          unit_price: unit,
          subtotal: unit * qty,
        };
      });

      const apiPayload = {
        customer_name: name,
        customer_phone: phone,
        customer_whatsapp: whatsappNumber || null,
        customer_address: address,
        message: message,
        channel: 'whatsapp',
        order_details: order_details,
        total_amount: totalPrice,
        discount_code: discountApplied ? discountCode : null,
        discount_amount: discountAmount || 0,
        final_amount: finalTotal,
      };

      await sendWhatsappMessage(apiPayload);
    } catch (err) {
      console.error('Failed to save order message:', err);
    }

    // Navigate the already-opened window to the target URL
    if (newWindow) {
      newWindow.location.href = targetUrl;
    } else {
      window.location.href = targetUrl;
    }
    
    // Show success toast
    present({
      message: t('cart.orderSentWhatsapp') || 'Order sent to WhatsApp successfully!',
      duration: 2000,
      position: 'top',
      color: 'success',
    });
    
    // Clear cart and close modal
    clearCart();
    if (props.close) {
      props.close();
    }
  };

  useEffect(() => {
    let total = 0;
    cart.forEach((item) => {
      const raw = String(item.price || '').replace(/[^0-9]/g, "");
      const unit = parseFloat(raw) || 0;
      const qty = item.qty || 1;
      total += unit * qty;
    });
    setTotalPrice(total);
    // Reset discount when cart contents change
    setDiscountAmount(0);
    setDiscountApplied(false);
    setDiscountError('');
    // Reset to step 1 when cart changes
    setStep(1);
  }, [cart]);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar
          style={{
            "--background": "#FBF8F5",
            "--border-color": "transparent",
            "--padding-start": "1rem",
            "--padding-end": "1rem",
          }}
        >
          <IonTitle
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 300,
              fontSize: "1.4rem",
              letterSpacing: "0.25em",
              color: "#5A2A38",
              textTransform: "uppercase",
            }}
          >
            {step === 1 ? t('cart.title') : t('cart.checkoutDetails')}
          </IonTitle>
          <IonButtons slot="end" onClick={props.close}>
            <IonIcon
              icon={closeOutline}
              style={{ color: "#5A2A38", fontSize: "1.5rem", cursor: "pointer" }}
            />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ "--background": "#FBF8F5" }}>
        {/* ════════════ STEP 1: Cart Review ════════════ */}
        {step === 1 && (
          <>
        {/* ── Summary Row ── */}
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid #EFE7E1",
          }}
        >
            <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1rem",
              color: "#241419",
              margin: 0,
            }}
          >
            {t('cart.itemsInBag', {
              count: (cart || []).reduce((s, it) => s + (it.qty || 1), 0),
              itemLabel: (cart || []).reduce((s, it) => s + (it.qty || 1), 0) === 1 ? t('cart.itemSingular') : t('cart.itemPlural'),
            })}
          </p>
          <p
            style={{
              fontSize: "0.72rem",
              color: "#78676B",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              margin: "4px 0 0",
            }}
          >
            {t('cart.reviewCheckout')}
          </p>
        </div>

        {/* ── Cart Items ── */}
        {cart.length === 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "60vh",
            }}
          >
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.5rem",
                color: "#78676B",
                margin: 0,
              }}
            >
              {t('cart.emptyTitle')}
            </p>
            <p style={{ color: "#A0908A", fontSize: "0.8rem" }}>{t('cart.emptySubtitle')}</p>
          </div>
        )}

        {cart.map((item, index) => (
          <IonItemSliding key={index}>
            <IonItem
              lines="none"
              style={{
                "--background": "#FBF8F5",
                "--color": "#241419",
                "--border-color": "#EFE7E1",
                "--inner-border-width": "0 0 1px 0",
                "--padding-start": "1.25rem",
                "--padding-end": "1.25rem",
                paddingTop: "0.75rem",
                paddingBottom: "0.75rem",
              }}
            >
              <IonThumbnail
                slot="start"
                style={{
                  width: "64px",
                  height: "80px",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </IonThumbnail>
              <IonLabel
                style={{ marginLeft: "0.75rem", display: 'flex', flexDirection: 'column' }}
                className="ion-text-wrap"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "1rem",
                      color: "#241419",
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    {item.title}{(item.attribute_value || item.size) ? ` • ${item.attribute_value || item.size}` : ''}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <p style={{ color: '#5A2A38', fontSize: '0.85rem', fontWeight: 500, margin: 0 }}>
                      {(() => {
                        const raw = String(item.price || '').replace(/[^0-9]/g, '');
                        const num = parseFloat(raw) || 0;
                        return `${num.toFixed(2)} L.E`;
                      })()}
                    </p>
                    {(item.qty || 1) > 1 && (
                      <p style={{ color: '#78676B', fontSize: '0.7rem', fontWeight: 400, margin: '2px 0 0', fontStyle: 'italic' }}>
                        {(() => {
                          const raw = String(item.price || '').replace(/[^0-9]/g, '');
                          const num = parseFloat(raw) || 0;
                          const qty = item.qty || 1;
                          const total = num * qty;
                          return `Total: ${total.toFixed(2)} L.E`;
                        })()}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IonButton
                    type="button"
                    size="small"
                    className="sucre-soft"
                    onClick={() => decreaseQty(item, 1)}
                    style={{
                      '--background': '#F4ECE7',
                      '--background-hover': '#E8BEB7',
                      '--background-activated': '#E8BEB7',
                      '--background-focused': '#E8BEB7',
                      '--color': '#5A2A38',
                      '--color-hover': '#401523',
                      '--ripple-color': 'rgba(90, 42, 56, 0.12)',
                      '--border-radius': '6px',
                      minWidth: '32px',
                    }}
                  >
                    -
                  </IonButton>
                  <div style={{ color: '#401523', fontWeight: 600, minWidth: '1.25rem', textAlign: 'center' }}>{item.qty || 1}</div>
                  <IonButton
                    type="button"
                    size="small"
                    onClick={() => increaseQty(item, 1)}
                    style={{
                      '--background': '#5A2A38',
                      '--background-hover': '#451E2A',
                      '--background-activated': '#401523',
                      '--background-focused': '#451E2A',
                      '--color': '#FBF8F5',
                      '--color-hover': '#FBF8F5',
                      '--ripple-color': 'rgba(251, 248, 245, 0.25)',
                      '--border-radius': '6px',
                      minWidth: '32px',
                    }}
                  >
                    +
                  </IonButton>
                </div>
              </IonLabel>
            </IonItem>

            <IonItemOptions side="end">
              <IonItemOption
                style={{ "--background": "#5A2A38", "--color": "#FBF8F5", width: "75px" }}
                onClick={() => removeFromCart(item)}
              >
                <IonIcon icon={trashOutline} slot="icon-only" style={{ color: '#FBF8F5' }} />
              </IonItemOption>
            </IonItemOptions>
          </IonItemSliding>
        ))}

        {/* ── Suggested Products Section ── */}
        {cart.length > 0 && suggestedProducts.length > 0 && (
          <>
            {/* Divider */}
            <div style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, #5A2A38 50%, transparent 100%)',
              margin: '1.5rem 0',
            }} />

            {/* Heading */}
            <div style={{ padding: '0 1.25rem', marginBottom: '0.75rem' }}>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1rem',
                color: '#5A2A38',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                margin: 0,
                fontWeight: 300,
              }}>
                {t('cart.suggestedHeading')}
              </h3>
            </div>

            {/* Suggested Products Horizontal Scroll */}
            <div style={{
              padding: '0 0 1.25rem',
              display: 'flex',
              gap: '0.75rem',
              overflowX: 'auto',
              overflowY: 'hidden',
              paddingLeft: '1.25rem',
              paddingRight: '1.25rem',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
            }}>
              {suggestedProducts.map((product) => {
                const suggestedAttr = getSuggestedProductAttribute(product) || getDefaultProductAttribute(product);
                const suggestedImage = getSuggestedDisplayImage(product);
                const suggestedPrice = getSuggestedDisplayPrice(product);
                const suggestedOriginalPrice = getSuggestedOriginalPrice(product);
                const suggestedHasDiscount = hasSuggestedDiscount(product);
                const productDescription =
                  language === 'ar'
                    ? (product.description_ar || product.description)
                    : product.description;
                return (
                  <div
                    key={product.id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #EFE7E1',
                      boxShadow: '0 4px 16px -4px rgba(90, 42, 56, 0.07)',
                      display: 'flex',
                      flexDirection: 'column',
                      minWidth: '148px',
                      width: '148px',
                      flexShrink: 0,
                      scrollSnapAlign: 'start',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Product Image */}
                    <div
                      onClick={() => handleOpenProduct(product)}
                      style={{
                        width: '100%',
                        height: '120px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        position: 'relative',
                        background: '#F5EFEB',
                      }}
                    >
                      <img
                        src={suggestedImage}
                        alt={product.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      {suggestedHasDiscount && (
                        <div style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          background: '#FECAA2',
                          color: '#795334',
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          padding: '3px 6px',
                          borderRadius: '4px',
                          lineHeight: 1,
                        }}>
                          -{Math.round(suggestedAttr?.discount || 0)}%
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div style={{
                      padding: '0.65rem 0.7rem 0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem',
                      flex: 1,
                    }}>
                      <p
                        onClick={() => handleOpenProduct(product)}
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          color: '#401523',
                          margin: 0,
                          lineHeight: 1.25,
                          cursor: 'pointer',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {product.title}
                      </p>
                      {productDescription && (
                        <p style={{
                          fontSize: '0.62rem',
                          color: '#78676B',
                          margin: 0,
                          lineHeight: 1.35,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {productDescription}
                        </p>
                      )}
                      {suggestedAttr && (
                        <p style={{ fontSize: '0.58rem', color: '#A0908A', margin: 0, lineHeight: 1.2 }}>
                          {[suggestedAttr.name, suggestedAttr.value].filter(Boolean).join(' • ')}
                        </p>
                      )}

                      {/* Price + Add button row (Stitch pattern) */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.4rem',
                        marginTop: 'auto',
                        paddingTop: '0.45rem',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', flexWrap: 'wrap', minWidth: 0 }}>
                          <span style={{
                            color: '#5A2A38',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}>
                            {suggestedPrice}
                          </span>
                          {suggestedOriginalPrice && (
                            <span style={{
                              color: '#D5C2C5',
                              fontSize: '0.62rem',
                              fontWeight: 500,
                              textDecoration: 'line-through',
                            }}>
                              {suggestedOriginalPrice}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          className="sucre-add-btn"
                          aria-label={`Add ${product.title} to cart`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickAddToCart(product);
                          }}
                          style={{
                            width: '32px',
                            height: '32px',
                            flexShrink: 0,
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(90, 42, 56, 0.18)',
                          }}
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#FBF8F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
          </> /* end step 1 */
        )}

        {/* ════════════ STEP 2: Checkout Details ════════════ */}
        {step === 2 && (
          <div style={{ padding: '1rem 1.25rem' }}>
            {/* Step indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '1.25rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid #EFE7E1',
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: '#5A2A38', color: '#FBF8F5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700,
              }}>2</div>
              <p style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1rem',
                color: '#241419',
                margin: 0,
              }}>
                {t('cart.checkoutDetails')}
              </p>
            </div>

            {/* Contact fields */}
            <div style={{ marginBottom: '1rem' }}>
              <IonInput placeholder={(t && t('cart.name')) || 'Name'} value={name} onIonChange={e => setName(e.detail.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', background: '#FBF8F5', border: '1px solid #EFE7E1', borderRadius: '4px', color: '#241419' }} />
              <IonInput placeholder={(t && t('cart.phone')) || 'Phone'} value={phone} onIonChange={e => setPhone(e.detail.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', background: '#FBF8F5', border: '1px solid #EFE7E1', borderRadius: '4px', color: '#241419' }} />
              <IonInput placeholder={(t && t('cart.whatsappNumber')) || 'WhatsApp Number'} value={whatsappNumber} onIonChange={e => setWhatsappNumber(e.detail.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', background: '#FBF8F5', border: '1px solid #EFE7E1', borderRadius: '4px', color: '#241419' }} />
              <IonInput placeholder={(t && t('cart.address')) || 'Address'} value={address} onIonChange={e => setAddress(e.detail.value)} style={{ width: '100%', padding: '0.5rem', background: '#FBF8F5', border: '1px solid #EFE7E1', borderRadius: '4px', color: '#241419' }} />
            </div>

            {/* Discount coupon row */}
            <div style={{ marginBottom: '1rem' }}>
              {!discountApplied ? (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ flex: 1, background: '#FBF8F5', border: '1px solid #EFE7E1', borderRadius: '4px', overflow: 'hidden' }}>
                    <IonInput
                      placeholder={t('cart.discountPlaceholder')}
                      value={discountCode}
                      onIonChange={e => setDiscountCode(e.detail.value)}
                      style={{ '--color': '#241419', '--placeholder-color': '#555', padding: '0 0.5rem' }}
                      onKeyDown={e => { if (e.key === 'Enter') applyDiscount(); }}
                    />
                  </div>
                  <IonButton
                    type="button"
                    size="small"
                    className="sucre-soft"
                    disabled={applyingDiscount || !discountCode.trim()}
                    onClick={applyDiscount}
                    style={{
                      '--background': '#F4ECE7',
                      '--background-hover': '#E8BEB7',
                      '--background-activated': '#E8BEB7',
                      '--background-focused': '#E8BEB7',
                      '--color': '#5A2A38',
                      '--color-hover': '#401523',
                      '--ripple-color': 'rgba(90, 42, 56, 0.12)',
                      '--border-radius': '4px',
                      '--box-shadow': 'none',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      minWidth: '64px',
                    }}
                  >
                    {applyingDiscount ? '...' : t('cart.applyDiscount')}
                  </IonButton>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F0F7F1', border: '1px solid #C5E0CB', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
                  <span style={{ color: '#2E7D4F', fontSize: '0.78rem', fontWeight: 600 }}>
                    {t('cart.discountApplied')} — <span style={{ color: '#5A2A38' }}>{discountCode.toUpperCase()}</span>
                  </span>
                  <span
                    onClick={removeDiscount}
                    style={{ color: '#78676B', fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {t('cart.removing')}
                  </span>
                </div>
              )}
              {discountError && (
                <p style={{ color: '#CF6679', fontSize: '0.72rem', margin: '4px 0 0' }}>{discountError}</p>
              )}
            </div>

            {/* Price breakdown */}
            <div style={{ marginBottom: '1rem' }}>
              {discountApplied && discountAmount > 0 ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', color: '#78676B', margin: 0 }}>
                      {t('cart.subtotal')}
                    </p>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', color: '#78676B', margin: 0 }}>
                      {totalPrice.toFixed(2)} L.E
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', color: '#4CAF50', margin: 0 }}>
                      {t('cart.discountAmount')}
                    </p>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', color: '#4CAF50', margin: 0 }}>
                      -{discountAmount.toFixed(2)} L.E
                    </p>
                  </div>
                  <div style={{ borderTop: '1px solid #EFE7E1', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#78676B', margin: 0 }}>
                      {t('cart.total')}
                    </p>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: '#5A2A38', fontWeight: 400, margin: 0, letterSpacing: '0.05em' }}>
                      {finalTotal.toFixed(2)} L.E
                    </p>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#78676B', margin: 0 }}>
                    {t('cart.total')}
                  </p>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: '#5A2A38', fontWeight: 400, margin: 0, letterSpacing: '0.05em' }}>
                    {totalPrice.toFixed(2)} L.E
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </IonContent>

      {/* ── Footer ── */}
      <IonFooter
        style={{
          "--background": "#FBF8F5",
          borderTop: "1px solid #EFE7E1",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div style={{ padding: "1rem 1.25rem" }}>
          {/* ── Step 1 Footer: Total + Continue ── */}
          {step === 1 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#78676B', margin: 0 }}>
                  {t('cart.total')}
                </p>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: '#5A2A38', fontWeight: 400, margin: 0, letterSpacing: '0.05em' }}>
                  {totalPrice.toFixed(2)} L.E
                </p>
              </div>
              <IonButton
                type="button"
                expand="block"
                className="btn-gold"
                disabled={!cart || cart.length === 0}
                onClick={() => setStep(2)}
                style={{
                  "--background": "#5A2A38",
                  "--background-hover": "#451E2A",
                  "--background-activated": "#401523",
                  "--background-focused": "#451E2A",
                  "--color": "#FBF8F5",
                  "--color-hover": "#FBF8F5",
                  "--ripple-color": "rgba(251, 248, 245, 0.25)",
                  "--border-radius": "4px",
                  "--box-shadow": "none",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {t('cart.continueToCheckout')}
              </IonButton>
            </>
          )}

          {/* ── Step 2 Footer: Back + Send Order ── */}
          {step === 2 && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <IonButton
                type="button"
                className="sucre-soft"
                onClick={() => setStep(1)}
                style={{
                  "--background": "#F4ECE7",
                  "--background-hover": "#E8BEB7",
                  "--background-activated": "#E8BEB7",
                  "--background-focused": "#E8BEB7",
                  "--color": "#5A2A38",
                  "--color-hover": "#401523",
                  "--ripple-color": "rgba(90, 42, 56, 0.12)",
                  "--border-radius": "4px",
                  "--box-shadow": "none",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  flex: '0 0 auto',
                }}
              >
                {t('cart.backToCart')}
              </IonButton>
              <IonButton
                type="button"
                expand="block"
                className="btn-gold"
                onClick={handleCheckout}
                style={{
                  "--background": "#5A2A38",
                  "--background-hover": "#451E2A",
                  "--background-activated": "#401523",
                  "--background-focused": "#451E2A",
                  "--color": "#FBF8F5",
                  "--color-hover": "#FBF8F5",
                  "--ripple-color": "rgba(251, 248, 245, 0.25)",
                  "--border-radius": "4px",
                  "--box-shadow": "none",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  flex: 1,
                }}
              >
                {t('cart.checkout')}
              </IonButton>
            </div>
          )}
        </div>
      </IonFooter>

      {/* Product Details Modal */}
      <IonModal
        isOpen={showProductModal}
        onDidDismiss={() => {
          setShowProductModal(false);
          setSelectedProduct(null);
        }}
      >
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            dismiss={() => {
              setShowProductModal(false);
              setSelectedProduct(null);
            }}
          />
        )}
      </IonModal>
    </IonPage>
  );
};