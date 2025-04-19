const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    listAppointments,
    getAppointment,
    createNewAppointment,
    updateStatus,
    removeAppointment
} = require('../controllers/appointmentController');

// Lấy danh sách lịch hẹn (user xem của mình, agent xem của mình, admin xem tất cả/lọc)
router.get('/', auth, listAppointments);

// Lấy chi tiết lịch hẹn
router.get('/:id', auth, getAppointment);

// Tạo lịch hẹn mới (user đặt lịch)
router.post('/', auth, createNewAppointment);

// Cập nhật trạng thái lịch hẹn (agent xác nhận/hoàn thành, user/agent/admin hủy)
router.put('/:id/status', auth, updateStatus);

// Xóa lịch hẹn (admin hoặc người đặt lịch)
router.delete('/:id', auth, removeAppointment);

module.exports = router; 