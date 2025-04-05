const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');
const sql = require('mssql');
const { v4: uuidv4 } = require('uuid');

// Upload một hình ảnh
exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Upload lên Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'real-estate',
            resource_type: 'auto'
        });

        // Xóa file tạm
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            success: true,
            data: {
                url: result.secure_url,
                public_id: result.public_id
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Upload nhiều hình ảnh
exports.uploadMultipleImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const uploadPromises = req.files.map(file => {
            return cloudinary.uploader.upload(file.path, {
                folder: 'real-estate',
                resource_type: 'auto'
            });
        });

        const results = await Promise.all(uploadPromises);

        // Xóa các file tạm
        req.files.forEach(file => {
            fs.unlinkSync(file.path);
        });

        res.status(200).json({
            success: true,
            data: results.map(result => ({
                url: result.secure_url,
                public_id: result.public_id
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Upload images for a property
async function uploadImages(req, res) {
  try {
    const { property_id } = req.params;
    const { images } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp ít nhất một hình ảnh'
      });
    }

    // Kiểm tra bất động sản tồn tại
    const request = new sql.Request();
    request.input('propertyId', sql.Int, property_id);
    
    const propertyCheck = await request.query`
      SELECT id FROM Properties WHERE id = @propertyId
    `;

    if (propertyCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bất động sản'
      });
    }

    // Thêm hình ảnh vào database
    for (let i = 0; i < images.length; i++) {
      const imageRequest = new sql.Request();
      imageRequest.input('propertyId', sql.Int, property_id);
      imageRequest.input('imageUrl', sql.NVarChar, images[i]);
      imageRequest.input('isPrimary', sql.Bit, i === 0);
      
      await imageRequest.query`
        INSERT INTO PropertyImages (property_id, image_url, is_primary)
        VALUES (@propertyId, @imageUrl, @isPrimary)
      `;
    }

    res.status(201).json({
      success: true,
      message: 'Thêm hình ảnh thành công',
      data: {
        property_id,
        images
      }
    });
  } catch (error) {
    console.error('Lỗi khi thêm hình ảnh:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
}

// Get all images of a property
async function getPropertyImages(req, res) {
  try {
    const { property_id } = req.params;
    const request = new sql.Request();
    request.input('propertyId', sql.Int, property_id);

    const result = await request.query`
      SELECT id, image_url, is_primary, created_at
      FROM PropertyImages
      WHERE property_id = @propertyId
      ORDER BY is_primary DESC, created_at ASC
    `;

    res.json({
      success: true,
      message: 'Lấy danh sách hình ảnh thành công',
      data: result.recordset
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách hình ảnh:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
}

// Delete an image
async function deleteImage(req, res) {
  try {
    const { property_id, image_id } = req.params;
    const request = new sql.Request();
    
    request.input('propertyId', sql.Int, property_id);
    request.input('imageId', sql.Int, image_id);
    
    // Kiểm tra hình ảnh tồn tại
    const imageCheck = await request.query`
      SELECT id, is_primary 
      FROM PropertyImages 
      WHERE id = @imageId AND property_id = @propertyId
    `;

    if (imageCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hình ảnh'
      });
    }

    // Nếu xóa ảnh chính, cập nhật ảnh chính mới
    if (imageCheck.recordset[0].is_primary) {
      await request.query`
        UPDATE TOP(1) PropertyImages
        SET is_primary = 1
        WHERE property_id = @propertyId 
        AND id != @imageId
      `;
    }

    // Xóa hình ảnh
    await request.query`
      DELETE FROM PropertyImages
      WHERE id = @imageId AND property_id = @propertyId
    `;

    res.json({
      success: true,
      message: 'Xóa hình ảnh thành công'
    });
  } catch (error) {
    console.error('Lỗi khi xóa hình ảnh:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
}

// Set primary image
async function setPrimaryImage(req, res) {
  try {
    const { property_id, image_id } = req.params;
    const request = new sql.Request();
    
    request.input('propertyId', sql.Int, property_id);
    request.input('imageId', sql.Int, image_id);
    
    // Kiểm tra hình ảnh tồn tại
    const imageCheck = await request.query`
      SELECT id 
      FROM PropertyImages 
      WHERE id = @imageId AND property_id = @propertyId
    `;

    if (imageCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hình ảnh'
      });
    }

    // Cập nhật ảnh chính
    await request.query`
      UPDATE PropertyImages
      SET is_primary = 0
      WHERE property_id = @propertyId
    `;

    await request.query`
      UPDATE PropertyImages
      SET is_primary = 1
      WHERE id = @imageId AND property_id = @propertyId
    `;

    res.json({
      success: true,
      message: 'Cập nhật ảnh chính thành công'
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật ảnh chính:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
}

module.exports = {
  uploadImages,
  getPropertyImages,
  deleteImage,
  setPrimaryImage
}; 