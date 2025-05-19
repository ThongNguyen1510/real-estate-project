const {
    getUsers,
    updateUserStatus,
    deleteUserById,
    getProperties,
    updatePropertyStatus,
    getReports,
    updateReportStatus,
    getStatistics
} = require('../models/adminModel');

// Lấy danh sách người dùng
const listUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const result = await getUsers(parseInt(page), parseInt(limit), search);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Lỗi list users:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Cập nhật trạng thái người dùng
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;

        if (!status || !['active', 'inactive', 'banned'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ'
            });
        }

        const updated = await updateUserStatus(userId, status);
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        res.json({
            success: true,
            message: 'Đã cập nhật trạng thái người dùng'
        });
    } catch (error) {
        console.error('Lỗi update user:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Xóa người dùng
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Ngăn chặn xóa tài khoản admin
        const userToDelete = await getUsers(1, 1, '', userId);
        if (userToDelete.users && userToDelete.users.length > 0 && userToDelete.users[0].role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không thể xóa tài khoản quản trị viên'
            });
        }
        
        const deleted = await deleteUserById(userId);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        res.json({
            success: true,
            message: 'Đã xóa người dùng thành công'
        });
    } catch (error) {
        console.error('Lỗi delete user:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Lấy danh sách bất động sản
const listProperties = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const result = await getProperties(parseInt(page), parseInt(limit), search);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Lỗi list properties:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Cập nhật trạng thái bất động sản
const updateProperty = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { status } = req.body;

        if (!status || !['available', 'rented', 'sold', 'maintenance'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ'
            });
        }

        const updated = await updatePropertyStatus(propertyId, status);
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bất động sản'
            });
        }

        res.json({
            success: true,
            message: 'Đã cập nhật trạng thái bất động sản'
        });
    } catch (error) {
        console.error('Lỗi update property:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Lấy danh sách báo cáo
const listReports = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = '' } = req.query;
        const result = await getReports(parseInt(page), parseInt(limit), status);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Lỗi list reports:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Cập nhật trạng thái báo cáo
const updateReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status, admin_response } = req.body;

        if (!status || !['pending', 'investigating', 'resolved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ'
            });
        }

        const updated = await updateReportStatus(reportId, status, admin_response);
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy báo cáo'
            });
        }

        res.json({
            success: true,
            message: 'Đã cập nhật trạng thái báo cáo'
        });
    } catch (error) {
        console.error('Lỗi update report:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Lấy thống kê hệ thống
const getStats = async (req, res) => {
    try {
        const stats = await getStatistics();
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Lỗi get stats:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Get all property reports with pagination
const getPropertyReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    
    // Create a request object
    const request = new sql.Request();
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, limit);
    
    // Base query
    let query = `
      SELECT 
        r.id, r.property_id, r.user_id, r.reason, r.description, 
        r.status, r.admin_notes, r.created_at, r.updated_at,
        p.title as property_title,
        u.name as user_name
      FROM 
        PropertyReports r
      LEFT JOIN 
        Properties p ON r.property_id = p.id
      LEFT JOIN 
        Users u ON r.user_id = u.id
    `;
    
    // Add status filter if provided
    if (status) {
      query += ` WHERE r.status = @status`;
      request.input('status', sql.NVarChar, status);
    }
    
    // Add ordering and pagination
    query += `
      ORDER BY r.created_at DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;
    
    const result = await request.query(query);
    
    // Count total reports
    let countQuery = `SELECT COUNT(*) as total FROM PropertyReports`;
    if (status) {
      countQuery += ` WHERE status = @status`;
    }
    
    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;
    
    res.json({
      success: true,
      data: {
        reports: result.recordset,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          total_pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting property reports:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Get a specific property report by ID
const getPropertyReportById = async (req, res) => {
  try {
    const reportId = req.params.id;
    
    const result = await sql.query`
      SELECT 
        r.id, r.property_id, r.user_id, r.reason, r.description, 
        r.status, r.admin_notes, r.created_at, r.updated_at,
        p.title as property_title,
        u.name as user_name
      FROM 
        PropertyReports r
      LEFT JOIN 
        Properties p ON r.property_id = p.id
      LEFT JOIN 
        Users u ON r.user_id = u.id
      WHERE 
        r.id = ${reportId}
    `;
    
    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy báo cáo'
      });
    }
    
    res.json({
      success: true,
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Error getting property report:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Update a property report
const updatePropertyReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const { status, admin_notes } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }
    
    // Check if report exists
    const checkReport = await sql.query`
      SELECT id FROM PropertyReports WHERE id = ${reportId}
    `;
    
    if (checkReport.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy báo cáo'
      });
    }
    
    // Update report
    await sql.query`
      UPDATE PropertyReports
      SET 
        status = ${status},
        admin_notes = ${admin_notes},
        updated_at = GETDATE()
      WHERE id = ${reportId}
    `;
    
    res.json({
      success: true,
      message: 'Cập nhật báo cáo thành công'
    });
  } catch (error) {
    console.error('Error updating property report:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Delete a property report
const deletePropertyReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    
    // Check if report exists
    const checkReport = await sql.query`
      SELECT id FROM PropertyReports WHERE id = ${reportId}
    `;
    
    if (checkReport.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy báo cáo'
      });
    }
    
    // Delete report
    await sql.query`
      DELETE FROM PropertyReports WHERE id = ${reportId}
    `;
    
    res.json({
      success: true,
      message: 'Xóa báo cáo thành công'
    });
  } catch (error) {
    console.error('Error deleting property report:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

module.exports = {
    listUsers,
    updateUser,
    deleteUser,
    listProperties,
    updateProperty,
    listReports,
    updateReport,
    getStats,
    getPropertyReports,
    getPropertyReportById,
    updatePropertyReport,
    deletePropertyReport
}; 