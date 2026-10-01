/**
 * Central configuration for the Sucre Pâtisserie Ionic React app.
 *
 * Change API_BASE_URL to match your Laravel server address:
 *   - Laragon default vhost  →  http://anfas.test/api/v1
 *   - php artisan serve       →  http://127.0.0.1:8000/api/v1
 *   - Production              →  https://your-domain.com/api/v1
 */
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://anfas.test/api/v1';
