// Lấy token từ localStorage
export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// Lưu token vào localStorage
export const setAccessToken = (token: string): void => {
  localStorage.setItem('accessToken', token);
};

// Xóa token khỏi localStorage
export const removeAccessToken = (): void => {
  localStorage.removeItem('accessToken');
};

// Kiểm tra xem token có tồn tại không
export const hasAccessToken = (): boolean => {
  return !!localStorage.getItem('accessToken');
}; 