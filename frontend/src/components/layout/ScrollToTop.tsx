import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component để tự động cuộn trang lên đầu khi chuyển đổi route
 * Đặt component này trong Router để nó áp dụng cho tất cả các route
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Khi pathname thay đổi, cuộn trang lên đầu
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // Component này không render bất kỳ thứ gì
};

export default ScrollToTop; 