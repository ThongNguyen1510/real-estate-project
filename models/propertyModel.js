const { sql } = require('../config/database');

// Hàm lấy thông tin cơ bản và owner_id của property bằng ID
const findPropertyOwnerById = async (id) => {
    try {
        const result = await sql.query`
            SELECT id, owner_id, title
            FROM Properties
            WHERE id = ${id}
        `;
        return result.recordset[0]; // Trả về property hoặc undefined nếu không tìm thấy
    } catch (error) {
        console.error('Lỗi findPropertyOwnerById:', error);
        throw error;
    }
};

// (Có thể thêm các hàm khác để quản lý Properties ở đây sau này)
// ví dụ: getAllProperties, createProperty, updateProperty, ...

module.exports = {
    findPropertyOwnerById,
    // Xuất các hàm khác nếu có
}; 