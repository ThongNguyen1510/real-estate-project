import axios from 'axios';

// Giới hạn yêu cầu của Nominatim là 1 request/giây
const nominatimApi = axios.create({
  baseURL: 'https://nominatim.openstreetmap.org',
  headers: {
    'Content-Type': 'application/json',
    // Đảm bảo thêm thông tin liên hệ vào User-Agent theo quy định của Nominatim
    'User-Agent': 'RealEstateApp/1.0 (your-email@example.com)'
  }
});

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  display_name?: string;
}

/**
 * Geocode an address to get latitude and longitude
 * @param address The address to geocode
 * @returns A promise that resolves to a geocoding result
 */
export const geocodeAddress = async (address: string) => {
  try {
    console.log('Geocoding address:', address + ', Việt Nam');
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address + ', Việt Nam',
        format: 'json',
        limit: 1
      },
      headers: {
        'Accept-Language': 'vi',
        'User-Agent': 'ReactRealEstateApp/1.0'
      }
    });

    console.log('Geocoding API response:', response.data);
    
    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        success: true,
        data: {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          display_name: result.display_name
        }
      };
    }
    
    console.log('No geocoding results found for address:', address);
    return {
      success: false,
      message: 'Không tìm thấy tọa độ cho địa chỉ này'
    };
  } catch (error: any) {
    console.error('Error geocoding address:', error);
    return {
      success: false,
      message: error.message || 'Lỗi khi lấy tọa độ địa chỉ'
    };
  }
};

/**
 * Chuyển đổi tọa độ thành địa chỉ (reverse geocoding)
 * @param latitude Vĩ độ
 * @param longitude Kinh độ
 * @returns Kết quả địa chỉ
 */
export const reverseGeocode = async (latitude: number, longitude: number): Promise<{
  success: boolean;
  data?: { address: string, display_name: string };
  message?: string;
}> => {
  try {
    const response = await nominatimApi.get('/reverse', {
      params: {
        lat: latitude,
        lon: longitude,
        format: 'json',
        'accept-language': 'vi'
      }
    });

    if (response.data) {
      return {
        success: true,
        data: {
          address: response.data.address ? 
            [
              response.data.address.road,
              response.data.address.suburb,
              response.data.address.city_district,
              response.data.address.city || response.data.address.county
            ].filter(Boolean).join(', ') : 
            response.data.display_name,
          display_name: response.data.display_name
        }
      };
    } else {
      return {
        success: false,
        message: 'Không tìm thấy địa chỉ cho tọa độ này'
      };
    }
  } catch (error: any) {
    console.error('Lỗi reverse geocoding:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Lỗi khi chuyển đổi tọa độ thành địa chỉ'
    };
  }
};

export default {
  geocodeAddress,
  reverseGeocode
}; 