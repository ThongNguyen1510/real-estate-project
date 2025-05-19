import axios from 'axios';
import { API_URL } from '../config';

// Get properties with pagination and filters
export const getProperties = async (params: any) => {
  try {
    // Log chi tiết các tham số gửi đến API
    console.log('=== API Request Details ===');
    
    // Luôn sử dụng endpoint /properties/search cho mọi yêu cầu tìm kiếm
    const endpoint = `${API_URL}/properties/search`;
    console.log('Using endpoint:', endpoint);
    
    // Tạo bản sao của params để không làm thay đổi giá trị ban đầu
    const normalizedParams = { ...params };
    
    // LỌC BỎ city_name - QUAN TRỌNG
    if (normalizedParams.city_name) {
      console.log('Removing city_name parameter to avoid conflicts:', normalizedParams.city_name);
      delete normalizedParams.city_name;
    }
    
    // LỌC BỎ district_name - QUAN TRỌNG
    if (normalizedParams.district_name) {
      console.log('Removing district_name parameter to avoid conflicts:', normalizedParams.district_name);
      delete normalizedParams.district_name;
    }
    
    // Thêm giá trị status mặc định nếu chưa có
    if (!normalizedParams.status) {
      normalizedParams.status = 'available';
    }
    
    // Chuẩn hóa các tham số
    if (normalizedParams.property_type) {
      console.log('Original property_type:', normalizedParams.property_type);
      normalizedParams.property_type = normalizedParams.property_type.toString().trim().toLowerCase();
      console.log('Normalized property_type:', normalizedParams.property_type);
    }
    
    // Đảm bảo city_id và city được xử lý đúng
    if (normalizedParams.city) {
      console.log('Original city:', normalizedParams.city);
      normalizedParams.city = normalizedParams.city.toString().trim();
      console.log('Normalized city:', normalizedParams.city);
    }
    
    // Đảm bảo district được xử lý đúng
    if (normalizedParams.district) {
      console.log('Original district:', normalizedParams.district);
      normalizedParams.district = normalizedParams.district.toString().trim();
      console.log('Normalized district:', normalizedParams.district);
    }
    
    // Log chi tiết hơn về các tham số quan trọng
    console.log('Chi tiết các tham số quan trọng:');
    console.log('- property_type:', normalizedParams.property_type, typeof normalizedParams.property_type);
    console.log('- city:', normalizedParams.city, typeof normalizedParams.city);
    console.log('- district:', normalizedParams.district, typeof normalizedParams.district);
    console.log('- listing_type:', normalizedParams.listing_type, typeof normalizedParams.listing_type);
    console.log('- status:', normalizedParams.status, typeof normalizedParams.status);
    
    // Tạo chuỗi query từ các tham số
    const queryParams = new URLSearchParams();
    
    // Thêm các tham số vào query string, đảm bảo không có undefined
    Object.keys(normalizedParams).forEach(key => {
      if (normalizedParams[key] !== undefined && normalizedParams[key] !== null && normalizedParams[key] !== '') {
        queryParams.append(key, normalizedParams[key]);
      }
    });
    
    // Log final URL và query string
    const finalUrl = `${endpoint}?${queryParams.toString()}`;
    console.log('Final API URL:', finalUrl);
    console.log('Normalized params:', normalizedParams);
    console.log('=== End API Request Details ===');
    
    // Gọi API endpoint với các tham số đã chuẩn hóa
    const response = await axios.get(endpoint, { params: normalizedParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    
    // Thêm log chi tiết về lỗi
    if (axios.isAxiosError(error)) {
      console.error('API Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          params: error.config?.params
        }
      });
    }
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      status: axios.isAxiosError(error) ? error.response?.status : 500
    };
  }
};

// Get a single property by ID
export const getPropertyById = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/properties/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching property details:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Create a new property
export const createProperty = async (propertyData: any) => {
  try {
    const response = await axios.post(`${API_URL}/properties`, propertyData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating property:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Update a property
export const updateProperty = async (id: string, propertyData: any) => {
  try {
    const response = await axios.put(`${API_URL}/properties/${id}`, propertyData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating property:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Delete a property
export const deleteProperty = async (id: string) => {
  try {
    const response = await axios.delete(`${API_URL}/properties/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting property:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Get featured properties
export const getFeaturedProperties = async (limit = 6) => {
  try {
    const response = await axios.get(`${API_URL}/properties/featured`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Add property to favorites
export const addToFavorites = async (propertyId: string) => {
  try {
    const response = await axios.post(`${API_URL}/favorites`, { property_id: propertyId });
    return response.data;
  } catch (error) {
    console.error('Error adding property to favorites:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Remove property from favorites
export const removeFromFavorites = async (propertyId: string) => {
  try {
    const response = await axios.delete(`${API_URL}/favorites/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing property from favorites:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Upload property images
export const uploadPropertyImages = async (propertyId: string, formData: FormData) => {
  try {
    const response = await axios.post(`${API_URL}/properties/${propertyId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading property images:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Default export for all services
export default {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
  addToFavorites,
  removeFromFavorites,
  uploadPropertyImages
}; 