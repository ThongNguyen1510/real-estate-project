/**
 * File này chứa các hàm helper để kiểm tra và sửa chữa các vấn đề liên quan đến tải lên hình ảnh
 * Các chức năng chính:
 * 1. Kiểm tra và xác thực URL hình ảnh
 * 2. Bổ sung tính năng logging với debug để theo dõi quá trình tải lên ảnh
 * 3. Thêm các xử lý lỗi và fallback cho các trường hợp có vấn đề
 */

const axios = require('axios');
const sql = require('mssql');
const dbConfig = require('../config/dbConfig');

// Kiểm tra một URL có tồn tại và có phải hình ảnh không
async function validateImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    // Loại bỏ các URL null, undefined, rỗng
    if (!url.trim()) {
      return false;
    }
    
    // Kiểm tra định dạng URL
    if (!url.match(/^https?:\/\//i)) {
      console.log(`URL không hợp lệ: ${url}`);
      return false;
    }
    
    // Thử thực hiện request HEAD để kiểm tra URL tồn tại và là ảnh
    const response = await axios.head(url, { 
      timeout: 5000,
      validateStatus: status => status < 400 
    });
    
    // Kiểm tra Content-Type
    const contentType = response.headers['content-type'];
    if (contentType && contentType.startsWith('image/')) {
      return true;
    } else {
      console.log(`URL không phải hình ảnh: ${url}, Content-Type: ${contentType}`);
      return false;
    }
  } catch (error) {
    console.error(`Lỗi kiểm tra URL ${url}:`, error.message);
    return false;
  }
}

// Kiểm tra trạng thái bảng PropertyImages
async function checkPropertyImagesTable() {
  try {
    await sql.connect(dbConfig);
    
    // Kiểm tra bảng có tồn tại không
    const tableCheck = await sql.query`
      SELECT COUNT(*) AS tableExists 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'PropertyImages'
    `;
    
    if (tableCheck.recordset[0].tableExists === 0) {
      console.log('Bảng PropertyImages không tồn tại');
      return false;
    }
    
    // Kiểm tra số lượng bản ghi
    const countQuery = await sql.query`
      SELECT COUNT(*) AS recordCount FROM PropertyImages
    `;
    
    console.log(`Số lượng ảnh trong database: ${countQuery.recordset[0].recordCount}`);
    
    // Kiểm tra bất động sản không có ảnh
    const propertiesWithoutImages = await sql.query`
      SELECT p.id, p.title 
      FROM Properties p
      LEFT JOIN PropertyImages pi ON p.id = pi.property_id
      WHERE pi.id IS NULL
    `;
    
    console.log(`Số bất động sản không có ảnh: ${propertiesWithoutImages.recordset.length}`);
    
    return {
      tableExists: true,
      recordCount: countQuery.recordset[0].recordCount,
      propertiesWithoutImages: propertiesWithoutImages.recordset
    };
  } catch (error) {
    console.error('Lỗi kiểm tra bảng PropertyImages:', error);
    return false;
  } finally {
    await sql.close();
  }
}

// Sửa chữa các bất động sản không có ảnh
async function fixPropertiesWithoutImages() {
  try {
    await sql.connect(dbConfig);
    
    // Lấy các bất động sản không có ảnh
    const propertiesWithoutImages = await sql.query`
      SELECT p.id, p.title 
      FROM Properties p
      LEFT JOIN PropertyImages pi ON p.id = pi.property_id
      WHERE pi.id IS NULL
    `;
    
    console.log(`Đang sửa chữa ${propertiesWithoutImages.recordset.length} bất động sản không có ảnh...`);
    
    // Thêm ảnh mặc định cho các bất động sản này
    for (const property of propertiesWithoutImages.recordset) {
      await sql.query`
        INSERT INTO PropertyImages (property_id, image_url, is_primary, created_at)
        VALUES (
          ${property.id}, 
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1000&auto=format&fit=crop', 
          1, 
          GETDATE()
        )
      `;
      
      console.log(`Đã thêm ảnh mặc định cho bất động sản ID: ${property.id}, Tiêu đề: ${property.title}`);
    }
    
    console.log('Đã sửa chữa xong tất cả bất động sản không có ảnh');
    return true;
  } catch (error) {
    console.error('Lỗi sửa chữa bất động sản không có ảnh:', error);
    return false;
  } finally {
    await sql.close();
  }
}

// Xuất các hàm để sử dụng
module.exports = {
  validateImageUrl,
  checkPropertyImagesTable,
  fixPropertiesWithoutImages
}; 