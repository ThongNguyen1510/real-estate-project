// Format price in VND
export const formatPrice = (price: number, isRent: boolean = false): string => {
  if (!price) return 'Thỏa thuận';
  
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(price);
  
  return isRent ? `${formattedPrice}/tháng` : formattedPrice;
};

// Format area in m²
export const formatArea = (area: number): string => {
  if (!area) return '0 m²';
  return `${area} m²`;
};

// Format date to Vietnamese format
export const formatDate = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';
  
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
}; 