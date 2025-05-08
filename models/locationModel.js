const { sql, connectToDatabase } = require('../config/database');
const axios = require('axios');

const API_BASE_URL = 'https://provinces.open-api.vn/api';

// Lấy danh sách từ API provinces.open-api.vn
const getProvincesFromApi = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/`);
        return response.data.map(province => ({
            name: province.name,
            id: province.code,
            division_type: province.division_type
        }));
    } catch (error) {
        console.error('Lỗi khi lấy danh sách tỉnh/thành từ API:', error);
        throw error;
    }
};

// Lấy quận/huyện theo mã tỉnh từ API
const getDistrictsByProvinceFromApi = async (provinceCode) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/p/${provinceCode}?depth=2`);
        return response.data.districts.map(district => ({
            name: district.name,
            id: district.code,
            division_type: district.division_type
        }));
    } catch (error) {
        console.error('Lỗi khi lấy danh sách quận/huyện từ API:', error);
        throw error;
    }
};

// Lấy phường/xã theo mã quận/huyện từ API
const getWardsByDistrictFromApi = async (districtCode) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/d/${districtCode}?depth=2`);
        return response.data.wards.map(ward => ({
            name: ward.name,
            id: ward.code,
            division_type: ward.division_type
        }));
    } catch (error) {
        console.error('Lỗi khi lấy danh sách phường/xã từ API:', error);
        throw error;
    }
};

// Lấy danh sách thành phố
const getCities = async () => {
    try {
        // Thử sử dụng API provinces.open-api.vn trước
        try {
            const provinces = await getProvincesFromApi();
            if (provinces && provinces.length > 0) {
                return provinces;
            }
        } catch (apiError) {
            console.error('Lỗi từ API provinces, sử dụng database:', apiError);
        }

        // Nếu API thất bại, sử dụng database
        const pool = await connectToDatabase();
        const result = await pool.request()
            .query(`
                SELECT DISTINCT 
                    city COLLATE Vietnamese_CI_AI as name,
                    city COLLATE Vietnamese_CI_AI as id
                FROM Locations
                WHERE city IS NOT NULL
                ORDER BY city COLLATE Vietnamese_CI_AI
            `);

        return result.recordset;
    } catch (error) {
        console.error('Lỗi get cities:', error);
        throw error;
    }
};

// Lấy danh sách quận/huyện theo thành phố
const getDistricts = async (city) => {
    try {
        console.log('Model: Getting districts for city input:', city);
        
        // Kiểm tra xem city có phải là mã số tỉnh không
        const isNumericCode = !isNaN(Number(city));
        
        // Thử lấy trực tiếp từ API nếu city là mã tỉnh
        if (isNumericCode) {
            try {
                console.log('Using direct API lookup with province code:', city);
                const provinceCode = Number(city);
                const response = await axios.get(`${API_BASE_URL}/p/${provinceCode}?depth=2`);
                
                if (response.data && response.data.districts) {
                    const districts = response.data.districts.map(district => ({
                        name: district.name,
                        id: district.code,
                        division_type: district.division_type
                    }));
                    console.log(`Found ${districts.length} districts via direct API lookup`);
                    return districts;
                }
            } catch (directApiError) {
                console.error('Direct district lookup with province code failed:', directApiError.message);
                // Tiếp tục với các phương pháp khác nếu lookup trực tiếp thất bại
            }
        }

        // Tìm mã tỉnh từ provinces API
        try {
            const provinces = await getProvincesFromApi();
            const province = provinces.find(p => p.name === city);
            
            if (province) {
                const districts = await getDistrictsByProvinceFromApi(province.id);
                if (districts && districts.length > 0) {
                    return districts;
                }
            }
        } catch (apiError) {
            console.error('Lỗi từ API provinces khi lấy districts, sử dụng database:', apiError);
        }

        // Nếu API thất bại, sử dụng database với truy vấn đã sửa
        console.log('Falling back to database query for districts');
        const pool = await connectToDatabase();
        
        if (isNumericCode) {
            // For numeric codes, database lookup is not supported
            console.log('Warning: Database lookup not supported for province codes');
            return [];
        }
        
        const result = await pool.request()
            .input('city', sql.NVarChar, city)
            .query(`
                SELECT DISTINCT 
                    district COLLATE Vietnamese_CI_AI as name,
                    district COLLATE Vietnamese_CI_AI as id,
                    CASE 
                        WHEN district LIKE N'Quận %' THEN 1
                        WHEN district LIKE N'Thành phố %' THEN 2
                        WHEN district LIKE N'Huyện %' THEN 3
                        ELSE 4
                    END as district_type,
                    CASE
                        WHEN ISNUMERIC(SUBSTRING(district, 6, 2)) = 1 THEN CAST(SUBSTRING(district, 6, 2) AS INT)
                        ELSE 99
                    END as district_number
                FROM Locations
                WHERE city COLLATE Vietnamese_CI_AI = @city AND district IS NOT NULL
                ORDER BY 
                    district_type,
                    district_number,
                    name
            `);

        return result.recordset.map(record => ({
            name: record.name,
            id: record.id
        }));
    } catch (error) {
        console.error('Lỗi get districts:', error);
        throw error;
    }
};

// Lấy danh sách phường/xã theo quận/huyện
const getWards = async (district) => {
    try {
        console.log('Model: Getting wards for district input:', district);
        
        // Kiểm tra xem district có phải là mã số quận/huyện không
        const isNumericCode = !isNaN(Number(district));
        
        // Thử lấy trực tiếp từ API nếu district là mã quận/huyện
        if (isNumericCode) {
            try {
                console.log('Using direct API lookup with district code:', district);
                const districtCode = Number(district);
                const response = await axios.get(`${API_BASE_URL}/d/${districtCode}?depth=2`);
                
                if (response.data && response.data.wards) {
                    const wards = response.data.wards.map(ward => ({
                        name: ward.name,
                        id: ward.code,
                        division_type: ward.division_type
                    }));
                    console.log(`Found ${wards.length} wards via direct API lookup`);
                    return wards;
                }
            } catch (directApiError) {
                console.error('Direct ward lookup with district code failed:', directApiError.message);
                // Tiếp tục với các phương pháp khác nếu lookup trực tiếp thất bại
            }
        }
        
        // Tìm mã quận/huyện từ API
        try {
            const allProvinces = await getProvincesFromApi();
            
            for (const province of allProvinces) {
                try {
                    const districts = await getDistrictsByProvinceFromApi(province.id);
                    const foundDistrict = districts.find(d => d.name === district);
                    
                    if (foundDistrict) {
                        const wards = await getWardsByDistrictFromApi(foundDistrict.id);
                        if (wards && wards.length > 0) {
                            return wards;
                        }
                        break;
                    }
                } catch (districtError) {
                    continue;
                }
            }
        } catch (apiError) {
            console.error('Lỗi từ API provinces khi lấy wards, sử dụng database:', apiError);
        }

        // Nếu API thất bại, sử dụng database với truy vấn đã sửa
        console.log('Falling back to database query for wards');
        const pool = await connectToDatabase();
        
        // Adjust the query based on whether input is a numeric code or name
        let query;
        const request = pool.request();
        
        if (isNumericCode) {
            // For numeric codes, we need a different approach since the database doesn't store district codes
            // This will return an empty array as a fallback, since we don't have a code-to-name mapping in the database
            console.log('Warning: Database lookup not supported for district codes');
            return [];
        } else {
            query = `
                SELECT DISTINCT 
                    ward COLLATE Vietnamese_CI_AI as name,
                    ward COLLATE Vietnamese_CI_AI as id,
                    CASE 
                        WHEN ward LIKE N'Phường %' THEN 1
                        WHEN ward LIKE N'Thị trấn %' THEN 2
                        WHEN ward LIKE N'Xã %' THEN 3
                        ELSE 4
                    END as ward_type,
                    CASE
                        WHEN ISNUMERIC(SUBSTRING(ward, 8, 2)) = 1 THEN CAST(SUBSTRING(ward, 8, 2) AS INT)
                        ELSE 99
                    END as ward_number
                FROM Locations
                WHERE district COLLATE Vietnamese_CI_AI = @district AND ward IS NOT NULL
                ORDER BY
                    ward_type,
                    ward_number,
                    name
            `;
            request.input('district', sql.NVarChar, district);
        }
        
        const result = await request.query(query);

        return result.recordset.map(record => ({
            name: record.name,
            id: record.id
        }));
    } catch (error) {
        console.error('Lỗi get wards:', error);
        throw error;
    }
};

// Tìm kiếm địa điểm
const searchLocations = async (keyword) => {
    try {
        // Thử tìm kiếm từ API trước
        try {
            const response = await axios.get(`${API_BASE_URL}/search/?q=${encodeURIComponent(keyword)}`);
            const results = response.data.map(location => ({
                name: location.name,
                id: location.code,
                matches: location.matches,
                score: location.score
            }));
            
            if (results && results.length > 0) {
                return results;
            }
        } catch (apiError) {
            console.error('Lỗi từ API provinces khi tìm kiếm, sử dụng database:', apiError);
        }

        // Thực hiện tìm kiếm từ database
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('keyword', sql.NVarChar, `%${keyword}%`)
            .query(`
                SELECT TOP 20
                    city as name,
                    'city' as type,
                    city as id
                FROM Locations
                WHERE city LIKE @keyword AND city IS NOT NULL
                GROUP BY city
                
                UNION ALL
                
                SELECT TOP 20
                    district as name,
                    'district' as type,
                    district as id
                FROM Locations
                WHERE district LIKE @keyword AND district IS NOT NULL
                GROUP BY district
                
                UNION ALL
                
                SELECT TOP 20
                    ward as name,
                    'ward' as type,
                    ward as id
                FROM Locations
                WHERE ward LIKE @keyword AND ward IS NOT NULL
                GROUP BY ward
            `);

        return result.recordset;
    } catch (error) {
        console.error('Lỗi search locations:', error);
        throw error;
    }
};

// Lấy thông tin chi tiết địa điểm
const getLocationDetail = async (id) => {
    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT 
                    id,
                    city,
                    district,
                    ward,
                    street,
                    address_number
                FROM Locations
                WHERE id = @id
            `);

        return result.recordset[0];
    } catch (error) {
        console.error('Lỗi get location detail:', error);
        throw error;
    }
};

