const documentModel = require('../models/documentModel');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Upload document
function uploadDocument(req, res) {
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
}

// Get documents list
async function getDocuments(req, res) {
    try {
        const filters = {
            property_id: req.query.property_id,
            user_id: req.query.user_id || req.user.id,
            document_type: req.query.document_type,
            status: req.query.status || 'active',
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10
        };

        const documents = await documentModel.getDocuments(filters);
        res.json(documents);
    } catch (error) {
        console.error('Error getting documents:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get document by ID
async function getDocumentById(req, res) {
    try {
        const document = await documentModel.getDocumentById(req.params.id);
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Check access permission
        const isOwner = document.user_id === req.user.id;
        const isPublic = document.is_public === 1;
        
        if (!isOwner && !isPublic) {
            const accessLevel = await documentModel.checkDocumentAccess(req.params.id, req.user.id);
            if (!accessLevel) {
                return res.status(403).json({ error: 'Permission denied' });
            }
        }

        res.json(document);
    } catch (error) {
        console.error('Error getting document:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Update document
async function updateDocument(req, res) {
    try {
        const document = await documentModel.getDocumentById(req.params.id);
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
            status: req.body.status,
            is_public: req.body.is_public === 'true' ? 1 : 0
        };

        await documentModel.updateDocument(req.params.id, updateData);
        res.json({ message: 'Document updated successfully' });
    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Delete document
async function deleteDocument(req, res) {
    try {
        const document = await documentModel.getDocumentById(req.params.id);
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

        await documentModel.deleteDocument(req.params.id);
        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Share document
async function shareDocument(req, res) {
    try {
        const document = await documentModel.getDocumentById(req.params.id);
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

        await documentModel.shareDocument(shareData);
        res.json({ 
            message: 'Document shared successfully',
            access_token: shareData.access_token
        });
    } catch (error) {
        console.error('Error sharing document:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get shared documents
async function getSharedDocuments(req, res) {
    try {
        const documents = await documentModel.getSharedDocuments(req.user.id);
        res.json(documents);
    } catch (error) {
        console.error('Error getting shared documents:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Download document
async function downloadDocument(req, res) {
    try {
        const document = await documentModel.getDocumentById(req.params.id);
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Check access permission
        const isOwner = document.user_id === req.user.id;
        const isPublic = document.is_public === 1;
        
        if (!isOwner && !isPublic) {
            const accessLevel = await documentModel.checkDocumentAccess(req.params.id, req.user.id);
            if (!accessLevel || accessLevel === 'view') {
                return res.status(403).json({ error: 'Permission denied' });
            }
        }

        if (!fs.existsSync(document.file_path)) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Stream file for download
        res.download(document.file_path, document.file_name || path.basename(document.file_path));
    } catch (error) {
        console.error('Error downloading document:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    uploadDocument,
    getDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument,
    shareDocument,
    getSharedDocuments,
    downloadDocument
}; 