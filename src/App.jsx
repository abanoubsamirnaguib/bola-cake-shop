import { Route } from 'react-router-dom';
import { IonApp, IonIcon, IonModal, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import 'animate.css';

import { pages } from './pages';
import { useState, useEffect, useCallback } from 'react';
import { cartOutline } from 'ionicons/icons';
import { useRef } from 'react';
import { useStoreState } from 'pullstate';
import { CartStore } from './store';
import { getCartCount } from './store/Selectors';
import { CartModal } from './components/CartModal';

setupIonicReact();

const App = () => {

  const cartCount = useStoreState(CartStore, getCartCount);
  const [ selected, setSelected ] = useState("tab0");
  const [open, setOpen] = useState(false);
  const [cartPulse, setCartPulse] = useState(false);
  const ref = useRef();

  // Listen for custom events from AddToCartButton
  const openCartHandler = useCallback(() => setOpen(true), []);
  const pulseCartHandler = useCallback(() => {
    setCartPulse(true);
    setTimeout(() => setCartPulse(false), 800);
  }, []);

  useEffect(() => {
    window.addEventListener('open-cart', openCartHandler);
    window.addEventListener('cart-item-added', pulseCartHandler);
    return () => {
      window.removeEventListener('open-cart', openCartHandler);
      window.removeEventListener('cart-item-added', pulseCartHandler);
    };
  }, [openCartHandler, pulseCartHandler]);

  const handleClick = tab => {

    tab === "tabCart" ? setOpen(true) : setSelected(tab);
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs onIonTabsWillChange={e => handleClick(e.detail.tab)}>
          <IonRouterOutlet ref={ref}>

            {pages.map((page, index) => (
              <Route key={`route_${index}`} exact={true} path={page.href} component={page.component} />
            ))}

          </IonRouterOutlet>

          <IonTabBar slot="bottom"
            style={{
              '--background': 'rgba(251, 248, 245, 0.92)',
              '--border': 'none',
              borderTop: '1px solid #E8BEB7',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            {pages.map((page, index) => {

              const isSelected = selected === `tab${index}`;

              if (page.isTab) {
                return (
                  <IonTabButton key={`tab${index}`} tab={`tab${index}`} href={page.href}>
                    <IonIcon icon={page.icon} />
                    { isSelected && <div className="tab-dot" /> }
                  </IonTabButton>
                );
              } else return null;
            })}

            <IonTabButton tab="tabCart">
              <IonIcon icon={cartOutline} className={cartPulse ? 'cart-icon-pulse' : ''} />
              <div className={`cart-count${cartPulse ? ' cart-count-pulse' : ''}`}>{cartCount}</div>
            </IonTabButton>
          </IonTabBar>

        </IonTabs>
      </IonReactRouter>
      
      <IonModal presentingElement={ref.current} isOpen={open} onDidDismiss={() => setOpen(false)}>
        <CartModal close={() => setOpen(false)} />
      </IonModal>
    </IonApp>
  );
}

export default App;