// Lấy tên địa điểm từ ID
const getLocationNames = async (cityId, districtId, wardId) => {
    try {
        console.log('Getting location names for IDs:', { cityId, districtId, wardId });
        const result = {
            city_name: '',
            district_name: '',
            ward_name: ''
        };

        // Get city name if cityId is provided
        if (cityId) {
            try {
                // Try from API first
                const provinces = await getProvincesFromApi();
                const province = provinces.find(p => p.id.toString() === cityId.toString());
                
                if (province) {
                    result.city_name = province.name;
                } else {
                    // Fallback to database
                    const pool = await connectToDatabase();
                    const cityResult = await pool.request()
                        .input('cityId', sql.NVarChar, cityId)
                        .query(`
                            SELECT DISTINCT 
                                city COLLATE Vietnamese_CI_AI as name
                            FROM Locations
                            WHERE city COLLATE Vietnamese_CI_AI = @cityId
                        `);
                    
                    if (cityResult.recordset.length > 0) {
                        result.city_name = cityResult.recordset[0].name;
                    } else {
                        result.city_name = cityId; // Fallback to ID
                    }
                }
            } catch (error) {
                console.error('Error getting city name:', error);
                result.city_name = cityId; // Fallback to ID
            }
        }

        // Get district name if districtId is provided
        if (districtId) {
            try {
                // If we have a city ID, try to get districts from that city first
                if (cityId && result.city_name) {
                    try {
                        const districts = await getDistricts(cityId);
                        const district = districts.find(d => d.id.toString() === districtId.toString());
                        
                        if (district) {
                            result.district_name = district.name;
                        }
                    } catch (error) {
                        console.error('Error getting district from city:', error);
                        // Continue with other methods
                    }
                }
                
                // If we still don't have the district name, try the API
                if (!result.district_name) {
                    // Try from all provinces
                    const provinces = await getProvincesFromApi();
                    
                    for (const province of provinces) {
                        try {
                            const districts = await getDistrictsByProvinceFromApi(province.id);
                            const district = districts.find(d => d.id.toString() === districtId.toString());
                            
                            if (district) {
                                result.district_name = district.name;
                                break;
                            }
                        } catch (error) {
                            continue;
                        }
                    }
                }
                
                // If still no result, try database
                if (!result.district_name) {
                    const pool = await connectToDatabase();
                    const districtResult = await pool.request()
                        .input('districtId', sql.NVarChar, districtId)
                        .query(`
                            SELECT DISTINCT 
                                district COLLATE Vietnamese_CI_AI as name
                            FROM Locations
                            WHERE district COLLATE Vietnamese_CI_AI = @districtId
                        `);
                    
                    if (districtResult.recordset.length > 0) {
                        result.district_name = districtResult.recordset[0].name;
                    } else {
                        result.district_name = districtId; // Fallback to ID
                    }
                }
            } catch (error) {
                console.error('Error getting district name:', error);
                result.district_name = districtId; // Fallback to ID
            }
        }

        // Get ward name if wardId is provided
        if (wardId) {
            try {
                // If we have a district ID, try to get wards from that district first
                if (districtId) {
                    try {
                        const wards = await getWards(districtId);
                        const ward = wards.find(w => w.id.toString() === wardId.toString());
                        
                        if (ward) {
                            result.ward_name = ward.name;
                        }
                    } catch (error) {
                        console.error('Error getting ward from district:', error);
                        // Continue with other methods
                    }
                }
                
                // If we still don't have the ward name, try the database
                if (!result.ward_name) {
                    const pool = await connectToDatabase();
                    const wardResult = await pool.request()
                        .input('wardId', sql.NVarChar, wardId)
                        .query(`
                            SELECT DISTINCT 
                                ward COLLATE Vietnamese_CI_AI as name
                            FROM Locations
                            WHERE ward COLLATE Vietnamese_CI_AI = @wardId
                        `);
                    
                    if (wardResult.recordset.length > 0) {
                        result.ward_name = wardResult.recordset[0].name;
                    } else {
                        result.ward_name = wardId; // Fallback to ID
                    }
                }
            } catch (error) {
                console.error('Error getting ward name:', error);
                result.ward_name = wardId; // Fallback to ID
            }
        }

        return result;
    } catch (error) {
        console.error('Error in getLocationNames:', error);
        return {
            city_name: cityId || '',
            district_name: districtId || '',
            ward_name: wardId || ''
        };
    }
};

module.exports = {
    getCities,
    getDistricts,
    getWards,
    getLocationNames,
    searchLocations,
    getLocationDetail
};