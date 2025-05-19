import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component để tự động cuộn trang lên đầu khi chuyển đổi route
 * Đặt component này trong Router để nó áp dụng cho tất cả các route
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Only scroll to top if there's no hash in the URL (not targeting a specific section)
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null; // Component này không render bất kỳ thứ gì
};

export default ScrollToTop; 