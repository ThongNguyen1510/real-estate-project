// API endpoint base URL
export const API_URL = 'http://localhost:3001/api';

// URL hiện tại mà web đang chạy 
export const FRONTEND_URL = 'http://localhost:3000';

// Config cho application
export const APP_CONFIG = {
  APP_NAME: 'Bất Động Sản Việt Nam',
  DEFAULT_PAGE_SIZE: 12,
  MAX_UPLOAD_SIZE: 5242880, // 5MB in bytes
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  DEFAULT_CURRENCY: 'VND'
};

// Cấu hình mặc định cho tìm kiếm
export const SEARCH_CONFIG = {
  DEFAULT_SORT: 'created_at',
  DEFAULT_SORT_DIRECTION: 'DESC',
  PRICE_MIN: 0,
  PRICE_MAX: 50000000000, // 50 tỷ
  AREA_MIN: 0,
  AREA_MAX: 500
};

export default {
  API_URL,
  APP_CONFIG,
  SEARCH_CONFIG
}; 