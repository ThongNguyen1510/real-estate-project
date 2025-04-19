const documentModel = require('../models/documentModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/documents';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // Giới hạn 10MB
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = [
            'application/pdf', 
            'image/jpeg', 
            'image/png', 
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'video/mp4',
            'video/quicktime'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, JPEG, PNG, DOC, and video files are allowed.'));
        }
    }
}).single('file');

// Middleware upload
exports.uploadMiddleware = function(req, res, next) {
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
};

// Upload tài liệu
exports.uploadDocument = function(req, res) {
    upload(req, res, async function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const documentData = {
                title: req.body.title,
                description: req.body.description,
                file_path: req.file.path,
                file_name: req.file.originalname,
                file_type: req.file.mimetype,
                file_size: req.file.size,
                document_type: req.body.document_type || 'other',
                property_id: req.body.property_id,
                transaction_id: req.body.transaction_id,
                user_id: req.user.id,
                is_public: req.body.is_public === 'true',
                version: 1,
                status: 'active'
            };

            const documentId = await documentModel.createDocument(documentData);
            res.status(201).json({ 
                message: 'Document uploaded successfully',
                document_id: documentId
            });
        } catch (error) {
            console.error('Error uploading document:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
};

// Lấy danh sách tài liệu
exports.getDocuments = async function(req, res) {
    try {
        const filters = {
            property_id: req.query.property_id,
            user_id: req.query.user_id,
            document_type: req.query.document_type,
            status: req.query.status,
            is_public: req.query.is_public,
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10
        };

        const documents = await documentModel.getDocuments(filters);
        res.json(documents);
    } catch (error) {
        console.error('Error getting documents:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Lấy chi tiết tài liệu
exports.getDocumentById = async function(req, res) {
    try {
        const document = await documentModel.getDocumentById(req.params.id);
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Kiểm tra quyền truy cập
        const access = await documentModel.checkDocumentAccess(req.params.id, req.user.id);
        if (!access && document.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        res.json(document);
    } catch (error) {
        console.error('Error getting document:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Cập nhật tài liệu
exports.updateDocument = async function(req, res) {
    try {
        const document = await documentModel.getDocumentById(req.params.id);
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Kiểm tra quyền sở hữu
        if (document.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        const updateData = {
            title: req.body.title,
            description: req.body.description,
            status: req.body.status,
            is_public: req.body.is_public === 'true',
            version: document.version + 1
        };

        await documentModel.updateDocument(req.params.id, updateData);
        res.json({ message: 'Document updated successfully' });
    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Xóa tài liệu
exports.deleteDocument = async function(req, res) {
    try {
        const document = await documentModel.getDocumentById(req.params.id);
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Kiểm tra quyền sở hữu
        if (document.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        // Xóa file vật lý
        if (fs.existsSync(document.file_path)) {
            fs.unlinkSync(document.file_path);
        }

        await documentModel.deleteDocument(req.params.id);
        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Chia sẻ tài liệu
exports.shareDocument = async function(req, res) {
    try {
        const document = await documentModel.getDocumentById(req.params.id);
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Kiểm tra quyền sở hữu
        if (document.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        const shareData = {
            document_id: req.params.id,
            shared_by: req.user.id,
            shared_with: req.body.user_id,
            access_token: req.body.access_token || crypto.randomBytes(32).toString('hex'),
            permission: req.body.permission || 'view',
            expires_at: req.body.expires_at ? new Date(req.body.expires_at) : null
        };

        await documentModel.shareDocument(shareData);
        res.json({ 
            message: 'Document shared successfully',
            access_token: shareData.access_token
        });
    } catch (error) {
        console.error('Error sharing document:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Lấy danh sách tài liệu được chia sẻ
exports.getSharedDocuments = async function(req, res) {
    try {
        const documents = await documentModel.getSharedDocuments(req.user.id);
        res.json(documents);
    } catch (error) {
        console.error('Error getting shared documents:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Tải tài liệu
exports.downloadDocument = async function(req, res) {
    try {
        const document = await documentModel.getDocumentById(req.params.id);
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Kiểm tra quyền truy cập
        const access = await documentModel.checkDocumentAccess(req.params.id, req.user.id);
        if (!access && document.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        if (!fs.existsSync(document.file_path)) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.download(document.file_path, document.file_name);
    } catch (error) {
        console.error('Error downloading document:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}; 