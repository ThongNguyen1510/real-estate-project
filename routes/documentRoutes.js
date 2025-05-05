const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const documentModel = require('../models/documentModel');

// Create upload directory
const uploadDir = 'uploads/documents';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = function(req, file, cb) {
    const allowedTypes = [
        'application/pdf', 
        'image/jpeg', 
        'image/png', 
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'application/zip',
        'application/x-zip-compressed',
        'video/mp4',
        'video/quicktime'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: fileFilter
}).single('file');

// Routes
router.get('/', auth, function(req, res) {
    try {
        const filters = {
            property_id: req.query.property_id,
            user_id: req.query.user_id || req.user.id,
            document_type: req.query.document_type,
            status: req.query.status || 'active',
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10
        };

        documentModel.getDocuments(filters)
            .then(documents => {
                res.json(documents);
            })
            .catch(error => {
                console.error('Error getting documents:', error);
                res.status(500).json({ error: 'Internal server error' });
            });
    } catch (error) {
        console.error('Error getting documents:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', auth, function(req, res) {
    upload(req, res, function(err) {
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
                property_id: req.body.property_id || null,
                user_id: req.user.id,
                is_public: req.body.is_public === 'true' ? 1 : 0,
                status: 'active'
            };

            documentModel.createDocument(documentData)
                .then(documentId => {
                    res.status(201).json({ 
                        message: 'Document uploaded successfully',
                        id: documentId
                    });
                })
                .catch(error => {
                    console.error('Error uploading document:', error);
                    res.status(500).json({ error: 'Internal server error' });
                });
        } catch (error) {
            console.error('Error uploading document:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
});

router.get('/shared', auth, function(req, res) {
    documentModel.getSharedDocuments(req.user.id)
        .then(documents => {
            res.json(documents);
        })
        .catch(error => {
            console.error('Error getting shared documents:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
});

router.get('/:id', auth, function(req, res) {
    documentModel.getDocumentById(req.params.id)
        .then(document => {
            if (!document) {
                return res.status(404).json({ error: 'Document not found' });
            }

            // Check access permission
            const isOwner = document.user_id === req.user.id;
            return documentModel.checkDocumentAccess(req.params.id, req.user.id)
                .then(accessLevel => {
                    if (!isOwner && !accessLevel) {
                        return res.status(403).json({ error: 'Permission denied' });
                    }
                    res.json(document);
                });
        })
        .catch(error => {
            console.error('Error getting document:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
});

router.put('/:id', auth, function(req, res) {
    documentModel.getDocumentById(req.params.id)
        .then(document => {
            if (!document) {
                return res.status(404).json({ error: 'Document not found' });
            }

            // Check ownership
            if (document.user_id !== req.user.id) {
                return res.status(403).json({ error: 'Permission denied' });
            }

            const updateData = {
                title: req.body.title,
                description: req.body.description,
                status: req.body.status
            };

            return documentModel.updateDocument(req.params.id, updateData);
        })
        .then(() => {
            res.json({ message: 'Document updated successfully' });
        })
        .catch(error => {
            console.error('Error updating document:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
});

router.delete('/:id', auth, function(req, res) {
    documentModel.getDocumentById(req.params.id)
        .then(document => {
            if (!document) {
                return res.status(404).json({ error: 'Document not found' });
            }

            // Check ownership
            if (document.user_id !== req.user.id) {
                return res.status(403).json({ error: 'Permission denied' });
            }

            // Delete physical file
            if (fs.existsSync(document.file_path)) {
                fs.unlinkSync(document.file_path);
            }

            return documentModel.deleteDocument(req.params.id);
        })
        .then(() => {
            res.json({ message: 'Document deleted successfully' });
        })
        .catch(error => {
            console.error('Error deleting document:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
});

router.post('/:id/share', auth, function(req, res) {
    documentModel.getDocumentById(req.params.id)
        .then(document => {
            if (!document) {
                return res.status(404).json({ error: 'Document not found' });
            }

            // Check ownership
            if (document.user_id !== req.user.id) {
                return res.status(403).json({ error: 'Permission denied' });
            }

            const shareData = {
                document_id: req.params.id,
                shared_by: req.user.id,
                shared_with: req.body.user_id,
                permission: req.body.permission || 'view',
                access_token: req.body.access_token || crypto.randomBytes(20).toString('hex')
            };

            return documentModel.shareDocument(shareData)
                .then(() => {
                    res.json({ 
                        message: 'Document shared successfully',
                        access_token: shareData.access_token
                    });
                });
        })
        .catch(error => {
            console.error('Error sharing document:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
});

router.get('/:id/download', auth, function(req, res) {
    documentModel.getDocumentById(req.params.id)
        .then(document => {
            if (!document) {
                return res.status(404).json({ error: 'Document not found' });
            }

            // Check access permission
            const isOwner = document.user_id === req.user.id;
            return documentModel.checkDocumentAccess(req.params.id, req.user.id)
                .then(accessLevel => {
                    if (!isOwner && !accessLevel) {
                        return res.status(403).json({ error: 'Permission denied' });
                    }

                    if (!fs.existsSync(document.file_path)) {
                        return res.status(404).json({ error: 'File not found' });
                    }

                    // Stream file for download
                    res.download(document.file_path, path.basename(document.file_path));
                });
        })
        .catch(error => {
            console.error('Error downloading document:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
});

module.exports = router; 