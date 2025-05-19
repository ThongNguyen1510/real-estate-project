const axios = require('axios');
require('dotenv').config();

/**
 * Lấy tọa độ từ địa chỉ sử dụng OpenStreetMap Nominatim API
 * @param {string} address - Địa chỉ đầy đủ cần geocode
 * @returns {Promise<{success: boolean, latitude: number|null, longitude: number|null, message?: string}>}
 */
async function getCoordinatesFromAddress(address) {
  try {
    // Thêm thông tin quốc gia để tăng độ chính xác
    const searchAddress = `${address}, Việt Nam`;
    
    console.log('Geocoding address:', searchAddress);
    
    // Sử dụng Nominatim API (OpenStreetMap)
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: searchAddress,
        format: 'json',
        addressdetails: 1,
        limit: 1
      },
      headers: {
        'User-Agent': 'RealEstateVNApp/1.0'
      }
    });

    // Thêm delay để tuân thủ usage policy của Nominatim (tối đa 1 request/giây)
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      console.log('Geocoding successful:', {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        display_name: result.display_name
      });
      
      return {
        success: true,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      };
    } else {
      console.log('No geocoding results found for address:', address);
      return {
        success: false,
        latitude: null,
        longitude: null,
        message: 'Không tìm thấy tọa độ cho địa chỉ này'
      };
    }
  } catch (error) {
    console.error('Error during geocoding:', error.message);
    return {
      success: false,
      latitude: null,
      longitude: null,
      message: error.message || 'Lỗi không xác định khi geocoding'
    };
  }
}

module.exports = {
  getCoordinatesFromAddress
}; 