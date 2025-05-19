const { connectToDatabase, sql } = require('../config/database');
const jwt = require("jsonwebtoken");
const { getCoordinatesFromAddress } = require('../utils/geocodingUtils');

const JWT_SECRET = process.env.JWT_SECRET; // Sử dụng biến môi trường

// Middleware for authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: "Vui lòng đăng nhập để thực hiện thao tác này" 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn" 
      });
    }
    
    if (!user.id) {
      return res.status(403).json({ 
        success: false,
        message: "Token không chứa thông tin người dùng" 
      });
    }
    
    req.user = user;
    next();
  });
}

// Get all properties with filters
async function getProperties(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Create a request object
    const request = new sql.Request();

    // Build the WHERE clause based on filters
    let whereClause = 'WHERE 1=1';

    // Luôn lọc bất động sản có status là available và chưa hết hạn
    whereClause += ' AND p.status = @status';
    request.input('status', sql.NVarChar, 'available');
    
    // Lọc các tin đã hết hạn
    whereClause += ' AND (p.expires_at IS NULL OR p.expires_at > @currentDate)';
    request.input('currentDate', sql.DateTime, new Date());

    if (req.query.property_type) {
      whereClause += ' AND p.property_type = @property_type';
      request.input('property_type', sql.NVarChar, req.query.property_type);
    }

    if (req.query.min_price) {
      whereClause += ' AND p.price >= @min_price';
      request.input('min_price', sql.Decimal(18,2), parseFloat(req.query.min_price));
    }

    if (req.query.max_price) {
      whereClause += ' AND p.price <= @max_price';
      request.input('max_price', sql.Decimal(18,2), parseFloat(req.query.max_price));
    }

    if (req.query.min_area) {
      whereClause += ' AND p.area >= @min_area';
      request.input('min_area', sql.Float, parseFloat(req.query.min_area));
    }

    if (req.query.max_area) {
      whereClause += ' AND p.area <= @max_area';
      request.input('max_area', sql.Float, parseFloat(req.query.max_area));
    }

    // Filter by listing_type để phân biệt mua bán và cho thuê
    if (req.query.listing_type) {
      console.log('Filtering by listing_type:', req.query.listing_type);
      
      // Trước tiên kiểm tra xem có trường listing_type trong DB không
      if (req.query.listing_type === 'rent' || req.query.listing_type === 'sale') {
        // Nếu có, lọc theo listing_type
        whereClause += ' AND (p.listing_type = @listing_type';
        request.input('listing_type', sql.NVarChar, req.query.listing_type);
        
        // Fallback: nếu listing_type là null, sử dụng giá để phân biệt
        if (req.query.listing_type === 'rent') {
          // Cho thuê: giá dưới 1 tỷ và không có listing_type hoặc listing_type là rent
          whereClause += ' OR (p.listing_type IS NULL AND p.price < 1000000000))';
          console.log('Filtering for RENTAL properties (listing_type = rent OR price < 1B when listing_type is NULL)');
        } else {
          // Bán: giá từ 1 tỷ trở lên và không có listing_type hoặc listing_type là sale
          whereClause += ' OR (p.listing_type IS NULL AND p.price >= 1000000000))';
          console.log('Filtering for SALE properties (listing_type = sale OR price >= 1B when listing_type is NULL)');
        }
      }
    }

    // Filter by city
    if (req.query.city) {
      whereClause += ' AND l.city = @city';
      request.input('city', sql.NVarChar, req.query.city);
    }

    // Filter by district
    if (req.query.district) {
      whereClause += ' AND l.district = @district';
      request.input('district', sql.NVarChar, req.query.district);
    }

    // Filter by ward
    if (req.query.ward) {
      whereClause += ' AND l.ward = @ward';
      request.input('ward', sql.NVarChar, req.query.ward);
    }
    
    // Filter by owner_id
    if (req.query.owner_id) {
      whereClause += ' AND p.owner_id = @owner_id';
      request.input('owner_id', sql.Int, parseInt(req.query.owner_id));
    }
    
    // Filter properties with coordinates if requested for map search
    if (req.query.has_coordinates === 'true') {
      whereClause += ' AND l.latitude IS NOT NULL AND l.longitude IS NOT NULL';
    }
    
    // Filter by distance from a point (for map search)
    if (req.query.latitude && req.query.longitude && req.query.distance) {
      const lat = parseFloat(req.query.latitude);
      const lng = parseFloat(req.query.longitude);
      const distance = parseFloat(req.query.distance); // distance in kilometers
      
      // Calculate distances using Haversine formula directly in SQL
      whereClause += ` AND
        (6371 * ACOS(
          COS(RADIANS(@lat)) * COS(RADIANS(l.latitude)) * COS(RADIANS(l.longitude) - RADIANS(@lng)) + 
          SIN(RADIANS(@lat)) * SIN(RADIANS(l.latitude))
        )) <= @distance`;
      
      request.input('lat', sql.Float, lat);
      request.input('lng', sql.Float, lng);
      request.input('distance', sql.Float, distance);
    }

    // Add pagination parameters
    request.input('offset', sql.Int, offset);
    request.input('fetch', sql.Int, limit);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM Properties p
      LEFT JOIN Locations l ON p.location_id = l.id
      ${whereClause}
    `;
    
    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const query = `
      SELECT 
        p.*,
        l.address, l.city, l.district, l.ward, l.street, l.latitude, l.longitude,
        u.name as owner_name
      FROM Properties p
      LEFT JOIN Locations l ON p.location_id = l.id
      LEFT JOIN Users u ON p.owner_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
      OFFSET @offset ROWS
      FETCH NEXT @fetch ROWS ONLY
    `;

    const result = await request.query(query);

    // Process the results, parse JSON images field if exists
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
        image_url: property.primary_image_url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1000&auto=format&fit=crop'
      };
    });

    res.json({
      success: true,
      message: 'Lấy danh sách bất động sản thành công',
      data: {
        properties,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bất động sản:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
}

// Add a new property
async function addProperty(req, res) {
  const { title, description, price, area, property_type, bedrooms, bathrooms, parking_slots, amenities, location, images } = req.body;
  
  try {
    // Kiểm tra user id
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng'
      });
    }

    const userId = req.user.id;

    // Thêm địa điểm
    const locationResult = await sql.query`
      INSERT INTO Locations (address, city, district, ward, street, latitude, longitude)
      VALUES (${location.address}, ${location.city}, ${location.district}, 
              ${location.ward}, ${location.street}, ${location.latitude}, ${location.longitude})
      
      SELECT SCOPE_IDENTITY() AS id
    `;

    const locationId = locationResult.recordset[0].id;

    // Thêm bất động sản
    const propertyResult = await sql.query`
      INSERT INTO Properties (
        title, description, price, area, property_type, bedrooms,
        bathrooms, parking_slots, amenities, owner_id, location_id
      )
      VALUES (
        ${title}, ${description}, ${price}, ${area}, ${property_type},
        ${bedrooms}, ${bathrooms}, ${parking_slots}, ${amenities},
        ${userId}, ${locationId}
      )
      
      SELECT SCOPE_IDENTITY() AS id
    `;

    const propertyId = propertyResult.recordset[0].id;

    // Thêm hình ảnh
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await sql.query`
          INSERT INTO PropertyImages (property_id, image_url, is_primary)
          VALUES (${propertyId}, ${images[i]}, ${i === 0})
        `;
      }
    }

    res.status(201).json({
      success: true,
      message: 'Thêm bất động sản thành công',
      data: { id: propertyId }
    });
  } catch (error) {
    console.error('Lỗi thêm bất động sản:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
}

// API Đăng Tin bất động sản mới với validation và xử lý ảnh
async function createProperty(req, res) {
  const { 
    title, description, price, area, property_type, bedrooms, 
    bathrooms, parking_slots, amenities, location, images, 
    status, listing_type
  } = req.body;
  
  try {
    // Validate dữ liệu đầu vào
    if (!title || !description || !price || !area || !property_type || !location) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        required_fields: ['title', 'description', 'price', 'area', 'property_type', 'location']
      });
    }

    // Kiểm tra giá trị hợp lệ
    if (price <= 0 || area <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Giá và diện tích phải lớn hơn 0'
      });
    }

    // Validate property_type according to schema constraints
    const validPropertyTypes = ['house', 'apartment', 'land', 'shop', 'villa', 'office'];
    
    // Log giá trị ban đầu để debug
    console.log("DEBUG - Received property_type:", property_type);
    console.log("DEBUG - Received property_type type:", typeof property_type);
    
    // Chuyển đổi loại bất động sản tiếng Việt sang tiếng Anh
    let normalizedPropertyType = property_type;
    if (property_type) {
      // Map tiếng Việt sang tiếng Anh
      const propertyTypeMap = {
        'nhà riêng': 'house',
        'biệt thự': 'villa',
        'căn hộ chung cư': 'apartment',
        'chung cư': 'apartment',
        'căn hộ': 'apartment',
        'đất nền': 'land',
        'đất': 'land',
        'văn phòng': 'office',
        'mặt bằng kinh doanh': 'shop',
        'biet thu': 'villa',
        // Thêm các giá trị trực tiếp từ UI
        'Biệt thự': 'villa', 
        'Căn hộ chung cư': 'apartment',
        'Nhà riêng': 'house',
        'Đất nền': 'land',
        'Văn phòng': 'office',
        'Mặt bằng kinh doanh': 'shop',
        // Thêm các giá trị tiếng Anh từ UI
        'villa': 'villa',
        'house': 'house',
        'apartment': 'apartment',
        'land': 'land',
        'office': 'office',
        'shop': 'shop',
        'commercial': 'shop'  // Map commercial sang shop để tương thích
      };
      
      // Chuyển đổi sang chữ thường và loại bỏ dấu cách thừa
      const normalizedInput = property_type.toString().toLowerCase().trim();
      console.log("DEBUG - Normalized input:", normalizedInput);
      
      // Nếu có trong map thì chuyển đổi
      if (propertyTypeMap[property_type]) {
        // Thử tìm kiếm chính xác trước
        normalizedPropertyType = propertyTypeMap[property_type];
        console.log("DEBUG - Exact match found:", normalizedPropertyType);
      } else if (propertyTypeMap[normalizedInput]) {
        // Thử tìm kiếm chuẩn hóa
        normalizedPropertyType = propertyTypeMap[normalizedInput];
        console.log("DEBUG - Normalized match found:", normalizedPropertyType);
      } else {
        // Fallback: Trực tiếp map giá trị cụ thể
        if (normalizedInput.includes('biệt thự') || normalizedInput.includes('biet thu') || normalizedInput.includes('villa')) {
          normalizedPropertyType = 'villa';
        } else if (normalizedInput.includes('căn hộ') || normalizedInput.includes('chung cư') || normalizedInput.includes('can ho') || normalizedInput.includes('apartment')) {
          normalizedPropertyType = 'apartment';
        } else if (normalizedInput.includes('đất') || normalizedInput.includes('dat') || normalizedInput.includes('land')) {
          normalizedPropertyType = 'land';
        } else if (normalizedInput.includes('văn phòng') || normalizedInput.includes('office')) {
          normalizedPropertyType = 'office';
        } else if (normalizedInput.includes('thương mại') || normalizedInput.includes('kinh doanh') || normalizedInput.includes('commercial') || normalizedInput.includes('shop') || normalizedInput.includes('mặt bằng')) {
          normalizedPropertyType = 'shop';
        }
          
        console.log("DEBUG - Fallback match applied:", normalizedPropertyType);
      }
    }
    
    console.log("DEBUG - Final property_type:", normalizedPropertyType);
    
    if (!validPropertyTypes.includes(normalizedPropertyType)) {
      return res.status(400).json({
        success: false,
        message: 'Loại bất động sản không hợp lệ',
        received_type: property_type,
        normalized_type: normalizedPropertyType,
        valid_property_types: ['nhà riêng', 'biệt thự', 'căn hộ chung cư', 'đất nền', 'văn phòng', 'mặt bằng kinh doanh'],
        valid_property_types_english: validPropertyTypes
      });
    }

    // Validate and normalize listing_type (for distinguishing between rent and sale)
    let normalizedListingType = 'sale'; // Default to sale
    
    // If listing_type is explicitly provided and valid, use it
    if (listing_type && ['rent', 'sale'].includes(listing_type.toLowerCase())) {
      normalizedListingType = listing_type.toLowerCase();
    } else {
      // Otherwise determine from title and property type
      const titleLower = title.toLowerCase();
      
      // Check for rental indicators in title
      if (titleLower.includes('cho thuê') || 
          titleLower.includes('thuê') || 
          (property_type === 'office' && !titleLower.includes('bán'))) {
        normalizedListingType = 'rent';
      }
      
      // Double check with price if it's very low (likely rent)
      if (price < 100000000) { // Less than 100 million VND
        normalizedListingType = 'rent';
      } else if (price >= 1000000000) { // 1 billion VND or more
        normalizedListingType = 'sale';
      }
    }
    
    console.log('Determined listing_type:', normalizedListingType);
    
    // Make sure property status is valid
    let propertyStatus = 'available';
    if (status && ['available', 'pending', 'sold', 'rented'].includes(status)) {
      propertyStatus = status;
    }

    // Xác thực người dùng
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng'
      });
    }

    const userId = req.user.id;

    // Kiểm tra quyền đăng tin - Sửa để chỉ lấy thông tin cơ bản của người dùng
    const userResult = await sql.query`
      SELECT id, username, name, email, phone, status FROM Users WHERE id = ${userId}
    `;

    if (userResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng'
      });
    }

    const user = userResult.recordset[0];
    
    // Kiểm tra tài khoản có bị khóa không - sử dụng trường status thay vì account_status
    if (user.status !== 'active' && user.status !== undefined) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn không hoạt động, không thể đăng tin'
      });
    }

    // Tạo request để dùng transaction
    const transaction = new sql.Transaction();
    await transaction.begin();
    const request = new sql.Request(transaction);

    try {
      // Thêm địa điểm với validation
      if (!location.city || !location.district || !location.address) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Thông tin địa chỉ không đầy đủ',
          required_location_fields: ['city', 'district', 'address']
        });
      }

      // Log để debug
      console.log("DEBUG - Location data received:", location);
      console.log("DEBUG - Raw location data from request:", JSON.stringify(req.body.location));
      console.log("DEBUG - Root level coordinates:", { 
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        latType: typeof req.body.latitude,
        lngType: typeof req.body.longitude
      });

      // Xử lý tọa độ - đảm bảo có giá trị hợp lệ hoặc null
      let latitude = null;  // Mặc định là null
      let longitude = null; // Mặc định là null
      
      // Thử lấy tọa độ từ cấp root của request trước
      if (typeof req.body.latitude === 'number' && !isNaN(req.body.latitude)) {
        latitude = req.body.latitude;
        console.log("DEBUG - Using numeric latitude from root:", latitude);
      } else if (typeof req.body.latitude === 'string' && !isNaN(parseFloat(req.body.latitude))) {
        latitude = parseFloat(req.body.latitude);
        console.log("DEBUG - Parsed latitude from root string:", latitude);
      }
      
      if (typeof req.body.longitude === 'number' && !isNaN(req.body.longitude)) {
        longitude = req.body.longitude;
        console.log("DEBUG - Using numeric longitude from root:", longitude);
      } else if (typeof req.body.longitude === 'string' && !isNaN(parseFloat(req.body.longitude))) {
        longitude = parseFloat(req.body.longitude);
        console.log("DEBUG - Parsed longitude from root string:", longitude);
      }
      
      // Nếu tọa độ từ cấp root không có giá trị, thử lấy từ location object
      if (latitude === null || longitude === null) {
        console.log("DEBUG - No valid coordinates at root level, checking location object");
        
        // Chỉ gán nếu có giá trị hợp lệ từ location object
        if (typeof location.latitude === 'number' && !isNaN(location.latitude)) {
          latitude = location.latitude;
          console.log("DEBUG - Using numeric latitude from location:", latitude);
        } else if (typeof location.latitude === 'string' && !isNaN(parseFloat(location.latitude))) {
          latitude = parseFloat(location.latitude);
          console.log("DEBUG - Parsed latitude from location string:", latitude);
        }
        
        if (typeof location.longitude === 'number' && !isNaN(location.longitude)) {
          longitude = location.longitude;
          console.log("DEBUG - Using numeric longitude from location:", longitude);
        } else if (typeof location.longitude === 'string' && !isNaN(parseFloat(location.longitude))) {
          longitude = parseFloat(location.longitude);
          console.log("DEBUG - Parsed longitude from location string:", longitude);
        }
      }
      
      // Kiểm tra và log tọa độ cuối cùng được gán
      console.log("DEBUG - After parsing, coordinates:", { latitude, longitude });
      
      // Nếu không có tọa độ, thực hiện geocoding tự động
      if (latitude === null || longitude === null) {
        console.log("DEBUG - Missing coordinates, attempting to geocode address");
        
        // Tạo địa chỉ đầy đủ cho geocoding
        const fullAddress = [
          location.address,
          location.ward_name || location.ward,
          location.district_name || location.district,
          location.city_name || location.city
        ].filter(Boolean).join(', ');
        
        console.log("DEBUG - Geocoding full address:", fullAddress);
        
        try {
          // Thực hiện geocoding
          const geocodeResult = await getCoordinatesFromAddress(fullAddress);
          
          if (geocodeResult.success) {
            latitude = geocodeResult.latitude;
            longitude = geocodeResult.longitude;
            console.log("DEBUG - Geocoding successful:", { latitude, longitude });
          } else {
            console.warn("DEBUG - Geocoding failed:", geocodeResult.message);
            // Nếu geocode thất bại, trả về lỗi để tránh lưu null vào DB
            return res.status(400).json({
              success: false,
              message: "Không thể xác định tọa độ của địa chỉ. Vui lòng chọn vị trí trên bản đồ."
            });
          }
        } catch (geocodeError) {
          console.error("DEBUG - Geocoding error:", geocodeError);
          // Trả về lỗi thay vì tiếp tục với giá trị NULL
          return res.status(400).json({
            success: false,
            message: "Lỗi khi xác định tọa độ. Vui lòng chọn vị trí chính xác trên bản đồ."
          });
        }
      }
      
      // Cuối cùng, kiểm tra lại một lần nữa trước khi chèn vào database
      if (latitude === null || longitude === null) {
        console.error("DEBUG - Coordinates still null after all attempts. Cannot proceed.");
        return res.status(400).json({
          success: false,
          message: "Tọa độ không thể để trống. Vui lòng chọn vị trí trên bản đồ."
        });
      }
                       
      console.log("DEBUG - Final latitude value:", latitude);
      console.log("DEBUG - Final longitude value:", longitude);

      // Kiểm tra xem địa chỉ đã tồn tại chưa
      request.input('address', sql.NVarChar, location.address);
      
      const existingLocationQuery = `
        SELECT id FROM Locations 
        WHERE address = @address
      `;
      
      const existingLocationResult = await request.query(existingLocationQuery);
      let locationId;
      
      if (existingLocationResult.recordset.length > 0) {
        // Sử dụng location đã tồn tại
        locationId = existingLocationResult.recordset[0].id;
        console.log("DEBUG - Using existing location with ID:", locationId);
      } else {
        // Thêm địa điểm mới nếu chưa tồn tại
        request.input('city', sql.NVarChar, location.city);
        request.input('district', sql.NVarChar, location.district);
        request.input('ward', sql.NVarChar, location.ward || null);
        request.input('street', sql.NVarChar, location.street || null);
        
        // Đảm bảo latitude và longitude là kiểu số hợp lệ trước khi chèn vào database
        if (latitude === null || longitude === null) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: "Tọa độ không thể để trống. Vui lòng chọn vị trí trên bản đồ."
          });
        }
        
        // Convert to Decimal for SQL Server
        request.input('latitude', sql.Decimal(9,6), latitude);
        request.input('longitude', sql.Decimal(9,6), longitude);
        
        console.log("DEBUG - Final values for database insertion:");
        console.log("latitude:", latitude, "type:", typeof latitude);
        console.log("longitude:", longitude, "type:", typeof longitude);

        const locationQuery = `
          INSERT INTO Locations (address, city, district, ward, street, latitude, longitude)
          OUTPUT INSERTED.id
          VALUES (@address, @city, @district, @ward, @street, @latitude, @longitude)
        `;

        console.log("DEBUG - SQL Query:", locationQuery);
        console.log("DEBUG - STRATEGY: Using parameterized coordinates");
        console.log("DEBUG - SQL Parameters:", {
          address: location.address,
          city: location.city,
          district: location.district,
          ward: location.ward || null,
          street: location.street || null,
          latitude: latitude,
          longitude: longitude
        });

        const locationResult = await request.query(locationQuery);
        console.log("DEBUG - Location result:", locationResult);
        
        // Kiểm tra kết quả và lấy ID đúng cách
        if (locationResult.recordset && locationResult.recordset.length > 0) {
          locationId = locationResult.recordset[0].id;
        } else {
          // Nếu không có recordset, thử dùng SCOPE_IDENTITY() để lấy ID
          const idResult = await request.query("SELECT SCOPE_IDENTITY() AS id");
          locationId = idResult.recordset[0].id;
        }
        
        console.log("DEBUG - New location created with ID:", locationId);
      }

      // Chuẩn bị JSON cho trường images nếu có
      let imagesJson = null;
      let primaryImageUrl = null;
      
      if (images && images.length > 0) {
        imagesJson = JSON.stringify(images);
        primaryImageUrl = images[0]; // Dùng ảnh đầu tiên làm ảnh chính
      }

      // Thêm bất động sản với các trường phù hợp với schema
      request.input('title', sql.NVarChar, title);
      request.input('description', sql.NVarChar, description);
      request.input('price', sql.Decimal(18,2), price);
      request.input('area', sql.Decimal(18,2), area); // Changed from Float to Decimal(18,2) to match schema
      request.input('property_type', sql.NVarChar, normalizedPropertyType);
      request.input('bedrooms', sql.Int, bedrooms || null);
      request.input('bathrooms', sql.Int, bathrooms || null);
      request.input('parking_slots', sql.Int, parking_slots || null);
      request.input('amenities', sql.NVarChar, amenities || null);
      request.input('owner_id', sql.Int, userId);
      request.input('location_id', sql.Int, locationId);
      request.input('status', sql.NVarChar, propertyStatus); // Using validated status
      request.input('images', sql.NVarChar, imagesJson);
      request.input('primary_image_url', sql.NVarChar, primaryImageUrl);
      request.input('listing_type', sql.NVarChar, normalizedListingType);
      
      // Tính toán ngày hết hạn (10 ngày kể từ ngày đăng)
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 10);
      request.input('expires_at', sql.DateTime, expirationDate);

      const propertyQuery = `
        INSERT INTO Properties (
          title, description, price, area, property_type, bedrooms,
          bathrooms, parking_slots, amenities, owner_id, location_id,
          status, images, primary_image_url, listing_type, expires_at
        )
        VALUES (
          @title, @description, @price, @area, @property_type,
          @bedrooms, @bathrooms, @parking_slots, @amenities,
          @owner_id, @location_id, @status, @images, @primary_image_url, @listing_type, @expires_at
        )
        SELECT SCOPE_IDENTITY() AS id
      `;

      const propertyResult = await request.query(propertyQuery);
      const propertyId = propertyResult.recordset[0].id;

      // Commit the transaction after all required operations
      await transaction.commit();

      // Try to create a notification (non-critical)
      try {
        const notificationRequest = new sql.Request();
        notificationRequest.input('admin_notification_type', sql.NVarChar, 'new_property');
        notificationRequest.input('admin_notification_message', sql.NVarChar, `Có bất động sản mới: ${title}`);
        notificationRequest.input('admin_notification_property_id', sql.Int, propertyId);

        const notificationQuery = `
          INSERT INTO AdminNotifications (type, message, property_id, created_at, is_read)
          VALUES (@admin_notification_type, @admin_notification_message, @admin_notification_property_id, GETDATE(), 0)
        `;

        await notificationRequest.query(notificationQuery);
      } catch (error) {
        console.log("Notification creation failed (non-critical):", error.message);
        // Continue even if notification fails - main transaction already committed
      }

      // Trả về response thành công
      res.status(201).json({
        success: true,
        message: 'Đăng tin bất động sản thành công',
        data: { 
          id: propertyId,
          status: propertyStatus,
          created_at: new Date().toISOString(),
          expires_at: expirationDate.toISOString()
        }
      });
    } catch (error) {
      // Rollback transaction nếu có lỗi
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Lỗi đăng tin bất động sản:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng tin bất động sản',
      error: error.message
    });
  }
}

// Update a property
async function updateProperty(req, res) {
  const { id } = req.params;
  const { title, description, price, area, property_type, bedrooms, bathrooms, parking_slots, amenities, location, images, status, listing_type } = req.body;
  
  try {
    console.log('Updating property:', id);
    console.log('Request body:', req.body);
    console.log('Status value received:', status, 'Type:', typeof status);
    console.log('Listing type received:', listing_type);
    
    const userId = req.user.id;

    // Kiểm tra quyền sở hữu
    const checkResult = await sql.query`
      SELECT owner_id, status as current_status, listing_type as current_listing_type FROM Properties WHERE id = ${id}
    `;

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bất động sản'
      });
    }

    if (checkResult.recordset[0].owner_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật bất động sản này'
      });
    }

    // Current status and listing_type from database
    const currentStatus = checkResult.recordset[0].current_status;
    const currentListingType = checkResult.recordset[0].current_listing_type || (price >= 1000000000 ? 'sale' : 'rent');
    console.log('Current status in database:', currentStatus);
    console.log('Current listing_type in database:', currentListingType);

    // Start a transaction
    const transaction = new sql.Transaction();
    await transaction.begin();
    const request = new sql.Request(transaction);

    try {
      // Handle location update
      if (location) {
        // Xử lý tọa độ - đảm bảo có giá trị hợp lệ hoặc null
        let latitude = null;  // Mặc định là null
        let longitude = null; // Mặc định là null
        
        // Chỉ gán nếu có giá trị hợp lệ
        if (typeof location.latitude === 'number' && !isNaN(location.latitude)) {
          latitude = location.latitude;
          console.log("DEBUG - Using numeric latitude:", latitude);
        } else if (typeof location.latitude === 'string' && !isNaN(parseFloat(location.latitude))) {
          latitude = parseFloat(location.latitude);
          console.log("DEBUG - Parsed latitude from string:", latitude);
        }
        
        if (typeof location.longitude === 'number' && !isNaN(location.longitude)) {
          longitude = location.longitude;
          console.log("DEBUG - Using numeric longitude:", longitude);
        } else if (typeof location.longitude === 'string' && !isNaN(parseFloat(location.longitude))) {
          longitude = parseFloat(location.longitude);
          console.log("DEBUG - Parsed longitude from string:", longitude);
        }
        
        // Kiểm tra và log tọa độ cuối cùng được gán
        console.log("DEBUG - After parsing, coordinates:", { latitude, longitude });
        
        // Nếu không có tọa độ, thực hiện geocoding tự động
        if (latitude === null || longitude === null) {
          console.log("DEBUG - Missing coordinates, attempting to geocode address");
          
          // Tạo địa chỉ đầy đủ cho geocoding
          const fullAddress = [
            location.address,
            location.ward_name || location.ward,
            location.district_name || location.district,
            location.city_name || location.city
          ].filter(Boolean).join(', ');
          
          console.log("DEBUG - Geocoding full address:", fullAddress);
          
          try {
            // Thực hiện geocoding
            const geocodeResult = await getCoordinatesFromAddress(fullAddress);
            
            if (geocodeResult.success) {
              latitude = geocodeResult.latitude;
              longitude = geocodeResult.longitude;
              console.log("DEBUG - Geocoding successful:", { latitude, longitude });
            } else {
              console.warn("DEBUG - Geocoding failed:", geocodeResult.message);
              // Nếu geocode thất bại, trả về lỗi để tránh lưu null vào DB
              return res.status(400).json({
                success: false,
                message: "Không thể xác định tọa độ của địa chỉ. Vui lòng chọn vị trí trên bản đồ."
              });
            }
          } catch (geocodeError) {
            console.error("DEBUG - Geocoding error:", geocodeError);
            // Trả về lỗi thay vì tiếp tục với giá trị NULL
            return res.status(400).json({
              success: false,
              message: "Lỗi khi xác định tọa độ. Vui lòng chọn vị trí chính xác trên bản đồ."
            });
          }
        }
        
        // Cuối cùng, kiểm tra lại một lần nữa trước khi chèn vào database
        if (latitude === null || longitude === null) {
          console.error("DEBUG - Coordinates still null after all attempts. Cannot proceed.");
          return res.status(400).json({
            success: false,
            message: "Tọa độ không thể để trống. Vui lòng chọn vị trí trên bản đồ."
          });
        }
                       
        console.log("DEBUG - Final latitude value:", latitude);
        console.log("DEBUG - Final longitude value:", longitude);
        
        // Kiểm tra xem địa chỉ đã tồn tại chưa
        request.input('address', sql.NVarChar, location.address);
      
        const existingLocationQuery = `
          SELECT id FROM Locations 
          WHERE address = @address AND id != (SELECT location_id FROM Properties WHERE id = @propertyId)
        `;
        
        request.input('propertyId', sql.Int, id);
        const existingLocationResult = await request.query(existingLocationQuery);
        
        if (existingLocationResult.recordset.length > 0) {
          // Sử dụng location đã tồn tại
          const existingLocationId = existingLocationResult.recordset[0].id;
          
          // Update property to use existing location
          await request.query`
            UPDATE Properties
            SET location_id = ${existingLocationId}
            WHERE id = ${id}
          `;
        } else {
          // Update existing location with new coordinates
          await request.query`
            UPDATE Locations
            SET address = ${location.address},
                city = ${location.city},
                district = ${location.district},
                ward = ${location.ward},
                street = ${location.street},
                latitude = ${latitude}, 
                longitude = ${longitude}
            WHERE id = (SELECT location_id FROM Properties WHERE id = ${id})
          `;
        }
      }

      // Kiểm tra và điều chỉnh giá trị status
      // Lấy danh sách chính xác các giá trị status hợp lệ trong database
      // Dựa trên ràng buộc CHK_Properties_Status hiện tại
      const validStatusValues = ['available', 'pending', 'sold', 'rented'];
      
      // Map giữa giá trị từ frontend và giá trị database
      const statusMap = {
        'for_sale': 'available',
        'for_rent': 'available',
        'sale': 'available',
        'rent': 'available'
      };
      
      // Khởi tạo giá trị status hợp lệ
      let validStatus;
      
      // Đầu tiên, kiểm tra xem status có trong map không
      if (status && statusMap[status]) {
        console.log(`Status ${status} được map tới ${statusMap[status]}`);
        validStatus = statusMap[status];
      }
      // Nếu không, kiểm tra xem status có trực tiếp trong danh sách hợp lệ không
      else if (status && validStatusValues.includes(status)) {
        console.log(`Status ${status} hợp lệ, sử dụng trực tiếp`);
        validStatus = status;
      }
      // Cuối cùng, nếu không hợp lệ, giữ nguyên trạng thái hiện tại
      else {
        console.log(`Status không hợp lệ hoặc không được cung cấp: ${status}, giữ nguyên status hiện tại: ${currentStatus}`);
        validStatus = currentStatus;
      }
      
      console.log('Final status to use:', validStatus);
      
      // Determine the appropriate listing_type based on various factors
      let finalListingType = currentListingType;
      
      // Priority 1: Explicit listing_type provided in the request
      if (listing_type && ['rent', 'sale'].includes(listing_type.toLowerCase())) {
        finalListingType = listing_type.toLowerCase();
        console.log('Using explicitly provided listing_type:', finalListingType);
      } 
      // Priority 2: Check title keywords (if title is being updated)
      else if (title) {
        const titleLower = title.toLowerCase();
        if (titleLower.includes('cho thuê') || titleLower.includes('thuê')) {
          finalListingType = 'rent';
          console.log('Title contains rental keywords, setting listing_type to rent');
        } else if (titleLower.includes('bán') && !titleLower.includes('thuê')) {
          finalListingType = 'sale';
          console.log('Title contains sale keywords, setting listing_type to sale');
        }
        // Special case for offices - they're often rental unless explicitly marked as for sale
        else if (property_type === 'office' && !titleLower.includes('bán')) {
          finalListingType = 'rent';
          console.log('Property is office type without "bán" in title, setting listing_type to rent');
        }
      }
      // Priority 3: Use price as indicator if being updated
      else if (price !== undefined) {
        if (price < 100000000) { // Less than 100 million VND - likely rent
          finalListingType = 'rent';
          console.log('Price is very low, setting listing_type to rent');
        } else if (price >= 1000000000) { // 1 billion VND or more - likely sale
          finalListingType = 'sale';
          console.log('Price is high, setting listing_type to sale');
        }
      }
      
      console.log('Final determined listing_type:', finalListingType);

      // Cập nhật thông tin bất động sản
      const updateQuery = `
        UPDATE Properties
        SET title = @title,
            description = @description,
            price = @price,
            area = @area,
            property_type = @property_type,
            bedrooms = @bedrooms,
            bathrooms = @bathrooms,
            parking_slots = @parking_slots,
            amenities = @amenities,
            status = @status,
            listing_type = @listing_type
        WHERE id = @id
        SELECT SCOPE_IDENTITY() AS id
      `;
      
      request.input('title', sql.NVarChar, title);
      request.input('description', sql.NVarChar, description);
      request.input('price', sql.Decimal(18,2), price);
      request.input('area', sql.Decimal(18,2), area);
      request.input('property_type', sql.NVarChar, property_type);
      request.input('bedrooms', sql.Int, bedrooms || null);
      request.input('bathrooms', sql.Int, bathrooms || null);
      request.input('parking_slots', sql.Int, parking_slots || null);
      request.input('amenities', sql.NVarChar, amenities || null);
      request.input('status', sql.NVarChar, validStatus);
      request.input('listing_type', sql.NVarChar, finalListingType);
      request.input('id', sql.Int, id);
      
      await request.query(updateQuery);

      // Cập nhật hình ảnh
      if (images && images.length > 0) {
        // Chuẩn bị JSON cho trường images
        const imagesJson = JSON.stringify(images);
        const primaryImageUrl = images[0]; // Dùng ảnh đầu tiên làm ảnh chính
        
        // Cập nhật Properties với trường images JSON
        await request.query`
          UPDATE Properties
          SET images = ${imagesJson},
              primary_image_url = ${primaryImageUrl}
          WHERE id = ${id}
        `;
      }

      // Commit transaction
      await transaction.commit();

      res.status(200).json({
        success: true,
        message: 'Cập nhật bất động sản thành công'
      });
    } catch (error) {
      // Rollback transaction if there's an error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Lỗi cập nhật bất động sản:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
}

// Delete a property
async function deleteProperty(req, res) {
  const { id } = req.params;
  try {
    const userId = req.user.id;

    // Kiểm tra quyền sở hữu
    const checkResult = await sql.query`
      SELECT owner_id FROM Properties WHERE id = ${id}
    `;

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bất động sản'
      });
    }

    if (checkResult.recordset[0].owner_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bất động sản này'
      });
    }

    // Xóa bất động sản (cascade sẽ tự động xóa các bản ghi liên quan)
    await sql.query`
      DELETE FROM Properties WHERE id = ${id}
    `;

    res.status(200).json({
      success: true,
      message: 'Xóa bất động sản thành công'
    });
  } catch (error) {
    console.error('Lỗi xóa bất động sản:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
}

// Hàm tuỳ chỉnh để xử lý đầu vào tham số URL
function getCleanParam(req, paramName) {
  const value = req.query[paramName];
  
  // Log giá trị gốc
  console.log(`Giá trị gốc của tham số ${paramName}:`, {
    value,
    type: typeof value,
    length: value ? value.length : 0
  });
  
  // Nếu không có giá trị, trả về null
  if (!value) return null;
  
  // Làm sạch giá trị
  let cleanValue = value.toString().trim();
  
  // Nếu là 'land', 'apartment', 'house', 'villa' thì standardize
  if (['land', 'apartment', 'house', 'villa'].includes(cleanValue)) {
    // Đảm bảo giá trị là chuẩn và không có khoảng trắng
    cleanValue = cleanValue.toLowerCase().trim();
  }
  
  // Log giá trị đã làm sạch
  console.log(`Giá trị đã làm sạch của tham số ${paramName}:`, cleanValue);
  
  return cleanValue;
}

// Tìm kiếm bất động sản
async function searchProperties(req, res) {
  try {
    console.log('\n=========== BẮT ĐẦU TÌM KIẾM BẤT ĐỘNG SẢN ===========');
    console.log('URL đầy đủ:', req.originalUrl);
    console.log('Các tham số tìm kiếm (raw):', req.query);
    
    // DEBUG: Log toàn bộ các tham số tìm kiếm với kiểu dữ liệu
    const paramTypes = {};
    for (const key in req.query) {
      paramTypes[key] = {
        value: req.query[key],
        type: typeof req.query[key],
        isEmpty: req.query[key] === '',
        isNull: req.query[key] === null,
        isUndefined: req.query[key] === undefined
      };
    }
    console.log('Chi tiết các tham số tìm kiếm với kiểu dữ liệu:', paramTypes);
    
    // Xử lý các tham số quan trọng bằng hàm getCleanParam
    const cleanPropertyType = getCleanParam(req, 'property_type');
    const cleanCity = getCleanParam(req, 'city');
    const cleanCityName = getCleanParam(req, 'city_name');
    const cleanDistrict = getCleanParam(req, 'district');
    const cleanListingType = getCleanParam(req, 'listing_type');
    
    // Các tham số khác từ URL
    const {
      // Location filters
      ward,
      
      // Price range
      price_min,
      price_max,
      
      // Area range
      area_min,
      area_max,
      
      // Property details
      bedrooms,
      bathrooms,
      amenities,
      
      // Additional filters
      status,
      parking_slots,
      
      // Search text
      keyword,
      
      // Sorting
      sort_by = 'created_at',
      sort_direction = 'DESC',
      
      // Pagination
      page = 1,
      limit = 10
    } = req.query;

    // ===== KIỂM TRA BẤT THƯỜNG =====
    if (cleanPropertyType) {
      console.log('DEBUG PROPERTY TYPE:', {
        value: cleanPropertyType,
        type: typeof cleanPropertyType,
        trimmed: cleanPropertyType.trim(),
        length: cleanPropertyType.length,
        charCodes: Array.from(cleanPropertyType).map(char => char.charCodeAt(0))
      });
      
      // Kiểm tra nếu cleanPropertyType === 'land'
      console.log('cleanPropertyType === "land":', cleanPropertyType === 'land');
      console.log('cleanPropertyType.trim() === "land":', cleanPropertyType.trim() === 'land');
    }
    
    if (cleanCity) {
      console.log('DEBUG CITY:', {
        value: cleanCity,
        type: typeof cleanCity
      });
    }
    
    if (cleanCityName) {
      console.log('DEBUG CITY_NAME:', {
        value: cleanCityName,
        type: typeof cleanCityName,
        normalizedValue: cleanCityName.normalize('NFC')
      });
    }
    // ===================================

    // Create request object
    const request = new sql.Request();
    
    // Calculate offset for pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, parseInt(limit));

    // Build base query
    let whereClause = 'WHERE 1=1';
    let orderByClause = '';

    // Listing type filter (sale or rent)
    if (cleanListingType) {
      whereClause += ' AND p.listing_type = @listing_type';
      request.input('listing_type', sql.NVarChar, cleanListingType);
      console.log('Lọc theo loại giao dịch:', cleanListingType);
    }

    // Keyword search in title and description
    if (keyword) {
      whereClause += ` AND (
        p.title LIKE @keyword 
        OR p.description LIKE @keyword
        OR l.address LIKE @keyword
        OR l.street LIKE @keyword
      )`;
      request.input('keyword', sql.NVarChar, `%${keyword}%`);
      console.log('Lọc theo từ khóa:', keyword);
    }

    // City filtering - cải thiện xử lý city và city_name
    // Xử lý city_name và city - QUAN TRỌNG: Sử dụng city_id nếu có cả hai
    let usedCityFilter = false;
    
    // Ưu tiên xử lý city_name trước và chuyển thành city ID cho các thành phố lớn
    if (cleanCityName) {
      const normalizedCityName = cleanCityName.normalize('NFC'); // Chuẩn hóa Unicode cho tiếng Việt
      console.log('Lọc theo city_name (đã chuẩn hóa):', normalizedCityName);
      
      // DEBUG - In toàn bộ giá trị city_name trong database để kiểm tra
      await displayUniqueCityNames(request);
      
      // Chuyển đổi city_name thành city ID cho các thành phố lớn
      const lowerCityName = normalizedCityName.toLowerCase();
      
      if (lowerCityName.includes('hà nội') || lowerCityName.includes('ha noi')) {
        // Tìm kiếm Hà Nội bằng mã thành phố
        whereClause += " AND l.city = '1'";
        console.log('Chuyển đổi "Hà Nội" thành mã thành phố 1');
        usedCityFilter = true;
      } 
      else if (lowerCityName.includes('hồ chí minh') || lowerCityName.includes('ho chi minh') || lowerCityName.includes('saigon') || lowerCityName.includes('sài gòn')) {
        // Tìm kiếm Hồ Chí Minh bằng mã thành phố
        whereClause += " AND l.city = '79'";
        console.log('Chuyển đổi "Hồ Chí Minh" thành mã thành phố 79');
        usedCityFilter = true;
      }
      else {
        // Tìm kiếm chính xác theo tên thành phố
        whereClause += " AND l.city_name = @city_name_exact";
        request.input('city_name_exact', sql.NVarChar, normalizedCityName);
        console.log('Lọc chính xác theo tên thành phố:', normalizedCityName);
        usedCityFilter = true;
      }
    }
    // Chỉ xử lý city nếu chưa xử lý city_name
    else if (cleanCity && !usedCityFilter) {
      if (cleanCity === '1' || cleanCity === '01') {
        whereClause += " AND l.city = '1'";
        console.log('Lọc theo mã thành phố Hà Nội (ID: 1)');
      } else if (cleanCity === '79') {
        whereClause += " AND l.city = '79'";
        console.log('Lọc theo mã thành phố Hồ Chí Minh (ID: 79)');
      } else {
      whereClause += ' AND l.city = @city';
        request.input('city', sql.NVarChar, cleanCity);
        console.log('Lọc theo mã thành phố:', cleanCity);
    }
      usedCityFilter = true;
    }
    
    // District filter - chỉ áp dụng nếu đã có city filter
    if (cleanDistrict && usedCityFilter) {
      whereClause += ' AND l.district = @district';
      request.input('district', sql.NVarChar, cleanDistrict);
      console.log('Lọc theo quận/huyện:', cleanDistrict);
    } else if (cleanDistrict) {
      // Nếu chỉ có district mà không có city, vẫn tìm theo district
      whereClause += ' AND l.district = @district';
      request.input('district', sql.NVarChar, cleanDistrict);
      console.log('Lọc theo quận/huyện (không có thành phố):', cleanDistrict);
    }
    
    // Ward filter
    if (ward) {
      whereClause += ' AND l.ward = @ward';
      request.input('ward', sql.NVarChar, ward);
      console.log('Lọc theo phường/xã:', ward);
    }

    // Price range
    if (price_min) {
      whereClause += ' AND p.price >= @price_min';
      request.input('price_min', sql.Decimal(18,2), parseFloat(price_min));
      console.log('Lọc theo giá tối thiểu:', price_min);
    }
    
    if (price_max) {
      whereClause += ' AND p.price <= @price_max';
      request.input('price_max', sql.Decimal(18,2), parseFloat(price_max));
      console.log('Lọc theo giá tối đa:', price_max);
    }

    // Area range
    if (area_min) {
      whereClause += ' AND p.area >= @area_min';
      request.input('area_min', sql.Float, parseFloat(area_min));
      console.log('Lọc theo diện tích tối thiểu:', area_min);
    }
    
    if (area_max) {
      whereClause += ' AND p.area <= @area_max';
      request.input('area_max', sql.Float, parseFloat(area_max));
      console.log('Lọc theo diện tích tối đa:', area_max);
    }

    // Property details
    if (cleanPropertyType) {
      console.log('Lọc theo loại bất động sản (đã làm sạch):', cleanPropertyType);
      
      // So sánh chính xác từng loại để đảm bảo không có lỗi encoding
      let propertyTypeClause = '';
      if (cleanPropertyType === 'land') {
        propertyTypeClause = "p.property_type = 'land'";
      } else if (cleanPropertyType === 'apartment') {
        propertyTypeClause = "p.property_type = 'apartment'";
      } else if (cleanPropertyType === 'house') {
        propertyTypeClause = "p.property_type = 'house'";
      } else if (cleanPropertyType === 'villa') {
        propertyTypeClause = "p.property_type = 'villa'";
      } else {
        // Nếu không phải các giá trị chuẩn, dùng tham số
        propertyTypeClause = "p.property_type = @property_type";
        request.input('property_type', sql.NVarChar, cleanPropertyType);
      }
      
      whereClause += ` AND ${propertyTypeClause}`;
    }
    
    if (bedrooms) {
      whereClause += ' AND p.bedrooms >= @bedrooms';
      request.input('bedrooms', sql.Int, parseInt(bedrooms));
      console.log('Lọc theo số phòng ngủ:', bedrooms);
    }
    
    if (bathrooms) {
      whereClause += ' AND p.bathrooms >= @bathrooms';
      request.input('bathrooms', sql.Int, parseInt(bathrooms));
      console.log('Lọc theo số phòng tắm:', bathrooms);
    }
    
    if (parking_slots) {
      whereClause += ' AND p.parking_slots >= @parking_slots';
      request.input('parking_slots', sql.Int, parseInt(parking_slots));
      console.log('Lọc theo số chỗ đậu xe:', parking_slots);
    }
    
    if (status) {
      whereClause += ' AND p.status = @status';
      request.input('status', sql.NVarChar, status);
      console.log('Lọc theo trạng thái:', status);
    } else {
      // Mặc định chỉ hiện bất động sản còn available
      whereClause += ' AND p.status = @default_status';
      request.input('default_status', sql.NVarChar, 'available');
      console.log('Lọc mặc định: chỉ BĐS có trạng thái available');
    }

    // Amenities filter (multiple values possible)
    if (amenities) {
      const amenitiesList = amenities.split(',');
      whereClause += ' AND (';
      amenitiesList.forEach((amenity, index) => {
        if (index > 0) whereClause += ' OR ';
        whereClause += `p.amenities LIKE @amenity${index}`;
        request.input(`amenity${index}`, sql.NVarChar, `%${amenity.trim()}%`);
      });
      whereClause += ')';
      console.log('Lọc theo tiện ích:', amenities);
    }

    // Sorting
    const validSortColumns = ['price', 'area', 'created_at', 'bedrooms', 'bathrooms'];
    const validSortDirections = ['ASC', 'DESC'];
    
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
    const sortDir = validSortDirections.includes(sort_direction.toUpperCase()) ? sort_direction.toUpperCase() : 'DESC';
    
    orderByClause = ` ORDER BY p.${sortColumn} ${sortDir}`;
    console.log('Sắp xếp theo:', sortColumn, sortDir);

    console.log('Câu lệnh WHERE cuối cùng:', whereClause);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM Properties p
      LEFT JOIN Locations l ON p.location_id = l.id
      LEFT JOIN Users u ON p.owner_id = u.id
      ${whereClause}
    `;
    
    console.log('Thực thi truy vấn đếm...');
    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;
    const totalPages = Math.ceil(total / parseInt(limit));
    console.log(`Tổng số kết quả: ${total}, Tổng số trang: ${totalPages}`);

    // Main search query - updated to not select non-existent columns
    const query = `
      SELECT 
        p.*,
        l.address, l.city, l.district, l.ward, l.street, l.latitude, l.longitude,
        u.name as owner_name,
        (
          SELECT COUNT(*) 
          FROM Favorites f 
          WHERE f.property_id = p.id
        ) as favorite_count
      FROM Properties p
      LEFT JOIN Locations l ON p.location_id = l.id
      LEFT JOIN Users u ON p.owner_id = u.id
      ${whereClause}
      ${orderByClause}
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    console.log('Thực thi truy vấn tìm kiếm...');
    const result = await request.query(query);
    console.log(`Đã tìm thấy ${result.recordset.length} bất động sản`);
    
    // Kiểm tra các thuộc tính của bất động sản đầu tiên đã tìm được (nếu có)
    if (result.recordset.length > 0) {
      const firstProperty = result.recordset[0];
      console.log('Thông tin chi tiết bất động sản đầu tiên:', {
        id: firstProperty.id,
        title: firstProperty.title,
        property_type: firstProperty.property_type,
        city: firstProperty.city,
        city_name: firstProperty.city_name,
        district: firstProperty.district
      });
    }
    
    console.log('=========== KẾT THÚC TÌM KIẾM ===========\n');

    // Format the response
    res.json({
      success: true,
      message: 'Tìm kiếm bất động sản thành công',
      data: {
        properties: result.recordset.map(property => {
          // Parse images from JSON field
          let imageArray = [];
          try {
            if (property.images) {
              imageArray = JSON.parse(property.images);
            }
          } catch (error) {
            console.error('Error parsing images JSON:', error);
          }
          
          // Map city codes to names for frontend display
          let cityName = property.city || '';
          if (property.city === '1' || property.city === '01') {
            cityName = 'Hà Nội';
          } else if (property.city === '79') {
            cityName = 'Hồ Chí Minh';
          }
          
          return {
            ...property,
            images: imageArray,
            average_rating: 0, // Temporary until Reviews table is added
            favorite_count: property.favorite_count || 0,
            // Create location object with available fields
            location: {
              city: property.city || '',
              city_name: cityName, // Provide city_name based on city code
              district: property.district || '',
              district_name: property.district || '', // Use district as district_name
              ward: property.ward || '',
              ward_name: property.ward || '', // Use ward as ward_name
              address: property.address || '',
              street: property.street || '',
              latitude: property.latitude,
              longitude: property.longitude
            }
          };
        }),
        pagination: {
          total,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Lỗi khi tìm kiếm bất động sản:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
}

// Hàm trợ giúp debug: Hiển thị tất cả các giá trị city_name duy nhất trong cơ sở dữ liệu
async function displayUniqueCityNames(request) {
  try {
    const query = "SELECT DISTINCT city, city_name FROM Locations WHERE city_name IS NOT NULL";
    const result = await request.query(query);
    console.log("Danh sách thành phố trong cơ sở dữ liệu:");
    console.table(result.recordset);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách thành phố:", error);
  }
}

// Lấy chi tiết bất động sản
const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting property details for ID:', id);

    // Lấy thông tin cơ bản
    const propertyResult = await sql.query`
      SELECT p.*, l.*, u.name as owner_name, u.phone as owner_phone
      FROM Properties p
      JOIN Locations l ON p.location_id = l.id
      JOIN Users u ON p.owner_id = u.id
      WHERE p.id = ${id}
    `;

    if (propertyResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bất động sản'
      });
    }

    const property = propertyResult.recordset[0];
    console.log(`====== DEBUG PROPERTY IMAGES ======`);
    console.log('Property ID:', id);
    
    // Parse JSON images field
    let imageUrls = [];
    try {
      if (property.images) {
        imageUrls = JSON.parse(property.images);
      }
    } catch (error) {
      console.error('Error parsing images JSON:', error);
    }
    
    // Nếu không có ảnh, dùng ảnh chính hoặc mặc định
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      if (property.primary_image_url) {
        console.log('Using primary_image_url:', property.primary_image_url.substring(0, 50) + '...');
        imageUrls = [property.primary_image_url];
      } else {
        console.log('Using default image URL');
        imageUrls = ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1000&auto=format&fit=crop'];
      }
    }

    // Log coordinates for debugging
    console.log('DEBUG - Location coordinates from database:', {
      latitude: property.latitude,
      longitude: property.longitude
    });

    // Create a structured response that explicitly includes the location object
    const responseData = {
      success: true,
      message: 'Lấy chi tiết bất động sản thành công',
      data: {
        property: {
          ...property,
          // Add a structured location object that includes coordinates
          location: {
            address: property.address,
            city: property.city,
            city_name: property.city_name,
            district: property.district,
            district_name: property.district_name,
            ward: property.ward,
            ward_name: property.ward_name,
            street: property.street,
            latitude: property.latitude,
            longitude: property.longitude
          }
        },
        images: imageUrls
      }
    };
    
    // Đảm bảo không trả về trường images JSON trong property để tránh trùng lặp
    delete responseData.data.property.images;
    
    console.log('Response data structure:', JSON.stringify(responseData, null, 2));
    res.json(responseData);
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết bất động sản:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
}

// Add or remove property from favorites (toggle)
async function addToFavorites(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if property exists
    const propertyCheck = await sql.query`
      SELECT id FROM Properties WHERE id = ${id}
    `;

    if (propertyCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bất động sản'
      });
    }

    // Check if already in favorites
    const favoriteCheck = await sql.query`
      SELECT id FROM Favorites 
      WHERE property_id = ${id} AND user_id = ${userId}
    `;

    // If already in favorites, remove it
    if (favoriteCheck.recordset.length > 0) {
      const favoriteId = favoriteCheck.recordset[0].id;
      
      // Remove from favorites
      await sql.query`
        DELETE FROM Favorites 
        WHERE id = ${favoriteId}
      `;

      return res.json({
        success: true,
        message: 'Đã xóa khỏi danh sách yêu thích',
        action: 'removed'
      });
    }

    // Not in favorites, add it
    await sql.query`
      INSERT INTO Favorites (property_id, user_id, created_at)
      VALUES (${id}, ${userId}, GETDATE())
    `;

    res.status(201).json({
      success: true,
      message: 'Đã thêm vào danh sách yêu thích',
      action: 'added'
    });
  } catch (error) {
    console.error('Lỗi khi toggle yêu thích:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
}

// Remove property from favorites
async function removeFromFavorites(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Remove from favorites
    const result = await sql.query`
      DELETE FROM Favorites 
      WHERE property_id = ${id} AND user_id = ${userId}
    `;

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bất động sản trong danh sách yêu thích'
      });
    }

    res.json({
      success: true,
      message: 'Đã xóa khỏi danh sách yêu thích'
    });
  } catch (error) {
    console.error('Lỗi khi xóa khỏi yêu thích:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
}

// Get favorite properties
async function getFavoriteProperties(req, res) {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Create request object
    const request = new sql.Request();
    
    // Add pagination parameters
    request.input('userId', sql.Int, userId);
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, limit);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM Favorites f
      WHERE f.user_id = @userId
    `;
    
    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;
    const totalPages = Math.ceil(total / limit);

    // Get favorite properties with details
    const query = `
      SELECT 
        p.*,
        l.address, l.city, l.district, l.ward, l.street, l.latitude, l.longitude,
        u.name as owner_name,
        (
          SELECT COUNT(*) 
          FROM Favorites f2 
          WHERE f2.property_id = p.id
        ) as favorite_count,
        f.created_at as favorited_at
      FROM Favorites f
      JOIN Properties p ON f.property_id = p.id
      LEFT JOIN Locations l ON p.location_id = l.id
      LEFT JOIN Users u ON p.owner_id = u.id
      WHERE f.user_id = @userId
      ORDER BY f.created_at DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const result = await request.query(query);

    // Process the results, parse JSON images field
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
        image_url: property.primary_image_url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1000&auto=format&fit=crop',
        average_rating: 0, // Temporary until Reviews table is added
        favorite_count: property.favorite_count || 0
      };
    });

    res.json({
      success: true,
      message: 'Lấy danh sách bất động sản yêu thích thành công',
      data: {
        properties,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bất động sản yêu thích:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
}

// Report a property
const reportProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const userId = req.user.id;
    const { reason, details } = req.body;
    
    // Validate input
    if (!reason || !details) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp lý do và mô tả chi tiết'
      });
    }
    
    // Check if property exists
    const propertyCheck = await sql.query`
      SELECT id FROM Properties WHERE id = ${propertyId}
    `;
    
    if (propertyCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bất động sản'
      });
    }
    
    // Check if user has already reported this property
    const existingReport = await sql.query`
      SELECT id FROM PropertyReports 
      WHERE property_id = ${propertyId} AND user_id = ${userId}
    `;
    
    if (existingReport.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã báo cáo tin đăng này trước đó'
      });
    }
    
    // Insert new report
    await sql.query`
      INSERT INTO PropertyReports (property_id, user_id, reason, details, status, created_at)
      VALUES (${propertyId}, ${userId}, ${reason}, ${req.body.details}, 'pending', GETDATE())
    `;
    
    // Notify admin (optional)
    // TODO: Add notification logic here
    
    res.status(201).json({
      success: true,
      message: 'Báo cáo đã được gửi thành công'
    });
  } catch (error) {
    console.error('Error reporting property:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Gia hạn tin đăng đã hết hạn
async function renewProperty(req, res) {
  try {
    // Lấy property ID từ URL parameter
    const propertyId = req.params.id;
    
    // Lấy user ID từ token
    const userId = req.user.id;
    
    // Kiểm tra property tồn tại và thuộc về user hiện tại
    const checkQuery = `
      SELECT * FROM Properties
      WHERE id = @propertyId AND owner_id = @userId
    `;
    
    const request = new sql.Request();
    request.input('propertyId', sql.Int, propertyId);
    request.input('userId', sql.Int, userId);
    
    const propertyResult = await request.query(checkQuery);
    
    if (propertyResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin đăng hoặc bạn không có quyền gia hạn tin này'
      });
    }
    
    const property = propertyResult.recordset[0];
    
    // Tính toán ngày hết hạn mới (thêm 10 ngày từ ngày hiện tại)
    const newExpirationDate = new Date();
    newExpirationDate.setDate(newExpirationDate.getDate() + 10);
    
    // Cập nhật trạng thái tin đăng và ngày hết hạn
    const updateQuery = `
      UPDATE Properties
      SET
        status = 'available',
        expires_at = @newExpirationDate,
        updated_at = GETDATE()
      WHERE id = @propertyId
    `;
    
    request.input('newExpirationDate', sql.DateTime, newExpirationDate);
    
    const updateResult = await request.query(updateQuery);
    
    if (updateResult.rowsAffected[0] === 0) {
      return res.status(500).json({
        success: false,
        message: 'Không thể gia hạn tin đăng'
      });
    }
    
    // Trả về thông tin cập nhật thành công
    res.json({
      success: true,
      message: 'Gia hạn tin đăng thành công',
      data: {
        property_id: propertyId,
        new_expiration_date: newExpirationDate,
        status: 'available'
      }
    });
  } catch (error) {
    console.error('Lỗi khi gia hạn tin đăng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
}

// Export all controllers
module.exports = {
  authenticateToken,
  getProperties,
  getPropertyById,
  addProperty,
  updateProperty,
  deleteProperty,
  searchProperties,
  addToFavorites,
  removeFromFavorites,
  getFavoriteProperties,
  createProperty,
  reportProperty,
  renewProperty
};