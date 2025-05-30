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
            limit = 10,
            include_expired = 'false'
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
            AND p.status = 'available'
        `;

        // Thêm các điều kiện lọc
        const conditions = [];
        const params = [];
        
        // Filter out expired properties unless explicitly requested
        if (include_expired !== 'true') {
            conditions.push('(p.expires_at IS NULL OR p.expires_at > @currentDate)');
            params.push({ name: 'currentDate', value: new Date() });
            console.log('Filtering out expired properties');
        }

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

        // Thêm SQL debug để xem toàn bộ city_name trong database
        if (city_name) {
            console.log('Checking all city_name values in database...');
            const debugQuery = `SELECT DISTINCT l.city_name FROM Locations l`;
            const debugResult = await request.query(debugQuery);
            console.log('All city_name values in DB:', debugResult.recordset.map(r => r.city_name));
        }

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
            AND p.status = 'available'
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
            city,
            city_name,
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
            limit = 10,
            include_expired = 'false'
        } = req.query;

        if (!province && !city && !city_name) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin tỉnh/thành phố'
            });
        }

        console.log('Searching by area with params:', { 
            province, 
            city, 
            city_name, 
            district, 
            ward 
        });

        const offset = (page - 1) * limit;
        
        // Xây dựng truy vấn SQL linh hoạt để hỗ trợ cả mã tỉnh và tên tỉnh
        let query = `
            SELECT 
                p.*,
                p.primary_image_url as thumbnail,
                l.city, l.district, l.ward, l.city_name, l.district_name, l.ward_name
            FROM Properties p
            LEFT JOIN Locations l ON p.location_id = l.id
            WHERE p.status = 'available'
        `;

        const params = [];

        // Filter out expired properties unless explicitly requested
        if (include_expired !== 'true') {
            query += ' AND (p.expires_at IS NULL OR p.expires_at > @currentDate)';
            params.push({ name: 'currentDate', value: new Date() });
            console.log('Filtering out expired properties');
        }

        // Chuyển đổi city ID: 1 = Hà Nội, 79 = TP.HCM
        // Các ID khác cần map tương ứng nếu cần
        let cityName = null;
        if (city === '1') {
            cityName = 'Hà Nội';
            console.log('Detected search for Hanoi (city=1)');
        } else if (city === '79') {
            cityName = 'Hồ Chí Minh';
            console.log('Detected search for HCMC (city=79)');
        }

        // Thêm điều kiện tìm kiếm theo tỉnh/thành phố (hỗ trợ cả ID và tên)
        if (province || city || city_name || cityName) {
            let locationConditions = [];
            
            if (province) {
                // Tìm kiếm chính xác theo mã tỉnh
                locationConditions.push('l.city = @province');
                params.push({ name: 'province', value: province });
                console.log('Searching by province ID:', province);
            }
            
            if (cityName) {
                // Tìm kiếm chính xác theo tên thành phố được map từ ID
                locationConditions.push("l.city_name LIKE @city_name_mapped");
                params.push({ name: 'city_name_mapped', value: `%${cityName}%` });
                console.log('Searching by city name pattern:', cityName);
            } else if (city_name) {
                // Tìm kiếm chính xác theo tên thành phố từ tham số
                locationConditions.push("l.city_name LIKE @city_name_param");
                params.push({ name: 'city_name_param', value: `%${city_name}%` });
                console.log('Searching by city name pattern:', city_name);
                console.log('SQL condition will be: l.city_name LIKE @city_name_param with value:', `%${city_name}%`);
            }
            
            if (locationConditions.length > 0) {
                // Sử dụng OR để tìm kiếm kết quả khớp với bất kỳ điều kiện nào
                query += ` AND (${locationConditions.join(' OR ')})`;
            }
        }

        if (district) {
            query += ' AND l.district = @district';
            params.push({ name: 'district', value: district });
        }

        if (ward) {
            query += ' AND l.ward = @ward';
            params.push({ name: 'ward', value: ward });
        }

        // Thêm các điều kiện lọc khác
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

        // Debug truy vấn SQL
        console.log('Search SQL query:', query);
        console.log('Search parameters:', params);

        // Thực hiện truy vấn
        const request = new sql.Request();
        params.forEach(param => {
            request.input(param.name, param.value);
        });

        // Thêm SQL debug để xem toàn bộ city_name trong database
        if (city_name) {
            console.log('Checking all city_name values in database...');
            const debugQuery = `SELECT DISTINCT l.city_name FROM Locations l`;
            const debugResult = await request.query(debugQuery);
            console.log('All city_name values in DB:', debugResult.recordset.map(r => r.city_name));
        }

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

        // Đếm tổng số kết quả - xây dựng lại truy vấn đếm tương tự truy vấn chính
        let countQuery = `
            SELECT COUNT(*) as total
            FROM Properties p
            LEFT JOIN Locations l ON p.location_id = l.id
            WHERE p.status = 'available'
        `;

        // Filter out expired properties unless explicitly requested
        if (include_expired !== 'true') {
            countQuery += ' AND (p.expires_at IS NULL OR p.expires_at > @currentDate)';
        }
        
        // Áp dụng các điều kiện tương tự
        if (province || city || city_name || cityName) {
            let locationConditions = [];
            
            if (province) {
                locationConditions.push('l.city = @province');
            }
            
            if (cityName) {
                locationConditions.push("l.city_name LIKE @city_name_mapped");
            } else if (city_name) {
                locationConditions.push("l.city_name LIKE @city_name_param");
            }
            
            if (locationConditions.length > 0) {
                countQuery += ` AND (${locationConditions.join(' OR ')})`;
            }
        }

        if (district) countQuery += ' AND l.district = @district';
        if (ward) countQuery += ' AND l.ward = @ward';
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

        console.log('Count SQL query:', countQuery);

        const countResult = await request.query(countQuery);
        const total = countResult.recordset[0].total;

        // Log kết quả
        console.log(`Search results: Found ${properties.length} properties out of ${total} total`);
        console.log(`Search results: Found ${properties.length} properties for city_name=${city_name || 'not specified'}`);
        console.log('First property city_name (if any):', properties.length > 0 ? properties[0].city_name : 'none');

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

const searchProperties = async (req, res) => {
    // Lấy tham số tìm kiếm từ query params
    const {
        keyword,
        property_type,
        listing_type,
        bedrooms,
        bathrooms,
        price_min,
        price_max,
        area_min,
        area_max,
        amenities,
        status = 'available',
        sort_by = 'p.created_at',
        sort_order = 'DESC',
        page = 1,
        limit = 10,
        province,
        city,
        city_name,
        district,
        ward,
        include_expired = 'false'
    } = req.query;

    // Debug log cho tham số city_name
    console.log('Search API - URL as received:', req.url);
    console.log('Search API - All query params:', req.query);
    console.log('Search API - city_name parameter (raw):', city_name);
    
    // Giá trị để biết có tìm thấy kết quả hay không, để quyết định trả về tất cả hay trả về trống
    let usingCityFilter = false;
    
    // Decode the city_name if it exists 
    let decodedCityName = city_name;
    if (city_name) {
        usingCityFilter = true;
        try {
            decodedCityName = decodeURIComponent(city_name);
            console.log('Search API - Decoded city_name:', decodedCityName);
            
            // Debug the actual database values for city_name
            console.log('Will search for city_name that contains:', decodedCityName);
            
            // Nếu thành phố không đúng định dạng tiếng Việt, thử ánh xạ
            if (decodedCityName.toLowerCase() === 'hanoi' || decodedCityName.toLowerCase() === 'ha noi') {
                decodedCityName = 'Hà Nội';
                console.log('Mapped "hanoi" to "Hà Nội"');
            }
            else if (decodedCityName.toLowerCase() === 'ho chi minh' || decodedCityName.toLowerCase() === 'saigon') {
                decodedCityName = 'Hồ Chí Minh';
                console.log('Mapped "ho chi minh" to "Hồ Chí Minh"');
            }
        } catch (e) {
            console.error('Error decoding city_name:', e);
        }
    }

    try {
        // Tính offset dựa trên trang và giới hạn
        const offset = (page - 1) * limit;

        // Chuyển đổi city ID: 1 = Hà Nội, 79 = TP.HCM
        // Các ID khác cần map tương ứng nếu cần
        let cityName = null;
        if (city === '1') {
            cityName = 'Hà Nội';
            console.log('Detected search for Hanoi (city=1)');
        } else if (city === '79') {
            cityName = 'Hồ Chí Minh';
            console.log('Detected search for HCMC (city=79)');
        }

        // Tạo truy vấn cơ bản
        let query = `
            SELECT 
                p.*,
                p.primary_image_url as thumbnail,
                l.city, l.district, l.ward, l.city_name, l.district_name, l.ward_name
            FROM Properties p
            LEFT JOIN Locations l ON p.location_id = l.id
            WHERE 1=1
        `;

        const params = [];

        // Thêm điều kiện tìm kiếm theo loại BĐS
        if (listing_type) {
            query += ' AND p.listing_type = @listing_type';
            params.push({ name: 'listing_type', value: listing_type });
        }

        // Thêm điều kiện tìm kiếm theo trạng thái
        if (status) {
            query += ' AND p.status = @status';
            params.push({ name: 'status', value: status });
        }
        
        // Filter out expired properties unless explicitly requested
        if (include_expired !== 'true') {
            query += ' AND (p.expires_at IS NULL OR p.expires_at > @currentDate)';
            params.push({ name: 'currentDate', value: new Date() });
            console.log('Filtering out expired properties');
        }
        
        // Thêm điều kiện tìm kiếm theo tỉnh/thành phố (hỗ trợ cả ID và tên)
        if (province || city || decodedCityName || cityName) {
            let locationConditions = [];
            
            if (decodedCityName) {
                // Tìm chính xác theo tên
                // Chỉ lấy những bản ghi có city_name CHÍNH XÁC bằng giá trị tìm kiếm
                // hoặc city_name kết thúc bằng giá trị tìm kiếm (vì trong DB có thể lưu dạng "Thành phố X")
                query += " AND (l.city_name = @city_name_exact OR l.city_name LIKE @city_name_suffix)";
                params.push({ name: 'city_name_exact', value: decodedCityName });
                params.push({ name: 'city_name_suffix', value: `% ${decodedCityName}` });
                console.log('Filtering by exact city name:', decodedCityName);
                
                // Thêm log để debug
                console.log(`SQL condition: l.city_name = '${decodedCityName}' OR l.city_name LIKE '% ${decodedCityName}'`);
            }
            else if (cityName) {
                // Tìm theo tên thành phố được map từ ID 
                query += " AND (l.city_name = @city_name_mapped OR l.city_name LIKE @city_name_mapped_suffix)";
                params.push({ name: 'city_name_mapped', value: cityName });
                params.push({ name: 'city_name_mapped_suffix', value: `% ${cityName}` });
                console.log('Filtering by mapped city name:', cityName);
            }
            else if (province) {
                // Tìm theo mã tỉnh
                query += " AND l.city = @province";
                params.push({ name: 'province', value: province });
                console.log('Filtering by province ID:', province);
            }
        }

        if (district) {
            query += ' AND l.district = @district';
            params.push({ name: 'district', value: district });
        }

        if (ward) {
            query += ' AND l.ward = @ward';
            params.push({ name: 'ward', value: ward });
        }

        // Thêm các điều kiện lọc khác
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

        // Debug truy vấn SQL
        console.log('Search SQL query:', query);
        console.log('Search parameters:', params);

        // Thêm SQL debug để xem toàn bộ city_name trong database
        if (usingCityFilter) {
            console.log('Checking all city_name values in database...');
            const debugQuery = `SELECT DISTINCT l.city_name FROM Locations l`;
            const debugResult = await request.query(debugQuery);
            console.log('All city_name values in DB:', debugResult.recordset.map(r => r.city_name));
        }

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

        // Đếm tổng số kết quả - xây dựng lại truy vấn đếm tương tự truy vấn chính
        let countQuery = `
            SELECT COUNT(*) as total
            FROM Properties p
            LEFT JOIN Locations l ON p.location_id = l.id
            WHERE 1=1
        `;

        // Áp dụng các điều kiện tương tự
        if (province || city || decodedCityName || cityName) {
            let locationConditions = [];
            
            if (decodedCityName) {
                countQuery += " AND (l.city_name = @city_name_exact OR l.city_name LIKE @city_name_suffix)";
            }
            else if (cityName) {
                countQuery += " AND (l.city_name = @city_name_mapped OR l.city_name LIKE @city_name_mapped_suffix)";
            }
            else if (province) {
                countQuery += " AND l.city = @province";
            }
        }

        if (district) countQuery += ' AND l.district = @district';
        if (ward) countQuery += ' AND l.ward = @ward';
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

        console.log('Count SQL query:', countQuery);

        const countResult = await request.query(countQuery);
        const total = countResult.recordset[0].total;

        // Log kết quả
        console.log(`Search results: Found ${properties.length} properties out of ${total} total`);
        console.log(`Search results: Found ${properties.length} properties for city_name=${city_name || 'not specified'}`);
        console.log('First property city_name (if any):', properties.length > 0 ? properties[0].city_name : 'none');
        
        // If filtering by city but no results found, we will return an empty array
        if (usingCityFilter && properties.length === 0) {
            console.log(`No properties found for city "${decodedCityName}", returning empty result instead of fallback`);
            return res.json({
                success: true,
                message: 'Tìm kiếm bất động sản thành công',
                data: {
                    properties: [],
                    pagination: {
                        total: 0,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total_pages: 0
                    }
                }
            });
        }

        // Return the search results
        res.json({
            success: true,
            message: 'Tìm kiếm bất động sản thành công',
            data: {
                properties,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                total_pages: Math.ceil(total / limit)
                }
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
    searchByArea,
    searchProperties
};