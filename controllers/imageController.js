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
    
    // Check if files exist in the request
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp ít nhất một hình ảnh'
      });
    }

    console.log('Received files:', req.files.length);

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

    // Upload the images to server/cloud storage
    const uploadPromises = req.files.map(file => {
      return cloudinary.uploader.upload(file.path, {
        folder: 'real-estate',
        resource_type: 'auto'
      });
    });

    // Wait for all uploads to complete
    const uploadResults = await Promise.all(uploadPromises);
    
    // Clean up temporary files
    req.files.forEach(file => {
      fs.unlinkSync(file.path);
    });

    // Get the image URLs from the upload results
    const imageUrls = uploadResults.map(result => result.secure_url);
    
    // Chuẩn bị JSON cho trường images
    const imagesJson = JSON.stringify(imageUrls);
    const primaryImageUrl = imageUrls[0]; // Sử dụng ảnh đầu tiên làm ảnh chính
    
    // Cập nhật Properties với trường images JSON
    request.input('imagesJson', sql.NVarChar, imagesJson);
    request.input('primaryImageUrl', sql.NVarChar, primaryImageUrl);
    
    await request.query`
      UPDATE Properties
      SET images = @imagesJson,
          primary_image_url = @primaryImageUrl
      WHERE id = @propertyId
    `;

    console.log('Updated property with images:', {
      property_id,
      images_count: imageUrls.length,
      primary_image: primaryImageUrl
    });

    res.status(201).json({
      success: true,
      message: 'Thêm hình ảnh thành công',
      data: {
        property_id,
        images: imageUrls
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
      SELECT id, images, primary_image_url
      FROM Properties
      WHERE id = @propertyId
    `;

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bất động sản'
      });
    }

    const property = result.recordset[0];
    let imageArray = [];

    // Parse JSON images field
    if (property.images) {
      try {
        imageArray = JSON.parse(property.images);
      } catch (error) {
        console.error('Error parsing images JSON:', error);
      }
    }

    // If no images found, use primary image if available
    if (imageArray.length === 0 && property.primary_image_url) {
      imageArray = [property.primary_image_url];
    }

    res.json({
      success: true,
      message: 'Lấy danh sách hình ảnh thành công',
      data: imageArray.map((url, index) => ({
        id: index + 1,
        image_url: url,
        is_primary: index === 0,
        property_id: parseInt(property_id)
      }))
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
    
    // Get the property with images
    const propertyResult = await request.query`
      SELECT images, primary_image_url
      FROM Properties 
      WHERE id = @propertyId
    `;

    if (propertyResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bất động sản'
      });
    }

    const property = propertyResult.recordset[0];
    let imageArray = [];
    
    // Parse images JSON
    if (property.images) {
      try {
        imageArray = JSON.parse(property.images);
      } catch (error) {
        console.error('Error parsing images JSON:', error);
      }
    }

    // Convert image_id to index (0-based)
    const imageIndex = parseInt(image_id) - 1;
    
    // Check if the image index is valid
    if (imageIndex < 0 || imageIndex >= imageArray.length) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hình ảnh'
      });
    }

    // Get the URL of the image to be deleted
    const deletedImageUrl = imageArray[imageIndex];
    
    // Remove the image from the array
    imageArray.splice(imageIndex, 1);

    // Check if we deleted the primary image
    const isPrimaryImage = property.primary_image_url === deletedImageUrl;
    
    // Update the primary image if needed
    let primaryImageUrl = property.primary_image_url;
    if (isPrimaryImage && imageArray.length > 0) {
      primaryImageUrl = imageArray[0];
    } else if (imageArray.length === 0) {
      primaryImageUrl = null;
    }

    // Update the property with the new images array
    request.input('imagesJson', sql.NVarChar, JSON.stringify(imageArray));
    request.input('primaryImageUrl', sql.NVarChar, primaryImageUrl);
    
    await request.query`
      UPDATE Properties
      SET images = @imagesJson,
          primary_image_url = @primaryImageUrl
      WHERE id = @propertyId
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
    
    // Get the property with images
    const propertyResult = await request.query`
      SELECT images, primary_image_url
      FROM Properties 
      WHERE id = @propertyId
    `;

    if (propertyResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bất động sản'
      });
    }

    const property = propertyResult.recordset[0];
    let imageArray = [];
    
    // Parse images JSON
    if (property.images) {
      try {
        imageArray = JSON.parse(property.images);
      } catch (error) {
        console.error('Error parsing images JSON:', error);
      }
    }

    // Convert image_id to index (0-based)
    const imageIndex = parseInt(image_id) - 1;
    
    // Check if the image index is valid
    if (imageIndex < 0 || imageIndex >= imageArray.length) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hình ảnh'
      });
    }

    // Get the new primary image URL
    const newPrimaryImageUrl = imageArray[imageIndex];
    
    // No need to reorder the array, just update the primary_image_url
    
    // Update the property with the new primary image
    request.input('primaryImageUrl', sql.NVarChar, newPrimaryImageUrl);
    
    await request.query`
      UPDATE Properties
      SET primary_image_url = @primaryImageUrl
      WHERE id = @propertyId
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