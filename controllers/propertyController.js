const { connectToDatabase, sql } = require('../config/database');
const jwt = require("jsonwebtoken");

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

    // Filter by status instead of listing_type if provided
    if (req.query.listing_type) {
      // Map listing_type to status if needed or use separate status filter
      const statusMap = {
        'rent': 'for_rent',
        'sale': 'for_sale'
      };
      const status = statusMap[req.query.listing_type] || req.query.listing_type;
      whereClause += ' AND p.status = @status';
      request.input('status', sql.NVarChar, status);
    } else if (req.query.status) {
      whereClause += ' AND p.status = @status';
      request.input('status', sql.NVarChar, req.query.status);
    }

    // Add pagination parameters
    request.input('offset', sql.Int, offset);
    request.input('fetch', sql.Int, limit);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM Properties p
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
    status 
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
    const validPropertyTypes = ['house', 'apartment', 'land', 'commercial'];
    
    // Log giá trị ban đầu để debug
    console.log("DEBUG - Received property_type:", property_type);
    console.log("DEBUG - Received property_type type:", typeof property_type);
    
    // Chuyển đổi loại bất động sản tiếng Việt sang tiếng Anh
    let normalizedPropertyType = property_type;
    if (property_type) {
      // Map tiếng Việt sang tiếng Anh
      const propertyTypeMap = {
        'nhà riêng': 'house',
        'biệt thự': 'house',
        'căn hộ chung cư': 'apartment',
        'chung cư': 'apartment',
        'căn hộ': 'apartment',
        'đất nền': 'land',
        'đất': 'land',
        'văn phòng': 'commercial',
        'mặt bằng kinh doanh': 'commercial',
        'biệt thự': 'house',
        'biet thu': 'house',
        // Thêm các giá trị trực tiếp từ UI
        'Biệt thự': 'house', 
        'Căn hộ chung cư': 'apartment',
        'Nhà riêng': 'house',
        'Đất nền': 'land',
        'Văn phòng': 'commercial',
        'Mặt bằng kinh doanh': 'commercial',
        // Thêm các giá trị tiếng Anh từ UI
        'villa': 'house',
        'house': 'house',
        'apartment': 'apartment',
        'land': 'land',
        'office': 'commercial',
        'commercial': 'commercial'
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
          normalizedPropertyType = 'house';
        } else if (normalizedInput.includes('căn hộ') || normalizedInput.includes('chung cư') || normalizedInput.includes('can ho') || normalizedInput.includes('apartment')) {
          normalizedPropertyType = 'apartment';
        } else if (normalizedInput.includes('đất') || normalizedInput.includes('dat') || normalizedInput.includes('land')) {
          normalizedPropertyType = 'land';
        } else if (normalizedInput.includes('văn phòng') || normalizedInput.includes('thương mại') || normalizedInput.includes('kinh doanh') || normalizedInput.includes('office') || normalizedInput.includes('commercial')) {
          normalizedPropertyType = 'commercial';
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

    // Validate status according to schema constraints
    const validStatusTypes = ['available', 'rented', 'sold', 'maintenance'];
    let propertyStatus = status || 'available';
    if (status && !validStatusTypes.includes(status)) {
      propertyStatus = 'available'; // Fallback to default if invalid
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

      // Xử lý tọa độ đặc biệt - đảm bảo có giá trị
      // Gán giá trị cố định cho Hà Nội nếu không có tọa độ
      let latitude = 21.0285;  // Giá trị mặc định cho Hà Nội
      let longitude = 105.8542; // Giá trị mặc định cho Hà Nội
      
      // Chỉ ghi đè nếu có giá trị hợp lệ
      if (typeof location.latitude === 'number' && !isNaN(location.latitude)) {
        latitude = location.latitude;
      } else if (typeof location.latitude === 'string' && !isNaN(parseFloat(location.latitude))) {
        latitude = parseFloat(location.latitude);
      }
      
      if (typeof location.longitude === 'number' && !isNaN(location.longitude)) {
        longitude = location.longitude;
      } else if (typeof location.longitude === 'string' && !isNaN(parseFloat(location.longitude))) {
        longitude = parseFloat(location.longitude);
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
        request.input('latitude', sql.Decimal(9,6), latitude);
        request.input('longitude', sql.Decimal(9,6), longitude);

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

      const propertyQuery = `
        INSERT INTO Properties (
          title, description, price, area, property_type, bedrooms,
          bathrooms, parking_slots, amenities, owner_id, location_id,
          status, images, primary_image_url
        )
        VALUES (
          @title, @description, @price, @area, @property_type,
          @bedrooms, @bathrooms, @parking_slots, @amenities,
          @owner_id, @location_id, @status, @images, @primary_image_url
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
          created_at: new Date().toISOString() 
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
  const { title, description, price, area, property_type, bedrooms, bathrooms, parking_slots, amenities, location, images, status } = req.body;
  
  try {
    console.log('Updating property:', id);
    console.log('Request body:', req.body);
    console.log('Status value received:', status, 'Type:', typeof status);
    
    const userId = req.user.id;

    // Kiểm tra quyền sở hữu
    const checkResult = await sql.query`
      SELECT owner_id, status as current_status FROM Properties WHERE id = ${id}
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

    // Current status from database
    const currentStatus = checkResult.recordset[0].current_status;
    console.log('Current status in database:', currentStatus);

    // Start a transaction
    const transaction = new sql.Transaction();
    await transaction.begin();
    const request = new sql.Request(transaction);

    try {
      // Handle location update
      if (location) {
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
          // Update existing location
          await request.query`
            UPDATE Locations
            SET address = ${location.address},
                city = ${location.city},
                district = ${location.district},
                ward = ${location.ward},
                street = ${location.street},
                latitude = ${location.latitude || 21.0285},
                longitude = ${location.longitude || 105.8542}
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

      // Cập nhật thông tin bất động sản
      await request.query`
        UPDATE Properties
        SET title = ${title},
            description = ${description},
            price = ${price},
            area = ${area},
            property_type = ${property_type},
            bedrooms = ${bedrooms},
            bathrooms = ${bathrooms},
            parking_slots = ${parking_slots},
            amenities = ${amenities},
            status = ${validStatus}
        WHERE id = ${id}
      `;

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

// Advanced search properties
async function searchProperties(req, res) {
  try {
  const {
      // Location filters
    city,
    district,
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
    property_type,
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

    // Create request object
    const request = new sql.Request();
    
    // Calculate offset for pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, parseInt(limit));

    // Build base query
    let whereClause = 'WHERE 1=1';
    let orderByClause = '';

    // Keyword search in title and description
    if (keyword) {
      whereClause += ` AND (
        p.title LIKE @keyword 
        OR p.description LIKE @keyword
        OR l.address LIKE @keyword
        OR l.street LIKE @keyword
      )`;
      request.input('keyword', sql.NVarChar, `%${keyword}%`);
    }

    // Location filters
    if (city) {
      whereClause += ' AND l.city = @city';
      request.input('city', sql.NVarChar, city);
    }
    if (district) {
      whereClause += ' AND l.district = @district';
      request.input('district', sql.NVarChar, district);
    }
    if (ward) {
      whereClause += ' AND l.ward = @ward';
      request.input('ward', sql.NVarChar, ward);
    }

    // Price range
    if (price_min) {
      whereClause += ' AND p.price >= @price_min';
      request.input('price_min', sql.Decimal(18,2), parseFloat(price_min));
    }
    if (price_max) {
      whereClause += ' AND p.price <= @price_max';
      request.input('price_max', sql.Decimal(18,2), parseFloat(price_max));
    }

    // Area range
    if (area_min) {
      whereClause += ' AND p.area >= @area_min';
      request.input('area_min', sql.Float, parseFloat(area_min));
    }
    if (area_max) {
      whereClause += ' AND p.area <= @area_max';
      request.input('area_max', sql.Float, parseFloat(area_max));
    }

    // Property details
    if (bedrooms) {
      whereClause += ' AND p.bedrooms = @bedrooms';
      request.input('bedrooms', sql.Int, parseInt(bedrooms));
    }
    if (bathrooms) {
      whereClause += ' AND p.bathrooms = @bathrooms';
      request.input('bathrooms', sql.Int, parseInt(bathrooms));
    }
    if (property_type) {
      whereClause += ' AND p.property_type = @property_type';
      request.input('property_type', sql.NVarChar, property_type);
    }
    if (parking_slots) {
      whereClause += ' AND p.parking_slots >= @parking_slots';
      request.input('parking_slots', sql.Int, parseInt(parking_slots));
    }
    if (status) {
      whereClause += ' AND p.status = @status';
      request.input('status', sql.NVarChar, status);
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
    }

    // Sorting
    const validSortColumns = ['price', 'area', 'created_at', 'bedrooms', 'bathrooms'];
    const validSortDirections = ['ASC', 'DESC'];
    
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
    const sortDir = validSortDirections.includes(sort_direction.toUpperCase()) ? sort_direction.toUpperCase() : 'DESC';
    
    orderByClause = ` ORDER BY p.${sortColumn} ${sortDir}`;

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM Properties p
      LEFT JOIN Locations l ON p.location_id = l.id
      LEFT JOIN Users u ON p.owner_id = u.id
      ${whereClause}
    `;
    
    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;
    const totalPages = Math.ceil(total / parseInt(limit));

    // Main search query
    const query = `
      SELECT 
        p.*,
        l.address, l.city, l.district, l.ward, l.street, l.latitude, l.longitude,
        u.name as owner_name,
        (
          SELECT STRING_AGG(image_url, ',')
          FROM PropertyImages pi
          WHERE pi.property_id = p.id
        ) as images,
        (
          SELECT COUNT(*) 
          FROM Favorites f 
          WHERE f.property_id = p.id
        ) as favorite_count,
        (
          SELECT AVG(CAST(rating as FLOAT))
          FROM Reviews r
          WHERE r.property_id = p.id
        ) as average_rating
      FROM Properties p
      LEFT JOIN Locations l ON p.location_id = l.id
      LEFT JOIN Users u ON p.owner_id = u.id
      ${whereClause}
      ${orderByClause}
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const result = await request.query(query);

    // Format the response
    res.json({
      success: true,
      message: 'Tìm kiếm bất động sản thành công',
      data: {
        properties: result.recordset.map(property => ({
          ...property,
          images: property.images ? property.images.split(',') : [],
          average_rating: property.average_rating || 0,
          favorite_count: property.favorite_count || 0
        })),
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
        console.log('Parsed images from JSON field, found:', imageUrls.length);
        if (imageUrls.length > 0) {
          console.log('First image URL:', imageUrls[0].substring(0, 50) + '...');
        }
      } else {
        console.log('No images JSON field found');
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

    const responseData = {
      success: true,
      message: 'Lấy chi tiết bất động sản thành công',
      data: {
        property,
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

// Add property to favorites
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

    if (favoriteCheck.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bất động sản đã có trong danh sách yêu thích'
      });
    }

    // Add to favorites
    await sql.query`
      INSERT INTO Favorites (property_id, user_id)
      VALUES (${id}, ${userId})
    `;

    res.status(201).json({
      success: true,
      message: 'Đã thêm vào danh sách yêu thích'
    });
  } catch (error) {
    console.error('Lỗi khi thêm vào yêu thích:', error);
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
        (
          SELECT AVG(CAST(rating as FLOAT))
          FROM Reviews r
          WHERE r.property_id = p.id
        ) as average_rating,
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
        average_rating: property.average_rating || 0,
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
  createProperty
};