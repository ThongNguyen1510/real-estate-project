import axios from 'axios';
import { API_URL } from '../../config';

const PROVINCES_API_URL = 'https://provinces.open-api.vn/api';

interface LocationResponse {
  success: boolean;
  data?: any;
  message?: string;
}

// Hàm tiện ích để chuẩn hóa tên tiếng Việt
const normalizeVietnameseName = (name: string): string => {
  if (!name) return '';
  
  // Chuẩn hóa "TP Hồ Chí Minh", "TP. Hồ Chí Minh", "Thành phố Hồ Chí Minh" -> "Hồ Chí Minh"
  let normalized = name.trim();
  normalized = normalized.replace(/^TP\.?\s+/i, '');
  normalized = normalized.replace(/^Thành phố\s+/i, '');
  normalized = normalized.replace(/^Tỉnh\s+/i, '');
  
  return normalized.trim();
};

// Lấy danh sách tỉnh/thành phố
export const getCities = async (): Promise<LocationResponse> => {
  try {
    // Thử lấy từ API provinces.open-api.vn trước
    try {
      const timestamp = new Date().getTime();
      const response = await axios.get(`${PROVINCES_API_URL}/?_t=${timestamp}`);
      if (response.data && Array.isArray(response.data)) {
        // Format lại dữ liệu để phù hợp với frontend
        const cities = response.data.map((province: any) => ({
          id: province.code.toString(),
          name: province.name,
          division_type: province.division_type
        }));
        
        console.log('Loaded cities from provinces API:', cities.length);
        
        return {
          success: true,
          data: cities
        };
      }
    } catch (openApiError: unknown) {
      const errorMessage = openApiError instanceof Error ? openApiError.message : 'Unknown error';
      console.error('Lỗi khi lấy dữ liệu từ provinces.open-api.vn:', errorMessage);
      // Nếu lỗi, tiếp tục thử với API local
    }

    // Nếu API provinces.open-api.vn không hoạt động, sử dụng API local
    const timestamp = new Date().getTime();
    const response = await axios.get(`${API_URL}/locations/cities?_t=${timestamp}`);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error && 'response' in error && error.response) {
      return (error as any).response.data;
    }
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Lấy danh sách quận/huyện theo tỉnh/thành phố
export const getDistrictsByCity = async (city: string): Promise<LocationResponse> => {
  try {
    console.log('Getting districts for city (raw input):', city);
    
    // Kiểm tra xem city có phải là mã số không
    const isNumericCode = !isNaN(Number(city));
    
    // Thử lấy trực tiếp từ API nếu city là mã tỉnh
    if (isNumericCode) {
      try {
        console.log('Trying direct district lookup with province code:', city);
        const timestamp = new Date().getTime();
        const directResponse = await axios.get(
          `${PROVINCES_API_URL}/p/${city}?depth=2&_t=${timestamp}`
        );
        
        if (directResponse.data && directResponse.data.districts) {
          const districts = directResponse.data.districts.map((district: any) => ({
            id: district.code.toString(),
            name: district.name,
            division_type: district.division_type
          }));
          
          console.log('Direct district lookup succeeded, found', districts.length, 'districts');
          return {
            success: true,
            data: districts
          };
        }
      } catch (directError: unknown) {
        const errorMessage = directError instanceof Error ? directError.message : 'Unknown error';
        console.log('Direct district lookup failed, will try other methods:', errorMessage);
      }
    }
    
    // Tiếp tục với phương pháp tìm kiếm tỉnh hiện tại
    try {
      // Tìm mã tỉnh từ tên
      const provincesResponse = await axios.get(`${PROVINCES_API_URL}/`);
      if (provincesResponse.data && Array.isArray(provincesResponse.data)) {
        console.log('Provinces API responded with', provincesResponse.data.length, 'provinces');
        
        // Chuẩn hóa tên thành phố đầu vào để so sánh
        const normalizedCity = normalizeVietnameseName(city);
        console.log('Looking for province matching normalized name:', normalizedCity, 'or code:', city);
        
        // Tìm theo tên chuẩn hóa hoặc mã code
        let province = provincesResponse.data.find((p: any) => {
          // So sánh với code trước
          if (p.code.toString() === city) return true;
          
          // Chuẩn hóa tên tỉnh để so sánh
          const normalizedProvince = normalizeVietnameseName(p.name);
          return normalizedProvince === normalizedCity;
        });
        
        if (province) {
          console.log('Found province in API:', province.name, province.code);
          
          const timestamp = new Date().getTime();
          console.log(`Fetching districts for province code ${province.code}...`);
          const districtResponse = await axios.get(
            `${PROVINCES_API_URL}/p/${province.code}?depth=2&_t=${timestamp}`
          );
          
          console.log('District API response:', districtResponse.data);
          
          if (districtResponse.data && districtResponse.data.districts) {
            // Format lại dữ liệu để phù hợp với frontend
            const districts = districtResponse.data.districts.map((district: any) => ({
              id: district.code.toString(),
              name: district.name,
              division_type: district.division_type
            }));
            
            console.log('Loaded districts from API:', districts.length);
            console.log('First 3 districts:', districts.slice(0, 3));
            
            return {
              success: true,
              data: districts
            };
          } else {
            console.warn('Districts data structure is unexpected:', districtResponse.data);
            return {
              success: false,
              message: 'Cấu trúc dữ liệu quận/huyện không đúng định dạng'
            };
          }
        } else {
          console.log('Province not found in API. All provinces:');
          console.log(provincesResponse.data.map((p: any) => `${p.name} (${p.code})`).slice(0, 10));
          
          // Thử tìm một cách khác: phương pháp mới thử tìm theo một phần của tên
          const possibleMatches = provincesResponse.data.filter((p: any) => {
            // Nếu tên tỉnh chứa hoặc được chứa trong city
            const normalizedProvince = normalizeVietnameseName(p.name);
            return normalizedProvince.includes(normalizedCity) || 
                   normalizedCity.includes(normalizedProvince);
          });
          
          if (possibleMatches.length > 0) {
            console.log('Found possible matches:', possibleMatches.map((p: any) => `${p.name} (${p.code})`));
            
            // Sử dụng kết quả đầu tiên
            const bestMatch = possibleMatches[0];
            console.log('Using best match:', bestMatch.name, bestMatch.code);
            
            const timestamp = new Date().getTime();
            const districtResponse = await axios.get(
              `${PROVINCES_API_URL}/p/${bestMatch.code}?depth=2&_t=${timestamp}`
            );
            
            if (districtResponse.data && districtResponse.data.districts) {
              const districts = districtResponse.data.districts.map((district: any) => ({
                id: district.code.toString(),
                name: district.name,
                division_type: district.division_type
              }));
              
              console.log('Loaded districts from best match:', districts.length);
              
              return {
                success: true,
                data: districts
              };
            }
          } else {
            console.log('No possible province matches found for:', city);
          }
        }
      }
    } catch (openApiError: unknown) {
      const errorMessage = openApiError instanceof Error ? openApiError.message : 'Unknown error';
      console.error('Lỗi khi lấy quận/huyện từ provinces.open-api.vn:', errorMessage);
      // Nếu lỗi, tiếp tục thử với API local
    }

    // Nếu API provinces.open-api.vn không hoạt động, sử dụng API local
    console.log('Falling back to local API for districts');
    const timestamp = new Date().getTime();
    const response = await axios.get(
      `${API_URL}/locations/districts/${encodeURIComponent(city)}?_t=${timestamp}`
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Error in getDistrictsByCity:', error);
    if (error instanceof Error && 'response' in error && error.response) {
      return (error as any).response.data;
    }
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Lấy danh sách phường/xã theo quận/huyện
export const getWardsByDistrict = async (district: string): Promise<LocationResponse> => {
  try {
    console.log('Getting wards for district (raw input):', district);
    
    // Thử lấy trực tiếp từ API nếu district là mã quận/huyện
    if (!isNaN(Number(district))) {
      try {
        console.log('Trying direct ward lookup with district code:', district);
        const timestamp = new Date().getTime();
        const directWardResponse = await axios.get(
          `${PROVINCES_API_URL}/d/${district}?depth=2&_t=${timestamp}`
        );
        
        if (directWardResponse.data && directWardResponse.data.wards) {
          const wards = directWardResponse.data.wards.map((ward: any) => ({
            id: ward.code.toString(),
            name: ward.name,
            division_type: ward.division_type
          }));
          
          console.log('Direct ward lookup succeeded, found', wards.length, 'wards');
          return {
            success: true,
            data: wards
          };
        } else {
          console.warn('Direct ward lookup returned unexpected data structure:', directWardResponse.data);
        }
      } catch (directError: unknown) {
        const errorMessage = directError instanceof Error ? directError.message : 'Unknown error';
        console.error('Direct ward lookup failed:', errorMessage);
        console.log('Will try province lookup method');
      }
    }
    
    // Thử lấy từ API provinces.open-api.vn qua các tỉnh
    try {
      // Tìm mã district từ tên - cần tìm qua các tỉnh
      const provincesResponse = await axios.get(`${PROVINCES_API_URL}/`);
      if (provincesResponse.data && Array.isArray(provincesResponse.data)) {
        console.log('Provinces API responded with', provincesResponse.data.length, 'provinces');
        
        const normalizedDistrict = normalizeVietnameseName(district);
        console.log('Looking for district matching normalized name:', normalizedDistrict);
        
        // Track search progress
        let searchedProvinces = 0;
        let districtSearches = 0;
        
        for (const province of provincesResponse.data) {
          searchedProvinces++;
          try {
            console.log(`Checking province ${province.code} (${province.name}) - Search ${searchedProvinces}/${provincesResponse.data.length}`);
            const districtResponse = await axios.get(
              `${PROVINCES_API_URL}/p/${province.code}?depth=2`
            );
            
            if (districtResponse.data && districtResponse.data.districts) {
              districtSearches++;
              // Log first few districts to aid debugging
              if (districtSearches <= 3) {
                console.log(`Province ${province.name} has ${districtResponse.data.districts.length} districts. First 3:`, 
                  districtResponse.data.districts.slice(0, 3).map((d: any) => `${d.name} (${d.code})`));
              }
              
              // Tìm theo mã code hoặc tên đã chuẩn hóa
              const foundDistrict = districtResponse.data.districts.find((d: any) => {
                // So sánh với code trước
                if (d.code.toString() === district) return true;
                
                // Chuẩn hóa tên quận/huyện để so sánh
                const normalizedName = normalizeVietnameseName(d.name);
                return normalizedName === normalizedDistrict;
              });
              
              if (foundDistrict) {
                console.log('Found district in API:', foundDistrict.name, foundDistrict.code, 'in province:', province.name);
                
                const timestamp = new Date().getTime();
                const wardResponse = await axios.get(
                  `${PROVINCES_API_URL}/d/${foundDistrict.code}?depth=2&_t=${timestamp}`
                );
                
                if (wardResponse.data && wardResponse.data.wards) {
                  // Format lại dữ liệu để phù hợp với frontend
                  const wards = wardResponse.data.wards.map((ward: any) => ({
                    id: ward.code.toString(),
                    name: ward.name,
                    division_type: ward.division_type
                  }));
                  
                  console.log('Loaded wards from API:', wards.length);
                  console.log('First 3 wards:', wards.slice(0, 3).map((w: any) => w.name));
                  
                  return {
                    success: true,
                    data: wards
                  };
                } else {
                  console.warn('Ward data structure is unexpected:', wardResponse.data);
                }
              }
              
              // Thử tìm một cách khác: phương pháp mới thử tìm theo một phần của tên
              if (searchedProvinces >= provincesResponse.data.length * 0.5) { // Chỉ thử cách này sau khi đã tìm 50% tỉnh
                const possibleMatches = districtResponse.data.districts.filter((d: any) => {
                  const normalizedName = normalizeVietnameseName(d.name);
                  return normalizedName.includes(normalizedDistrict) || 
                         normalizedDistrict.includes(normalizedName);
                });
                
                if (possibleMatches.length > 0) {
                  console.log('Found possible district matches in', province.name, ':', 
                    possibleMatches.map((d: any) => `${d.name} (${d.code})`));
                  
                  // Sử dụng kết quả đầu tiên
                  const bestMatch = possibleMatches[0];
                  console.log('Using best district match:', bestMatch.name, bestMatch.code);
                  
                  const timestamp = new Date().getTime();
                  const wardResponse = await axios.get(
                    `${PROVINCES_API_URL}/d/${bestMatch.code}?depth=2&_t=${timestamp}`
                  );
                  
                  if (wardResponse.data && wardResponse.data.wards) {
                    const wards = wardResponse.data.wards.map((ward: any) => ({
                      id: ward.code.toString(),
                      name: ward.name,
                      division_type: ward.division_type
                    }));
                    
                    console.log('Loaded wards from best match:', wards.length);
                    
                    return {
                      success: true,
                      data: wards
                    };
                  }
                }
              }
            }
          } catch (districtError: unknown) {
            // Nếu lỗi với tỉnh này, tiếp tục với tỉnh khác
            const errorMessage = districtError instanceof Error ? districtError.message : 'Unknown error';
            console.warn(`Error checking province ${province.name}:`, errorMessage);
            continue;
          }
        }
        console.log('District not found in any province, district value:', district);
      }
    } catch (openApiError: unknown) {
      const errorMessage = openApiError instanceof Error ? openApiError.message : 'Unknown error';
      console.error('Lỗi khi lấy phường/xã từ provinces.open-api.vn:', errorMessage);
      // Nếu lỗi, tiếp tục thử với API local
    }

    // Nếu API provinces.open-api.vn không hoạt động, sử dụng API local
    console.log('Falling back to local API for wards');
    const timestamp = new Date().getTime();
    const response = await axios.get(
      `${API_URL}/locations/wards/${encodeURIComponent(district)}?_t=${timestamp}`
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Error in getWardsByDistrict:', error);
    if (error instanceof Error && 'response' in error && error.response) {
      return (error as any).response.data;
    }
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Alias cho các hàm để tương thích ngược
export const getDistricts = getDistrictsByCity;
export const getWards = getWardsByDistrict;

// Tìm kiếm địa điểm
export const searchLocations = async (keyword: string) => {
  try {
    const response = await axios.get(`${API_URL}/locations/search`, {
      params: { keyword }
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error && 'response' in error && error.response) {
      return (error as any).response.data;
    }
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Lấy thông tin địa điểm theo tọa độ
export const getLocationByCoordinates = async (latitude: number, longitude: number) => {
  try {
    const response = await axios.get(`${API_URL}/locations/coordinates`, {
      params: { latitude, longitude }
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error && 'response' in error && error.response) {
      return (error as any).response.data;
    }
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get location names from ids
export const getLocationNames = async (
  cityId?: string | null, 
  districtId?: string | null, 
  wardId?: string | null
): Promise<LocationResponse> => {
  try {
    console.log('Getting location names for:', { cityId, districtId, wardId });
    const params: Record<string, string> = {};
    
    if (cityId) params.cityId = cityId.toString();
    if (districtId) params.districtId = districtId.toString();
    if (wardId) params.wardId = wardId.toString();
    
    // Skip API call if no IDs provided
    if (Object.keys(params).length === 0) {
      return { success: false, message: 'No location IDs provided' };
    }
    
    // Build query string
    const queryString = new URLSearchParams(params).toString();
    
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const response = await axios.get(`${API_URL}/locations/names?${queryString}&_t=${timestamp}`);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error && 'response' in error && error.response) {
      return (error as any).response.data;
    }
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error',
      data: {
        city_name: cityId || '',
        district_name: districtId || '',
        ward_name: wardId || ''
      }
    };
  }
};

export default {
  getCities,
  getDistricts,
  getWards,
  getLocationNames,
  searchLocations,
  getLocationByCoordinates
}; 