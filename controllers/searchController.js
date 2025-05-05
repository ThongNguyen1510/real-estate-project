const { sql } = require('../config/database');
const { client, GOOGLE_MAPS_API_KEY } = require('../config/googleMaps');

// Tìm kiếm theo bản đồ (vị trí)
const searchByMap = async (req, res) => {
    try {
        const {
            lat,
            lng,
            radius = 5, // Mặc định 5km
            price_min,
            price_max,
            property_type,
            amenities,
            bedrooms,
            bathrooms,
            area_min,
            area_max,
            sort_by = 'created_at',
            sort_order = 'desc',
            page = 1,
            limit = 10
        } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin vĩ độ hoặc kinh độ'
            });
        }

        // Tính toán khoảng cách và lọc theo bán kính
        const offset = (page - 1) * limit;
        let query = `
            SELECT 
                p.*,
                p.primary_image_url as thumbnail,
                (6371 * acos(
                    cos(radians(${lat})) * 
                    cos(radians(CAST(p.latitude AS FLOAT))) * 
                    cos(radians(CAST(p.longitude AS FLOAT)) - radians(${lng})) + 
                    sin(radians(${lat})) * 
                    sin(radians(CAST(p.latitude AS FLOAT)))
                )) AS distance
            FROM Properties p
            WHERE (6371 * acos(
                cos(radians(${lat})) * 
                cos(radians(CAST(p.latitude AS FLOAT))) * 
                cos(radians(CAST(p.longitude AS FLOAT)) - radians(${lng})) + 
                sin(radians(${lat})) * 
                sin(radians(CAST(p.latitude AS FLOAT)))
            )) <= ${radius}
        `;

        // Thêm các điều kiện lọc
        const conditions = [];
        const params = [];

        if (price_min) {
            conditions.push('p.price >= @price_min');
            params.push({ name: 'price_min', value: price_min });
        }

        if (price_max) {
            conditions.push('p.price <= @price_max');
            params.push({ name: 'price_max', value: price_max });
        }

        if (property_type) {
            conditions.push('p.property_type = @property_type');
            params.push({ name: 'property_type', value: property_type });
        }

        if (bedrooms) {
            conditions.push('p.bedrooms = @bedrooms');
            params.push({ name: 'bedrooms', value: bedrooms });
        }

        if (bathrooms) {
            conditions.push('p.bathrooms = @bathrooms');
            params.push({ name: 'bathrooms', value: bathrooms });
        }

        if (area_min) {
            conditions.push('p.area >= @area_min');
            params.push({ name: 'area_min', value: area_min });
        }

        if (area_max) {
            conditions.push('p.area <= @area_max');
            params.push({ name: 'area_max', value: area_max });
        }

        if (amenities) {
            const amenityList = amenities.split(',');
            const amenityConditions = amenityList.map(amenity => 
                `p.amenities LIKE '%${amenity}%'`
            );
            conditions.push(`(${amenityConditions.join(' OR ')})`);
        }

        if (conditions.length > 0) {
            query += ' AND ' + conditions.join(' AND ');
        }

        // Thêm sắp xếp và phân trang
        query += ` ORDER BY ${sort_by} ${sort_order}
                  OFFSET ${offset} ROWS
                  FETCH NEXT ${limit} ROWS ONLY`;

        // Thực hiện truy vấn
        const request = new sql.Request();
        params.forEach(param => {
            request.input(param.name, param.value);
        });

        const result = await request.query(query);

        // Process result to parse images JSON if needed
        const properties = result.recordset.map(property => {
            let imageArray = [];
            
            // Parse images JSON field
            if (property.images) {
                try {
                    imageArray = JSON.parse(property.images);
                } catch (error) {
                    console.error('Error parsing images JSON:', error);
                }
            }
            
            return {
                ...property,
                images: imageArray,
                // Use thumbnail (primary_image_url) or first image from array or default
                thumbnail: property.thumbnail || 
                    (imageArray.length > 0 ? imageArray[0] : 
                    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1000&auto=format&fit=crop')
            };
        });

        // Đếm tổng số kết quả
        const countQuery = `
            SELECT COUNT(*) as total
            FROM Properties p
            WHERE (6371 * acos(
                cos(radians(${lat})) * 
                cos(radians(CAST(p.latitude AS FLOAT))) * 
                cos(radians(CAST(p.longitude AS FLOAT)) - radians(${lng})) + 
                sin(radians(${lat})) * 
                sin(radians(CAST(p.latitude AS FLOAT)))
            )) <= ${radius}
            ${conditions.length > 0 ? 'AND ' + conditions.join(' AND ') : ''}
        `;

        const countResult = await request.query(countQuery);
        const total = countResult.recordset[0].total;

        res.json({
            success: true,
            data: properties,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                total_pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Lỗi tìm kiếm theo bản đồ:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Tìm kiếm theo khu vực
const searchByArea = async (req, res) => {
    try {
        const {
            province,
            district,
            ward,
            price_min,
            price_max,
            property_type,
            amenities,
            bedrooms,
            bathrooms,
            area_min,
            area_max,
            sort_by = 'created_at',
            sort_order = 'desc',
            page = 1,
            limit = 10
        } = req.query;

        if (!province) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin tỉnh/thành phố'
            });
        }

        const offset = (page - 1) * limit;
        let query = `
            SELECT 
                p.*,
                p.primary_image_url as thumbnail
            FROM Properties p
            WHERE p.province = @province
        `;

        const params = [
            { name: 'province', value: province }
        ];

        if (district) {
            query += ' AND p.district = @district';
            params.push({ name: 'district', value: district });
        }

        if (ward) {
            query += ' AND p.ward = @ward';
            params.push({ name: 'ward', value: ward });
        }

        if (price_min) {
            query += ' AND p.price >= @price_min';
            params.push({ name: 'price_min', value: price_min });
        }

        if (price_max) {
            query += ' AND p.price <= @price_max';
            params.push({ name: 'price_max', value: price_max });
        }

        if (property_type) {
            query += ' AND p.property_type = @property_type';
            params.push({ name: 'property_type', value: property_type });
        }

        if (bedrooms) {
            query += ' AND p.bedrooms = @bedrooms';
            params.push({ name: 'bedrooms', value: bedrooms });
        }

        if (bathrooms) {
            query += ' AND p.bathrooms = @bathrooms';
            params.push({ name: 'bathrooms', value: bathrooms });
        }

        if (area_min) {
            query += ' AND p.area >= @area_min';
            params.push({ name: 'area_min', value: area_min });
        }

        if (area_max) {
            query += ' AND p.area <= @area_max';
            params.push({ name: 'area_max', value: area_max });
        }

        if (amenities) {
            const amenityList = amenities.split(',');
            const amenityConditions = amenityList.map(amenity => 
                `p.amenities LIKE '%${amenity}%'`
            );
            query += ` AND (${amenityConditions.join(' OR ')})`;
        }

        // Thêm sắp xếp và phân trang
        query += ` ORDER BY ${sort_by} ${sort_order}
                  OFFSET ${offset} ROWS
                  FETCH NEXT ${limit} ROWS ONLY`;

        // Thực hiện truy vấn
        const request = new sql.Request();
        params.forEach(param => {
            request.input(param.name, param.value);
        });

        const result = await request.query(query);

        // Process result to parse images JSON if needed
        const properties = result.recordset.map(property => {
            let imageArray = [];
            
            // Parse images JSON field
            if (property.images) {
                try {
                    imageArray = JSON.parse(property.images);
                } catch (error) {
                    console.error('Error parsing images JSON:', error);
                }
            }
            
            return {
                ...property,
                images: imageArray,
                // Use thumbnail (primary_image_url) or first image from array or default
                thumbnail: property.thumbnail || 
                    (imageArray.length > 0 ? imageArray[0] : 
                    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1000&auto=format&fit=crop')
            };
        });

        // Đếm tổng số kết quả
        let countQuery = `
            SELECT COUNT(*) as total
            FROM Properties p
            WHERE p.province = @province
        `;

        if (district) countQuery += ' AND p.district = @district';
        if (ward) countQuery += ' AND p.ward = @ward';
        if (price_min) countQuery += ' AND p.price >= @price_min';
        if (price_max) countQuery += ' AND p.price <= @price_max';
        if (property_type) countQuery += ' AND p.property_type = @property_type';
        if (bedrooms) countQuery += ' AND p.bedrooms = @bedrooms';
        if (bathrooms) countQuery += ' AND p.bathrooms = @bathrooms';
        if (area_min) countQuery += ' AND p.area >= @area_min';
        if (area_max) countQuery += ' AND p.area <= @area_max';
        if (amenities) {
            const amenityList = amenities.split(',');
            const amenityConditions = amenityList.map(amenity => 
                `p.amenities LIKE '%${amenity}%'`
            );
            countQuery += ` AND (${amenityConditions.join(' OR ')})`;
        }

        const countResult = await request.query(countQuery);
        const total = countResult.recordset[0].total;

        res.json({
            success: true,
            data: properties,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                total_pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Lỗi tìm kiếm theo khu vực:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

module.exports = {
    searchByMap,
    searchByArea
};