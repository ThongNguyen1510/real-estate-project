/**
 * Format a number as Vietnamese currency (VND)
 * @param price - The price to format
 * @param isRent - Whether this is a rental price (to show /month)
 * @returns Formatted price string
 */
export const formatPrice = (price: number, isRent: boolean = false): string => {
  // Handle edge cases
  if (price === 0) return '0 đ';
  if (!price) return 'Giá thỏa thuận';
  
  // Format to Vietnamese currency with billion/million abbreviations
  let formattedPrice = '';
  if (price >= 1000000000) {
    formattedPrice = (price / 1000000000).toLocaleString('vi-VN', { 
      maximumFractionDigits: 2, 
      minimumFractionDigits: 0 
    }) + ' tỷ';
  } else if (price >= 1000000) {
    formattedPrice = (price / 1000000).toLocaleString('vi-VN', { 
      maximumFractionDigits: 2, 
      minimumFractionDigits: 0 
    }) + ' triệu';
  } else if (price >= 1000) {
    formattedPrice = (price / 1000).toLocaleString('vi-VN', { 
      maximumFractionDigits: 2, 
      minimumFractionDigits: 0
    }) + ' nghìn';
  } else {
    formattedPrice = price.toLocaleString('vi-VN') + ' đồng';
  }
  
  // Add "/tháng" suffix for rental properties if specified
  if (isRent) {
    formattedPrice += '/tháng';
  }
  
  return formattedPrice;
};

/**
 * Format a date to Vietnamese format
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string
 */
export const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return 'Không có thông tin';
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    // Kiểm tra xem date có hợp lệ không
    if (isNaN(date.getTime())) {
      return 'Ngày không hợp lệ';
    }
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error, dateString);
    return 'Ngày không hợp lệ';
  }
};

/**
 * Format a date to include time
 * @param dateString - ISO date string or Date object
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return 'Không có thông tin';
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    // Kiểm tra xem date có hợp lệ không
    if (isNaN(date.getTime())) {
      return 'Ngày không hợp lệ';
    }
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date time:', error, dateString);
    return 'Ngày không hợp lệ';
  }
};

/**
 * Calculate how long ago a date was
 * @param dateString - ISO date string or Date object
 * @returns Relative time string (e.g., "2 giờ trước", "3 ngày trước")
 */
export const timeAgo = (dateString: string | Date): string => {
  if (!dateString) return '';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return `${interval} năm trước`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return `${interval} tháng trước`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return `${interval} ngày trước`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return `${interval} giờ trước`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return `${interval} phút trước`;
  }
  
  return 'Vừa xong';
};

/**
 * Truncate a string to a specified length
 * @param text - The string to truncate
 * @param length - Maximum length
 * @returns Truncated string with ellipsis if needed
 */
export const truncateText = (text: string, length: number): string => {
  if (!text) return '';
  if (text.length <= length) return text;
  
  return text.substring(0, length) + '...';
};

/**
 * Format a number with thousands separators
 * @param num - The number to format
 * @returns Formatted number string
 */
export const formatNumber = (num: number): string => {
  if (num === undefined || num === null) return '';
  return num.toLocaleString('vi-VN');
};

/**
 * Format a phone number to Vietnamese format
 * @param phone - The phone number to format (e.g., "0912345678")
 * @returns Formatted phone number (e.g., "0912.345.678")
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1.$2.$3');
  } else if (cleaned.length === 11) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, '$1.$2.$3');
  }
  
  // Return original if not matching expected formats
  return phone;
}; 