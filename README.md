# Anfas — Luxury Perfume Store

A luxury perfume e-commerce mobile app built with **Ionic 6** and **React**, powered by a **Laravel** REST API backend.  
The UI features a dark, editorial aesthetic inspired by high-end fragrance boutiques. 

---

## Screenshot

![Anfas app screenshot](/Anfas.png)

_If the image does not appear, place the provided screenshot file at_ `assets/app-screenshot.png`.

---

## Features

### Storefront
- **Category browsing** — Women, Men, Offers and any custom categories served from the backend
- **Banner slider** — Full-width promotional slides managed from the admin panel
- **Product listing** — Paginated product grid with lazy loading
- **Dynamic search** — Real-time search within any collection
- **Product filtering** — Filter by attributes (size, type, etc.) via a slide-up modal

### Product Detail
- Rich product modal with image, price, description and fragrance notes
- Size / attribute selector
- Product reviews display
- Specifications accordion

### Wishlist & Cart
- **Wishlist** — Save favourite fragrances with persistent local state
- **Shopping bag** — Add, remove, increase / decrease quantity with swipe-to-delete
- **Discount coupon** — Apply and validate promo codes against the backend
- **Price breakdown** — Subtotal, discount line and final total

### Checkout
- Customer details form (name, phone, address) collected before checkout
- Order saved to the backend via the API
- **WhatsApp ordering** — Order summary sent directly to the store's WhatsApp number

### Internationalisation
- Full **English / Arabic** support with RTL layout switching
- Language toggle persisted to local storage

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | Ionic 6 + React 17 |
| Routing | React Router 5 + `@ionic/react-router` |
| State Management | Pullstate |
| Native Runtime | Capacitor 3 (iOS & Android) |
| Styling | CSS Variables, SCSS Modules, `animate.css` |
| Backend | Laravel 10 REST API |
| Icons | Ionicons 6 |

---

## Project Structure

```
src/
  App.jsx                  # Root app, tab bar, cart modal trigger
  config.js                # API base URL and global config
  components/              # Reusable UI components
    CartModal.jsx           # Shopping bag sheet
    FilterModal.jsx         # Product filter sheet
    ProductModal.jsx        # Product detail modal
    ProductReviews.jsx      # Reviews list
    AddToCartButton.jsx     # Cart CTA
    Breadcrumbs.jsx
    LanguageToggle.jsx
  pages/
    Categories.jsx          # Homepage — banner + category grid
    Category.jsx            # Product listing for a category
    Favourites.jsx          # Wishlist page
  services/
    api.js                  # All API calls (categories, products, orders, etc.)
  store/
    CartStore.js            # Pullstate cart store + actions
    FavouritesStore.js      # Pullstate wishlist store
    Selectors.js            # Reselect-based derived state
  i18n/
    index.js                # EN / AR translations + context provider
  theme/
    variables.css           # Ionic CSS variable overrides
backend/                   # Laravel API (see backend/README.md)
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- Ionic CLI: `npm install -g @ionic/cli`
- A running instance of the Laravel backend (see [backend/README.md](backend/README.md))

### Install & Run

```bash
npm install
ionic serve
```

### Configure the API

Edit [src/config.js](src/config.js) and set `API_BASE_URL` to point at your backend:

```js
export const API_BASE_URL = 'http://localhost:8000/api';
```

### Build for Production

```bash
ionic build
```

### Run on iOS / Android (Capacitor)

```bash
ionic build
npx cap sync
npx cap open ios      # opens Xcode
npx cap open android  # opens Android Studio
```

---

## Backend

The Laravel backend handles categories, products, orders, discount codes, WhatsApp message logging and an admin panel.  
See [backend/README.md](backend/README.md) and [backend/API_INTEGRATION.md](backend/API_INTEGRATION.md) for full setup instructions.
# bola-cake-shop
