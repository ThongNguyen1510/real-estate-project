// Lấy token từ localStorage
export const getAccessToken = (): string | null => {
  const token = localStorage.getItem('token');
  
  // Kiểm tra xem token có đúng định dạng JWT không
  if (token) {
    // Kiểm tra cơ bản xem có đúng định dạng JWT không (header.payload.signature)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.error('Invalid token format in localStorage');
      localStorage.removeItem('token'); // Xóa token không hợp lệ
      return null;
    }
  }
  
  return token;
};

// Lưu token vào localStorage
export const setAccessToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Xóa token khỏi localStorage
export const removeAccessToken = (): void => {
  localStorage.removeItem('token');
};

// Kiểm tra xem token có tồn tại không
export const hasAccessToken = (): boolean => {
  return !!localStorage.getItem('token');
}; 