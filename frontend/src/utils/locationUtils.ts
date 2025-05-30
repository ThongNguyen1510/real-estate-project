import axios from 'axios';

// Types
export interface Province {
  code: number;
  name: string;
  division_type: string;
  codename: string;
  phone_code: number;
  districts?: District[];
}

export interface District {
  code: number;
  name: string;
  division_type: string;
  codename: string;
  province_code: number;
  wards?: Ward[];
}

export interface Ward {
  code: number;
  name: string;
  division_type: string;
  codename: string;
  district_code: number;
}

// Constants
const PROVINCES_API_URL = 'https://provinces.open-api.vn/api';
const STORAGE_KEY_PROVINCES = 'vietnam_provinces_data';
const STORAGE_KEY_TIMESTAMP = 'vietnam_provinces_timestamp';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Function to fetch all provinces data with depth=2 (includes districts)
export const fetchAllProvinces = async (): Promise<Province[]> => {
  try {
    // Check if we have cached data and if it's still valid
    const cachedData = localStorage.getItem(STORAGE_KEY_PROVINCES);
    const cachedTimestamp = localStorage.getItem(STORAGE_KEY_TIMESTAMP);
    
    if (cachedData && cachedTimestamp) {
      const timestamp = parseInt(cachedTimestamp);
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        console.log('Using cached provinces data');
        return JSON.parse(cachedData);
      }
    }
    
    // Fetch fresh data
    console.log('Fetching fresh provinces data from API');
    const response = await axios.get(`${PROVINCES_API_URL}/?depth=2`);
    
    if (response.data && Array.isArray(response.data)) {
      // Store in cache
      localStorage.setItem(STORAGE_KEY_PROVINCES, JSON.stringify(response.data));
      localStorage.setItem(STORAGE_KEY_TIMESTAMP, Date.now().toString());
      return response.data;
    }
    
    throw new Error('Invalid response format from provinces API');
  } catch (error) {
    console.error('Error fetching provinces data:', error);
    // Return cached data as fallback if available
    const cachedData = localStorage.getItem(STORAGE_KEY_PROVINCES);
    if (cachedData) {
      console.log('Using cached provinces data as fallback');
      return JSON.parse(cachedData);
    }
    throw error;
  }
};

// Function to get districts for a province
export const getDistrictsForProvince = async (provinceCode: number): Promise<District[]> => {
  try {
    // Try to get from cached provinces first
    const cachedData = localStorage.getItem(STORAGE_KEY_PROVINCES);
    if (cachedData) {
      const provinces = JSON.parse(cachedData);
      const province = provinces.find((p: Province) => p.code === provinceCode);
      if (province && province.districts) {
        return province.districts;
      }
    }
    
    // Fetch direct from API if not available in cache
    const response = await axios.get(`${PROVINCES_API_URL}/p/${provinceCode}?depth=2`);
    if (response.data && response.data.districts) {
      return response.data.districts;
    }
    
    return [];
  } catch (error) {
    console.error(`Error getting districts for province ${provinceCode}:`, error);
    return [];
  }
};

// Function to get wards for a district
export const getWardsForDistrict = async (districtCode: number): Promise<Ward[]> => {
  try {
    // We don't store wards in the provinces cache, so fetch directly
    const response = await axios.get(`${PROVINCES_API_URL}/d/${districtCode}?depth=2`);
    if (response.data && response.data.wards) {
      return response.data.wards;
    }
    return [];
  } catch (error) {
    console.error(`Error getting wards for district ${districtCode}:`, error);
    return [];
  }
};

// Format code to string (consistent with existing application)
export const formatLocationCode = (code: number): string => code.toString(); 