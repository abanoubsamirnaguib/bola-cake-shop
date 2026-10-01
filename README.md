# Sucre Pâtisserie

Luxury pastry e-commerce mobile app built with **Ionic 6** and **React**, powered by a **Laravel** REST API.  
Soft blush aesthetic for celebration cakes, French tarts, and artisanal macarons.

---

## Screenshot

![Sucre Pâtisserie home](assets/stitch/home-screen.png)

---

## Features

### Storefront
- **Category browsing** — Celebration Cakes, French Tarts, Macaron Boxes, Offers (and any custom categories from the backend)
- **Banner slider** — Full-width promotional slides managed from the admin panel
- **Featured products** — Highlighted pastries on the home screen
- **Product listing** — Paginated product grid with lazy loading
- **Dynamic search** — Real-time search within any collection
- **Product filtering** — Filter by attributes (size, flavour, etc.) via a slide-up modal

### Product Detail
- Rich product modal with image gallery, price, description and details
- Size / attribute selector
- Product reviews display
- Specifications accordion

### Wishlist & Cart
- **Wishlist** — Save favourite pastries with persistent local state
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
| Backend | Laravel 12 REST API |
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
    Categories.jsx          # Homepage — banner + collections
    Category.jsx            # Product listing for a category
    Product.jsx             # Product detail route
    ProductType.jsx         # Product type listing
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
    variables.css           # Sucre brand palette & Ionic overrides
backend/                   # Laravel API (see backend/README.md)
public/assets/pastry/      # Product & brand images
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

Or with Create React App:

```bash
npm start
```

### Configure the API

Set the API URL in [`.env`](.env) (preferred) or edit [src/config.js](src/config.js):

```env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

```js
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
```

### Build for Production

```bash
npm run build
# or
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

The Laravel backend handles categories, products, orders, discount codes, WhatsApp message logging, settings, and an admin panel.

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# configure DB in .env, then:
php artisan migrate --seed
npm install && npm run build
php artisan serve
```

Default seeded admin: `admin@sucre.test` / `password`

See [backend/README.md](backend/README.md) for more details.
