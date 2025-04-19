const {
    getAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointmentStatus,
    deleteAppointment
} = require('../models/appointmentModel');
const { findPropertyOwnerById } = require('../models/propertyModel');

// Lấy danh sách lịch hẹn (của người dùng hoặc agent)
const listAppointments = async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            date: req.query.date, // YYYY-MM-DD
            upcoming: req.query.upcoming // true/false
        };

        // Phân quyền: User xem lịch của mình, Agent xem lịch của mình, Admin xem tất cả
        if (req.user.role === 'agent' || req.user.role === 'admin') {
            if (req.query.agent_id) { // Admin có thể lọc theo agent cụ thể
                 if (req.user.role === 'admin') {
                      filters.agentId = req.query.agent_id;
                 } else {
                      // Agent chỉ xem được lịch của mình
                      filters.agentId = req.user.id;
                 }
            } else if (req.user.role === 'agent') {
                filters.agentId = req.user.id;
            }
            // Admin không lọc agentId sẽ xem tất cả
        } else { // Role 'user'
            filters.userId = req.user.id;
        }

        const appointments = await getAppointments(filters);
        res.json({ success: true, data: appointments });
    } catch (error) {
        console.error('Lỗi list appointments:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Lấy chi tiết lịch hẹn
const getAppointment = async (req, res) => {
    try {
        const appointment = await getAppointmentById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy lịch hẹn' });
        }

        // Kiểm tra quyền xem
        if (appointment.user_id !== req.user.id && 
            appointment.agent_id !== req.user.id && 
            req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Không có quyền xem lịch hẹn này' });
        }

        res.json({ success: true, data: appointment });
    } catch (error) {
        console.error('Lỗi get appointment:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Tạo lịch hẹn mới
const createNewAppointment = async (req, res) => {
    try {
        const { property_id, appointment_time, notes } = req.body;

        if (!property_id || !appointment_time) {
            return res.status(400).json({ success: false, message: 'Thiếu property_id hoặc appointment_time' });
        }

        // Sử dụng hàm model mới để lấy thông tin property
        const property = await findPropertyOwnerById(property_id);
        if (!property || !property.owner_id) { // Kiểm tra cả property và owner_id
            return res.status(404).json({ success: false, message: 'Không tìm thấy bất động sản hoặc chủ sở hữu' });
        }

        // Kiểm tra thời gian hẹn hợp lệ (ví dụ: không đặt lịch trong quá khứ)
        if (new Date(appointment_time) < new Date()) {
             return res.status(400).json({ success: false, message: 'Không thể đặt lịch hẹn trong quá khứ' });
        }

        const appointmentData = {
            user_id: req.user.id,
            property_id,
            agent_id: property.owner_id, // Lấy owner_id từ kết quả query
            appointment_time,
            notes
        };

        const appointmentId = await createAppointment(appointmentData);

        // TODO: Gửi thông báo cho agent

        res.status(201).json({ success: true, message: 'Đã tạo lịch hẹn thành công', data: { id: appointmentId } });
    } catch (error) {
        console.error('Lỗi create appointment:', error);
        // Check for potential duplicate appointment or other DB errors
        res.status(500).json({ success: false, message: 'Lỗi server khi tạo lịch hẹn' });
    }
};

// Cập nhật trạng thái lịch hẹn (Xác nhận/Hủy)
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['confirmed', 'cancelled', 'completed'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
        }

        const appointment = await getAppointmentById(id);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy lịch hẹn' });
        }

        // Kiểm tra quyền cập nhật
        const isAdmin = req.user.role === 'admin';
        const isAgent = req.user.role === 'agent' && appointment.agent_id === req.user.id;
        const isOwner = appointment.user_id === req.user.id;

        let canUpdate = false;
        if (isAdmin) {
            canUpdate = true; // Admin có thể cập nhật mọi trạng thái
        } else if (isAgent && (status === 'confirmed' || status === 'cancelled' || status === 'completed')) {
            canUpdate = true; // Agent xác nhận, hủy, hoàn thành
        } else if (isOwner && status === 'cancelled') {
            canUpdate = true; // User chỉ có thể hủy
        }

        if (!canUpdate) {
            return res.status(403).json({ success: false, message: 'Không có quyền cập nhật trạng thái này' });
        }

        const updated = await updateAppointmentStatus(id, status, req.user.id, isAdmin || isAgent);

        if (updated) {
            // TODO: Gửi thông báo cho user/agent tương ứng
            res.json({ success: true, message: `Đã cập nhật trạng thái lịch hẹn thành ${status}` });
        } else {
            res.status(400).json({ success: false, message: 'Không thể cập nhật lịch hẹn' });
        }
    } catch (error) {
        console.error('Lỗi update appointment status:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Xóa lịch hẹn (Optional)
const removeAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await getAppointmentById(id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy lịch hẹn' });
        }

        // Chỉ admin hoặc người đặt có thể xóa?
        if (req.user.role !== 'admin' && appointment.user_id !== req.user.id) {
             return res.status(403).json({ success: false, message: 'Không có quyền xóa lịch hẹn này' });
        }

        const deleted = await deleteAppointment(id);

        if (deleted) {
            res.json({ success: true, message: 'Đã xóa lịch hẹn' });
        } else {
            res.status(400).json({ success: false, message: 'Không thể xóa lịch hẹn' });
        }
    } catch (error) {
        console.error('Lỗi delete appointment:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = {
    listAppointments,
    getAppointment,
    createNewAppointment,
    updateStatus,
    removeAppointment // Optional
}; 