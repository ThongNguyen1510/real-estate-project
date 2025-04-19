const express = require('express');
const router = express.Router();
const docsController = require('../controllers/docs');
const auth = require('../middleware/auth');

// Upload tài liệu (không sử dụng middleware riêng)
router.post('/', auth, docsController.uploadDocument);

// Lấy danh sách tài liệu
router.get('/', auth, docsController.getDocuments);

// Lấy danh sách tài liệu được chia sẻ (phải đặt trước route có param)
router.get('/shared', auth, docsController.getSharedDocuments);

// Lấy chi tiết tài liệu
router.get('/:id', auth, docsController.getDocumentById);

// Cập nhật tài liệu
router.put('/:id', auth, docsController.updateDocument);

// Xóa tài liệu
router.delete('/:id', auth, docsController.deleteDocument);

// Chia sẻ tài liệu
router.post('/:id/share', auth, docsController.shareDocument);

// Tải tài liệu
router.get('/:id/download', auth, docsController.downloadDocument);

module.exports = router; 