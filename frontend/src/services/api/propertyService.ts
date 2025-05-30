import axios from 'axios';
import { getAccessToken } from './authUtils';

const API_URL = '/api';

// Define interface for propertyService
export interface PropertyService {
  getProperties: (params?: any) => Promise<any>;
  getProperty: (id: string | number) => Promise<any>;
  createProperty: (data: any) => Promise<any>;
  updateProperty: (id: string | number, data: any) => Promise<any>;
  deleteProperty: (id: string | number) => Promise<any>;
  searchProperties: (params: any) => Promise<any>;
  uploadImages: (propertyId: string, formData: FormData) => Promise<any>;
  toggleFavorite: (propertyId: string | number) => Promise<any>;
  reportProperty: (propertyId: number, reason: string, description: string) => Promise<any>;
  renewProperty: (id: string | number) => Promise<any>;
}

// Lấy danh sách bất động sản
export const getProperties = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/properties`, { params });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};

// Lấy chi tiết bất động sản
export const getProperty = async (id: string | number) => {
  try {
    const response = await axios.get(`${API_URL}/properties/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};

// Thêm bất động sản mới
export const createProperty = async (data: any) => {
  try {
    console.log('Creating property with data:', JSON.stringify(data, null, 2));
    console.log('Location data being sent:', JSON.stringify(data.location, null, 2));
    
    // Tạo bản sao dữ liệu để xử lý
    const processedData = {...data};
    
    // Đảm bảo tọa độ là số hợp lệ trước khi gửi
    if (processedData.location) {
      // Make sure all location fields are properly defined
      processedData.location = {
        address: processedData.location.address || '',
        street: processedData.location.street || '',
        city: processedData.location.city || '',
        city_name: processedData.location.city_name || '',
        district: processedData.location.district || '',
        district_name: processedData.location.district_name || '',
        ward: processedData.location.ward || '',
        ward_name: processedData.location.ward_name || '',
        ...processedData.location
      };
      
      // Kiểm tra và chuyển đổi tọa độ sang số
      if (processedData.location.latitude !== null && processedData.location.latitude !== undefined) {
        // Ensure it's a valid number
        const parsedLat = Number(processedData.location.latitude);
        if (!isNaN(parsedLat)) {
          processedData.location.latitude = parsedLat;
        } else {
          console.error('Invalid latitude value:', processedData.location.latitude);
          return {
            success: false,
            message: 'Giá trị vĩ độ không hợp lệ. Vui lòng chọn lại vị trí trên bản đồ.'
          };
        }
      }
      
      if (processedData.location.longitude !== null && processedData.location.longitude !== undefined) {
        // Ensure it's a valid number
        const parsedLng = Number(processedData.location.longitude);
        if (!isNaN(parsedLng)) {
          processedData.location.longitude = parsedLng;
        } else {
          console.error('Invalid longitude value:', processedData.location.longitude);
          return {
            success: false,
            message: 'Giá trị kinh độ không hợp lệ. Vui lòng chọn lại vị trí trên bản đồ.'
          };
        }
      }
      
      // Kiểm tra và đồng bộ tọa độ giữa root và location object
      if (processedData.location.latitude && processedData.location.longitude) {
        processedData.latitude = processedData.location.latitude;
        processedData.longitude = processedData.location.longitude;
      } else if (processedData.latitude && processedData.longitude) {
        processedData.location.latitude = Number(processedData.latitude);
        processedData.location.longitude = Number(processedData.longitude);
      }
      
      console.log('Processed coordinates being sent:', {
        rootLevel: {
          latitude: processedData.latitude,
          longitude: processedData.longitude,
          latType: typeof processedData.latitude,
          lngType: typeof processedData.longitude
        },
        inLocation: {
          latitude: processedData.location.latitude,
          longitude: processedData.location.longitude,
          latType: typeof processedData.location.latitude,
          lngType: typeof processedData.location.longitude
        }
      });
      
      // Ensure address fields are complete
      if (!processedData.location.city || !processedData.location.district || !processedData.location.address) {
        console.error('VALIDATION ERROR: Missing required location fields');
        console.log('Location data:', {
          city: processedData.location.city,
          district: processedData.location.district,
          address: processedData.location.address
        });
        return {
          success: false,
          message: 'Thông tin địa chỉ không đầy đủ. Vui lòng kiểm tra lại Thành phố, Quận/Huyện và Địa chỉ cụ thể.'
        };
      }
    }

    // Kiểm tra cuối cùng trước khi gửi
    if (!processedData.location || 
        processedData.location.latitude === null || 
        processedData.location.longitude === null) {
      console.error('CRITICAL ERROR: Coordinates are null before sending to server!');
      return {
        success: false,
        message: 'Tọa độ bị null trước khi gửi. Vui lòng chọn lại vị trí trên bản đồ và thử lại.'
      };
    }
    
    // Final log of data being sent
    console.log('FINAL DATA BEING SENT TO API:', {
      title: processedData.title,
      location: {
        address: processedData.location.address,
        city: processedData.location.city,
        city_name: processedData.location.city_name,
        district: processedData.location.district,
        district_name: processedData.location.district_name,
        ward: processedData.location.ward,
        ward_name: processedData.location.ward_name,
        latitude: processedData.location.latitude,
        longitude: processedData.location.longitude
      },
      coordinates: {
        latitude: processedData.latitude,
        longitude: processedData.longitude
      }
    });
    
    const response = await axios.post(`${API_URL}/properties/create`, processedData, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`
      }
    });
    
    console.log('Property creation response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Property creation error:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};

// Cập nhật bất động sản
export const updateProperty = async (id: string | number, data: any) => {
  try {
    const response = await axios.put(`${API_URL}/properties/${id}`, data, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};

// Xóa bất động sản
export const deleteProperty = async (id: string | number) => {
  try {
    const response = await axios.delete(`${API_URL}/properties/${id}`, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};

// Search properties
export const searchProperties = async (params: any) => {
  try {
    // Log params trước khi gửi request
    console.log('SEARCH API - Raw search params:', params);
    
    // Tạo bản sao để xử lý
    const processedParams = { ...params };
    
    // Xử lý đặc biệt cho city và city_name
    if (processedParams.city) {
      // Ánh xạ mã thành phố sang tên thành phố
      if (processedParams.city === '1' || processedParams.city === '01') {
        if (!processedParams.city_name) {
          processedParams.city_name = 'Hà Nội';
          console.log('SEARCH API - Added city_name=Hà Nội from city=1');
        }
      } else if (processedParams.city === '79') {
        if (!processedParams.city_name) {
          processedParams.city_name = 'Hồ Chí Minh';
          console.log('SEARCH API - Added city_name=Hồ Chí Minh from city=79');
        }
      }
    }
    
    // Ensure city_name is used exactly as provided (without LIKE pattern)
    if (processedParams.city_name) {
      console.log(`SEARCH API - Using exact city_name: "${processedParams.city_name}"`);
    }
    
    // Xóa các tham số không hợp lệ
    Object.keys(processedParams).forEach(key => {
      if (processedParams[key] === undefined || processedParams[key] === null || processedParams[key] === '') {
        delete processedParams[key];
      }
    });
    
    // Tạo URL với các tham số đã được xử lý, đảm bảo các tham số đặc biệt được mã hóa đúng cách
    const queryString = new URLSearchParams();
    
    // Thêm các tham số vào URL
    Object.entries(processedParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Xử lý đặc biệt với city_name để đảm bảo encode đúng cách
        if (key === 'city_name') {
          const encodedValue = encodeURIComponent(value as string);
          console.log(`SEARCH API - Encoded city_name from "${value}" to "${encodedValue}"`);
          queryString.append(key, value as string);
        } else {
          queryString.append(key, value as string);
        }
      }
    });
    
    const url = `${API_URL}/properties/search?${queryString.toString()}`;
    console.log('SEARCH API - Final API URL:', url);
    
    const response = await axios.get(url);
    console.log('SEARCH API - Response status:', response.status);
    
    return response.data;
  } catch (error) {
    console.error('Error searching properties:', error);
    
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    }
    
    return {
      success: false,
      message: 'Có lỗi xảy ra khi tìm kiếm bất động sản',
      data: { properties: [], pagination: { total: 0, totalPages: 0, currentPage: 1 } }
    };
  }
};

// Upload images for a property
export const uploadImages = async (propertyId: string, formData: FormData) => {
  try {
    const response = await axios.post(`${API_URL}/images/property/${propertyId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${getAccessToken()}`
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};

// Toggle favorite property
export const toggleFavorite = async (propertyId: string | number) => {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const response = await axios.post(
      `${API_URL}/properties/${propertyId}/favorite`, 
      {}, // Empty body
      config
    );
    
    return response.data;
  } catch (error) {
    console.error('Error toggling property favorite status:', error);
    throw error;
  }
};

// Báo cáo tin đăng
export const reportProperty = async (propertyId: number, reason: string, description: string) => {
  try {
    const response = await axios.post(`${API_URL}/properties/${propertyId}/report`, 
      { reason, details: description },
      {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};

// Gia hạn tin đăng
export const renewProperty = async (id: string | number) => {
  try {
    const response = await axios.post(`${API_URL}/properties/${id}/renew`, null, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};

// Export propertyService as object implementing PropertyService interface
const propertyService: PropertyService = {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  searchProperties,
  uploadImages,
  toggleFavorite,
  reportProperty,
  renewProperty
}; 

export default propertyService; 