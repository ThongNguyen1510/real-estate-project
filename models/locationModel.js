const { sql, connectToDatabase } = require('../config/database');

// Lấy danh sách thành phố
const getCities = async () => {
    try {
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
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('city', sql.NVarChar, city)
            .query(`
                SELECT DISTINCT 
                    district COLLATE Vietnamese_CI_AI as name,
                    district COLLATE Vietnamese_CI_AI as id
                FROM Locations
                WHERE city COLLATE Vietnamese_CI_AI = @city AND district IS NOT NULL
                ORDER BY district COLLATE Vietnamese_CI_AI
            `);

        return result.recordset;
    } catch (error) {
        console.error('Lỗi get districts:', error);
        throw error;
    }
};

// Lấy danh sách phường/xã theo quận/huyện
const getWards = async (district) => {
    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('district', sql.NVarChar, district)
            .query(`
                SELECT DISTINCT 
                    ward COLLATE Vietnamese_CI_AI as name,
                    ward COLLATE Vietnamese_CI_AI as id
                FROM Locations
                WHERE district COLLATE Vietnamese_CI_AI = @district AND ward IS NOT NULL
                ORDER BY ward COLLATE Vietnamese_CI_AI
            `);

        return result.recordset;
    } catch (error) {
        console.error('Lỗi get wards:', error);
        throw error;
    }
};

// Tìm kiếm địa điểm
const searchLocations = async (keyword) => {
    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('keyword', sql.NVarChar, `%${keyword}%`)
            .query(`
                SELECT 
                    id,
                    address COLLATE Vietnamese_CI_AI as address,
                    city COLLATE Vietnamese_CI_AI as city,
                    district COLLATE Vietnamese_CI_AI as district,
                    ward COLLATE Vietnamese_CI_AI as ward,
                    street COLLATE Vietnamese_CI_AI as street,
                    latitude,
                    longitude
                FROM Locations
                WHERE address COLLATE Vietnamese_CI_AI LIKE @keyword
                    OR city COLLATE Vietnamese_CI_AI LIKE @keyword
                    OR district COLLATE Vietnamese_CI_AI LIKE @keyword
                    OR ward COLLATE Vietnamese_CI_AI LIKE @keyword
                    OR street COLLATE Vietnamese_CI_AI LIKE @keyword
                ORDER BY city COLLATE Vietnamese_CI_AI, 
                         district COLLATE Vietnamese_CI_AI, 
                         ward COLLATE Vietnamese_CI_AI, 
                         street COLLATE Vietnamese_CI_AI
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
                    address COLLATE Vietnamese_CI_AI as address,
                    city COLLATE Vietnamese_CI_AI as city,
                    district COLLATE Vietnamese_CI_AI as district,
                    ward COLLATE Vietnamese_CI_AI as ward,
                    street COLLATE Vietnamese_CI_AI as street,
                    latitude,
                    longitude
                FROM Locations
                WHERE id = @id
            `);

        if (result.recordset.length === 0) {
            return null;
        }

        return result.recordset[0];
    } catch (error) {
        console.error('Lỗi get location detail:', error);
        throw error;
    }
};

module.exports = {
    getCities,
    getDistricts,
    getWards,
    searchLocations,
    getLocationDetail
}; 