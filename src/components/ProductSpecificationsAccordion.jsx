import { IonAccordion, IonAccordionGroup, IonItem, IonLabel, IonList } from "@ionic/react";
import { useRef, useMemo } from "react";
import { productSpecs, sortProductAttributes } from "../utils";
import { getSpecsByLanguage, useI18n } from '../i18n';

/**
 * Build specs from a product's real backend data, falling back to static productSpecs
 * when individual fields are missing.
 *
 * product.fragrance_notes  →
 *   - object { top, heart, base }
 *   - object { top: { en, ar } }
 *   - object { top: { key_en, key_ar, value: { en, ar } } }
 *   - array  [{ label, value }]
 *
 * product.shipping_info    →
 *   - object or array of {label, value}
 *   - object { label: {en, ar} }
 *   - object { label_en, label_ar, value: {en, ar} }
 *
 * product.attributes       → array [{name, value, price, formatted_price}]
 */
function buildProductSpecs(product, staticSpecs, language) {
  const result = {};

  const resolveLocalizedValue = (val) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      // Nested shape: { value: { en, ar } }
      if (val.value && typeof val.value === 'object') {
        return resolveLocalizedValue(val.value);
      }
      if (language === 'ar') {
        return val.ar || val.en || '';
      }
      return val.en || val.ar || '';
    }
    return String(val);
  };

  // ── Fragrance Notes ──────────────────────────────────────────────────────────
  const fn = product?.fragrance_notes;
  if (fn && typeof fn === 'object') {
    if (Array.isArray(fn) && fn.length > 0) {
      // Array format: [{ label, value }]
      result.details = { header: staticSpecs.details?.header || 'Fragrance Notes', options: fn };
    } else if (!Array.isArray(fn)) {
      // Object format: use ALL keys from the backend dynamically
      const opts = Object.entries(fn)
        .filter(([, v]) => v)
        .map(([storageKey, v]) => {
          if (v && typeof v === 'object') {
            // New shape: { key_en, key_ar, value: { en, ar } }
            const keyEn = v.key_en || storageKey;
            const keyAr = v.key_ar || '';
            const label = language === 'ar'
              ? (keyAr || keyEn || storageKey)
              : (keyEn || storageKey);
            return { label, value: resolveLocalizedValue(v) };
          }
          // Backwards-compatible: simple string or {en, ar}
          return { label: storageKey, value: resolveLocalizedValue(v) };
        });
      if (opts.length > 0) result.details = { header: staticSpecs.details?.header || 'Fragrance Notes', options: opts };
    }
  }
  if (!result.details) result.details = staticSpecs.details;

  // ── Shipping ─────────────────────────────────────────────────────────────────
  const si = product?.shipping_info;
  if (si && typeof si === 'object') {
    if (Array.isArray(si) && si.length > 0) {
      // Array format: [{ label, value }]
      result.shipping = { header: staticSpecs.shipping?.header || 'Shipping', options: si };
    } else if (!Array.isArray(si)) {
      // Object format: use ALL keys from the backend dynamically
      const opts = Object.entries(si)
        .filter(([, v]) => v)
        .map(([storageKey, v]) => {
          if (v && typeof v === 'object') {
            const keyEn = v.key_en || v.label_en || storageKey;
            const keyAr = v.key_ar || v.label_ar || '';
            const label = language === 'ar'
              ? (keyAr || keyEn || storageKey)
              : (keyEn || storageKey);
            return { label, value: resolveLocalizedValue(v) };
          }
          return { label: storageKey, value: resolveLocalizedValue(v) };
        });
      if (opts.length > 0) result.shipping = { header: staticSpecs.shipping?.header || 'Shipping', options: opts };
    }
  }
  if (!result.shipping) result.shipping = staticSpecs.shipping;

  // ── Available Sizes (from product attributes) ─────────────────────────────────
  const sortedAttrs = sortProductAttributes(product);
  if (sortedAttrs.length > 0) {
    result.sizes = {
      header: staticSpecs.sizes?.header || 'Available Sizes',
      wrapText: true,
      options: sortedAttrs.map((a) => {
        // Show discount info if attribute has a discount
        const hasDiscount = a.discount > 0;
        let priceDisplay = a.formatted_price || a.value;
        
        if (hasDiscount) {
          const originalPrice = a.formatted_original_price || `L.E ${Math.round(a.original_price || 0)}`;
          priceDisplay = `${a.value} — ${originalPrice} → ${a.formatted_price} (-${Math.round(a.discount)}%)`;
        } else if (a.formatted_price) {
          priceDisplay = `${a.value} — ${a.formatted_price}`;
        }
        
        return {
          label: a.name,
          value: priceDisplay,
        };
      }),
    };
  } else {
    // No attributes: provide a single "Base Size" option using the product price
    const baseLabel = staticSpecs.sizes?.options?.[1]?.label || 'Base Size';
    const hasDiscount = product?.discount > 0;
    let baseValue = product?.price || (product?.final_price ? `L.E ${Math.round(product.final_price)}` : null);
    
    if (hasDiscount && product?.original_price) {
      baseValue = `${product.original_price} → ${product.price} (-${Math.round(product.discount)}%)`;
    }
    
    result.sizes = {
      header: staticSpecs.sizes?.header || 'Available Sizes',
      wrapText: true,
      options: [{ label: baseLabel, value: baseValue }],
    };
  }

  return result;
}

export const ProductSpecificationsAccordion = ({ type, product }) => {

	const accordionGroupRef = useRef(null);
	const { language } = useI18n();
	const staticSpecs = getSpecsByLanguage(language) || productSpecs;

  // When a real product is passed, derive specs from its data; otherwise use static
  const specs = useMemo(
    () => product ? buildProductSpecs(product, staticSpecs, language) : staticSpecs,
    [product, language, staticSpecs]
  );

	return (
		<IonAccordionGroup ref={accordionGroupRef}>
			{Object.keys(specs).map((spec, index) => {

				const {header, options, wrapText = false} = specs[spec];
        if (!header || !options) return null;

				return (

					<IonAccordion key={`accordion_${header}_${index}`} style={{ '--background': '#FBF8F5', '--border-color': '#EFE7E1' }}>
						<IonItem
							slot="header"
							lines="none"
							style={{ '--background': '#FFFFFF', '--color': '#241419', marginBottom: '2px' }}
						>
							<IonLabel style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5A2A38' }}>
								{header}
							</IonLabel>
						</IonItem>

						<IonList slot="content" style={{ '--background': '#FBF8F5', border: 'none' }}>
							{options.map((option, index2) => {
								const { label, value } = option;
								return (
									<IonItem
										key={`accordion_${header}_${index2}`}
										lines="none"
										style={{ '--background': '#FBF8F5', '--color': '#241419', marginBottom: '2px' }}
									>
										<IonLabel style={{ color: '#78676B', fontSize: '0.8rem' }}>
											{label}
										</IonLabel>
										<IonLabel slot="end" className={wrapText ? 'ion-text-wrap' : ''} style={{ color: '#241419', fontSize: '0.8rem', textAlign: 'right' }}>
											{value}
										</IonLabel>
									</IonItem>
								);
							})}
						</IonList>
					</IonAccordion>
				);
			})}
		</IonAccordionGroup>
	);
}
