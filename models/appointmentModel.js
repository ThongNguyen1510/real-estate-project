const { sql } = require('../config/database');

// Lấy danh sách lịch hẹn (cho user hoặc agent)
const getAppointments = async (filters = {}) => {
    try {
        let query = `
            SELECT 
                a.*,
                u.name as user_name,
                u.email as user_email,
                u.phone as user_phone,
                p.title as property_title,
                ag.name as agent_name,
                a.user_notes,
                a.agent_notes
            FROM Appointments a
            JOIN Users u ON a.user_id = u.id
            JOIN Properties p ON a.property_id = p.id
            JOIN Users ag ON a.agent_id = ag.id
            WHERE 1=1
        `;
        const request = new sql.Request();

        if (filters.userId) {
            query += ` AND a.user_id = @userId`;
            request.input('userId', sql.Int, filters.userId);
        }

        if (filters.agentId) {
            query += ` AND a.agent_id = @agentId`;
            request.input('agentId', sql.Int, filters.agentId);
        }

        if (filters.status) {
            query += ` AND a.status = @status`;
            request.input('status', sql.VarChar, filters.status);
        }

        if (filters.date) { // Lọc theo ngày cụ thể
            query += ` AND CONVERT(date, a.appointment_time) = @date`;
            request.input('date', sql.Date, filters.date);
        }

        if (filters.upcoming) { // Lọc lịch hẹn sắp tới (từ bây giờ)
            query += ` AND a.appointment_time >= GETDATE()`;
        }

        query += ` ORDER BY a.appointment_time ASC`;

        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        console.error('Lỗi getAppointments:', error);
        throw error;
    }
};

// Lấy chi tiết lịch hẹn
const getAppointmentById = async (id) => {
    try {
        const result = await sql.query`
            SELECT 
                a.*,
                u.name as user_name,
                u.email as user_email,
                u.phone as user_phone,
                p.title as property_title,
                ag.name as agent_name,
                ag.email as agent_email,
                ag.phone as agent_phone,
                a.user_notes,
                a.agent_notes
            FROM Appointments a
            JOIN Users u ON a.user_id = u.id
            JOIN Properties p ON a.property_id = p.id
            JOIN Users ag ON a.agent_id = ag.id
            WHERE a.id = ${id}
        `;
        return result.recordset[0];
    } catch (error) {
        console.error('Lỗi getAppointmentById:', error);
        throw error;
    }
};

// Tạo lịch hẹn mới
const createAppointment = async (appointmentData) => {
    try {
        const {
            user_id,
            property_id,
            agent_id,
            appointment_time,
            user_notes
        } = appointmentData;

        const request = new sql.Request();
        request.input('user_id', sql.Int, user_id);
        request.input('property_id', sql.Int, property_id);
        request.input('agent_id', sql.Int, agent_id);
        request.input('appointment_time', sql.DateTime, appointment_time);
        request.input('user_notes', sql.NVarChar, user_notes);

        const result = await request.query`
            INSERT INTO Appointments (
                user_id, property_id, agent_id, appointment_time, status, user_notes, created_at
            )
            VALUES (
                @user_id, @property_id, @agent_id, @appointment_time, 'pending', @user_notes, GETDATE()
            );
            
            SELECT SCOPE_IDENTITY() as id;
        `;
        return result.recordset[0].id;
    } catch (error) {
        if (error.message.includes('CHK_Appointments_Time')) {
            console.error('Lỗi createAppointment: Thời gian hẹn không hợp lệ (phải trong tương lai).');
            const specificError = new Error('Thời gian hẹn không hợp lệ (phải trong tương lai).');
            specificError.code = 'INVALID_APPOINTMENT_TIME';
            throw specificError;
        } else {
            console.error('Lỗi chi tiết createAppointment:', error.message, error.stack);
            throw error;
        }
    }
};

// Cập nhật trạng thái lịch hẹn (và agent_notes nếu có)
const updateAppointmentStatus = async (id, status, userId, isAdminOrAgent, agent_notes = null) => {
    try {
        let condition = `id = @id`;
        if (!isAdminOrAgent && status === 'cancelled') {
            condition += ` AND user_id = @userId`;
        } else if (!isAdminOrAgent) {
            return false;
        }
        
        const request = new sql.Request();
        request.input('id', sql.Int, id);
        request.input('status', sql.VarChar, status);
        if (!isAdminOrAgent && status === 'cancelled') {
            request.input('userId', sql.Int, userId);
        }

        let setClause = `status = @status, updated_at = GETDATE()`;
        if (isAdminOrAgent && agent_notes !== null) {
            setClause += `, agent_notes = @agent_notes`;
            request.input('agent_notes', sql.NVarChar, agent_notes);
        }

        const result = await request.query(`
            UPDATE Appointments
            SET ${setClause}
            WHERE ${condition}
        `);
        
        return result.rowsAffected[0] > 0;
    } catch (error) {
        console.error('Lỗi updateAppointmentStatus:', error);
        throw error;
    }
};

// (Optional) Xóa lịch hẹn - Cân nhắc có nên cho phép xóa cứng hay không
const deleteAppointment = async (id) => {
    try {
        const result = await sql.query`
            DELETE FROM Appointments
            WHERE id = ${id}
        `;
        return result.rowsAffected[0] > 0;
    } catch (error) {
        console.error('Lỗi deleteAppointment:', error);
        throw error;
    }
};

module.exports = {
    getAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointmentStatus,
    deleteAppointment // Tùy chọn
}; 