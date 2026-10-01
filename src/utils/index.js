export const capitalize = s => s && (s[0].toUpperCase() + s.slice(1)).replaceAll("_", " ");

export const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%23F6F3F0'/%3E%3Cstop offset='1' stop-color='%23F4ECE7'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='500' fill='url(%23bg)'/%3E%3Ctext x='200' y='270' fill='%235A2A38' font-size='48' text-anchor='middle' font-family='Georgia%2C serif' opacity='0.35'%3ES%3C/text%3E%3C/svg%3E";

export const productInfo = {

	cakes: {
		tagline: "Signature Pâtisserie",
		tagline_ar: "توقيع باتisserie",
		filters: ["None", "Floral", "Berry", "Vanilla", "Occasion"],
		searchPlaceholder: "pastries",
	},

	tarts: {
		tagline: "Gourmet Boutique",
		tagline_ar: "بوتيك الذواقة",
		filters: ["None", "Raspberry", "Pistachio", "Cream", "Fruit"],
		searchPlaceholder: "pastries",
	},

	macarons: {
		tagline: "Luxury Gift",
		tagline_ar: "هدية فاخرة",
		filters: ["None", "Rose", "Pistachio", "Vanilla", "Gift"],
		searchPlaceholder: "pastries",
	},

	offers: {
		tagline: "Seasonal Selection",
		tagline_ar: "اختيارات الموسم",
		filters: ["None", "Limited", "Gift", "Berry", "Luxury"],
		searchPlaceholder: "pastries",
	},

};

export const productSpecs = {

	details: {

		header: "Flavor Notes",
		options: [
			{
				label: "Top",
				value: "Madagascar Vanilla, Rose"
			},
			{
				label: "Heart",
				value: "Raspberry, Pistachio"
			},
			{
				label: "Base",
				value: "Almond, Cream, Cocoa"
			}
		]
	},
	shipping: {

		header: "Shipping",
		options: [
			{
				label: "Standard",
				value: "3–5 business days"
			},
			{
				label: "Express",
				value: "1–2 business days"
			},
			{
				label: "International",
				value: "7–14 business days"
			}
		]
	},
	sizes: {

		header: "Available Sizes",
		wrapText: true,
		options: [
			{
				label: "Petite",
				value: "Individual"
			},
			{
				label: "Classic",
				value: "6–8 servings"
			},
			{
				label: "Celebration",
				value: "12–16 servings"
			}
		]
	}
};

export const randomCount = () => {

	const max = 273;
	const min = 23;
	return Math.floor(Math.random() * (max - min) + min).toFixed(0);
}

/**
 * Sort product attributes by sort_order (if available), then by id
 * Returns a new sorted array without mutating the original
 */
export const sortProductAttributes = (product) => {
	const attrs = Array.isArray(product?.attributes) ? product.attributes : [];
	if (attrs.length === 0) return [];
	
	return [...attrs].sort((a, b) => {
		// First sort by sort_order if available
		if (a.sort_order !== undefined && b.sort_order !== undefined) {
			return a.sort_order - b.sort_order;
		}
		// Fallback to id
		if (a.id !== undefined && b.id !== undefined) {
			return a.id - b.id;
		}
		return 0;
	});
};

export const getDefaultProductAttribute = (product) => {
	const sortedAttrs = sortProductAttributes(product);
	return sortedAttrs.find((attr) => attr?.is_default) || sortedAttrs[0] || null;
};

export const getSuggestedProductAttribute = (product) => {
	const sortedAttrs = sortProductAttributes(product);
	return sortedAttrs.find((attr) => attr?.is_suggested) || null;
};

export const getAttributeImage = (attribute, fallbackImage = null) => {
	return attribute?.image_url || attribute?.image || fallbackImage || null;
};

export const getSuggestedAttributeImage = (attribute, fallbackImage = null) => {
	return attribute?.suggested_image_url || getAttributeImage(attribute, fallbackImage);
};

export const getDisplayImage = (product) => {
	return (
		product?.display_image ||
		getAttributeImage(getDefaultProductAttribute(product), product?.image) ||
		product?.image ||
		FALLBACK_IMG
	);
};

export const getSuggestedDisplayImage = (product) => {
	const suggestedAttr = getSuggestedProductAttribute(product);
	return (
		product?.suggested_image ||
		getSuggestedAttributeImage(suggestedAttr, getDisplayImage(product)) ||
		getDisplayImage(product)
	);
};

/**
 * Get the display price for a product card
 * Returns the price of the default attribute or the base price
 */
export const getDisplayPrice = (product) => {
	const defaultAttr = getDefaultProductAttribute(product);

	if (defaultAttr) {
		return defaultAttr.formatted_price || defaultAttr.price || product.price;
	}
	
	return product.price;
};

/**
 * Get the original (pre-discount) price for a product card
 * Returns the original price of the default attribute or the base original price
 */
export const getOriginalPrice = (product) => {
	const defaultAttr = getDefaultProductAttribute(product);

	if (defaultAttr) {
		if (defaultAttr.discount > 0) {
			return defaultAttr.formatted_original_price || defaultAttr.original_price;
		}
		return null;
	}
	
	if (product.discount > 0) {
		return product.original_price;
	}
	
	return null;
};

/**
 * Check if a product has an active discount
 * Checks both attribute-level and product-level discounts
 */
export const hasDiscount = (product) => {
	if (!product) return false;
	
	const defaultAttr = getDefaultProductAttribute(product);

	if (defaultAttr) {
		return defaultAttr.discount > 0;
	}
	
	return product.discount > 0;
};

export const getSuggestedDisplayPrice = (product) => {
	const suggestedAttr = getSuggestedProductAttribute(product) || getDefaultProductAttribute(product);
	return suggestedAttr?.formatted_price || suggestedAttr?.price || getDisplayPrice(product);
};

export const getSuggestedOriginalPrice = (product) => {
	const suggestedAttr = getSuggestedProductAttribute(product) || getDefaultProductAttribute(product);
	if (suggestedAttr?.discount > 0) {
		return suggestedAttr.formatted_original_price || suggestedAttr.original_price;
	}
	return null;
};

export const hasSuggestedDiscount = (product) => {
	const suggestedAttr = getSuggestedProductAttribute(product) || getDefaultProductAttribute(product);
	return (suggestedAttr?.discount || 0) > 0;
};