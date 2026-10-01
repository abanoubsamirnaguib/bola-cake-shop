import { IonButton, IonIcon, useIonToast } from "@ionic/react";
import { bagAddOutline } from "ionicons/icons";
import { addToCart } from "../store/CartStore";
import { useI18n } from '../i18n';

export const AddToCartButton = ({ product, attribute = null, image = null }) => {
	const { t } = useI18n();
	const [present, dismiss] = useIonToast();

	const handleAddToCart = () => {
		addToCart({
			id: product?.id,
			slug: product?.slug,
			title: product?.title,
			image: image || product?.display_image || product?.image,
			price: attribute?.formatted_price || product?.price,
			size: attribute?.value || product?.size || null,
			attribute_id: attribute?.id || null,
			attribute_name: attribute?.name || null,
			attribute_value: attribute?.value || null,
		}, 1);

		// Dispatch event to trigger cart badge pulse animation
		window.dispatchEvent(new CustomEvent('cart-item-added'));

		present({
			message: t('cart.addedToBag') || 'تم الإضافة إلى السلة',
			duration: 3500,
			position: 'top',
			color: 'success',
			buttons: [
				{
					text: t('cart.viewBag') || 'View Bag',
					side: 'end',
					handler: () => {
						dismiss();
						window.dispatchEvent(new CustomEvent('open-cart'));
					},
				},
			],
		});
	};

	return (
		<IonButton
			expand="block"
			className="btn-gold"
			onClick={handleAddToCart}
			style={{
				'--background': '#5A2A38',
				'--background-hover': '#451E2A',
				'--background-activated': '#401523',
				'--background-focused': '#451E2A',
				'--color': '#FBF8F5',
				'--color-hover': '#FBF8F5',
				'--ripple-color': 'rgba(251, 248, 245, 0.25)',
				'--border-radius': '4px',
				'--box-shadow': 'none',
				fontWeight: 600,
				letterSpacing: '0.12em',
				textTransform: 'uppercase',
				fontSize: '0.75rem',
				fontFamily: "'Plus Jakarta Sans', sans-serif",
			}}
		>
			<IonIcon icon={bagAddOutline} slot="start" />
			{t('actions.addToBag')}
		</IonButton>
	);
}