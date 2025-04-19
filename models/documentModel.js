const { sql } = require('../config/database');

const documentModel = {
    // Tạo tài liệu mới
    async createDocument(documentData) {
        try {
            const result = await sql.query`
                INSERT INTO Documents (
                    property_id, 
                    user_id, 
                    title, 
                    description, 
                    file_path, 
                    file_name,
                    file_type, 
                    file_size, 
                    document_type, 
                    status, 
                    created_at, 
                    updated_at
                ) 
                VALUES (
                    ${documentData.property_id}, 
                    ${documentData.user_id}, 
                    ${documentData.title}, 
                    ${documentData.description}, 
                    ${documentData.file_path}, 
                    ${documentData.file_name},
                    ${documentData.file_type}, 
                    ${documentData.file_size}, 
                    ${documentData.document_type}, 
                    ${documentData.status}, 
                    GETDATE(), 
                    GETDATE()
                );
                
                SELECT SCOPE_IDENTITY() AS id;
            `;
            
            return result.recordset[0].id;
        } catch (error) {
            console.error('Error creating document:', error);
            throw error;
        }
    },

    // Lấy danh sách tài liệu
    async getDocuments(filters) {
        try {
            let query = `
                SELECT 
                    d.id, 
                    d.property_id, 
                    d.user_id, 
                    u.username AS user_name,
                    d.title, 
                    d.description, 
                    d.file_path, 
                    d.file_name,
                    d.file_type, 
                    d.file_size, 
                    d.document_type, 
                    d.status, 
                    d.is_public,
                    d.version,
                    d.created_at, 
                    d.updated_at
                FROM Documents d
                JOIN Users u ON d.user_id = u.id
                WHERE 1=1
            `;
            
            const params = [];
            
            if (filters.property_id) {
                query += ` AND d.property_id = @property_id`;
                params.push({ name: 'property_id', value: filters.property_id });
            }
            
            if (filters.user_id) {
                query += ` AND d.user_id = @user_id`;
                params.push({ name: 'user_id', value: filters.user_id });
            }
            
            if (filters.document_type) {
                query += ` AND d.document_type = @document_type`;
                params.push({ name: 'document_type', value: filters.document_type });
            }
            
            if (filters.status) {
                query += ` AND d.status = @status`;
                params.push({ name: 'status', value: filters.status });
            }
            
            query += ` ORDER BY d.created_at DESC`;
            
            // Pagination
            const offset = (filters.page - 1) * filters.limit;
            query += ` OFFSET ${offset} ROWS FETCH NEXT ${filters.limit} ROWS ONLY`;
            
            const request = new sql.Request();
            
            // Add parameters to request
            params.forEach(param => {
                request.input(param.name, param.value);
            });
            
            const result = await request.query(query);
            return result.recordset;
        } catch (error) {
            console.error('Error getting documents:', error);
            throw error;
        }
    },

    // Lấy chi tiết tài liệu
    async getDocumentById(id) {
        try {
            const result = await sql.query`
                SELECT 
                    d.id, 
                    d.property_id, 
                    d.user_id, 
                    u.username AS user_name,
                    d.title, 
                    d.description, 
                    d.file_path, 
                    d.file_name,
                    d.file_type, 
                    d.file_size, 
                    d.document_type, 
                    d.status, 
                    d.is_public,
                    d.version,
                    d.created_at, 
                    d.updated_at
                FROM Documents d
                JOIN Users u ON d.user_id = u.id
                WHERE d.id = ${id}
            `;
            
            return result.recordset[0];
        } catch (error) {
            console.error('Error getting document by ID:', error);
            throw error;
        }
    },

    // Cập nhật tài liệu
    async updateDocument(id, updateData) {
        try {
            const result = await sql.query`
                UPDATE Documents
                SET 
                    title = ${updateData.title},
                    description = ${updateData.description},
                    status = ${updateData.status},
                    is_public = ${updateData.is_public || 0},
                    version = version + 1,
                    updated_at = GETDATE()
                WHERE id = ${id}
            `;
            
            return result.rowsAffected[0] > 0;
        } catch (error) {
            console.error('Error updating document:', error);
            throw error;
        }
    },

    // Xóa tài liệu
    async deleteDocument(id) {
        try {
            // First, delete shares
            await sql.query`
                DELETE FROM DocumentSharing
                WHERE document_id = ${id}
            `;
            
            // Then delete the document
            const result = await sql.query`
                DELETE FROM Documents
                WHERE id = ${id}
            `;
            
            return result.rowsAffected[0] > 0;
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    },

    // Chia sẻ tài liệu
    async shareDocument(shareData) {
        try {
            // Check if already shared with this user
            const existingShare = await sql.query`
                SELECT id
                FROM DocumentSharing
                WHERE document_id = ${shareData.document_id}
                AND shared_with = ${shareData.shared_with}
            `;
            
            if (existingShare.recordset.length > 0) {
                // Update existing share
                await sql.query`
                    UPDATE DocumentSharing
                    SET permission = ${shareData.permission}
                    WHERE document_id = ${shareData.document_id}
                    AND shared_with = ${shareData.shared_with}
                `;
            } else {
                // Create new share
                await sql.query`
                    INSERT INTO DocumentSharing (
                        document_id,
                        shared_by,
                        shared_with,
                        permission,
                        access_token
                    )
                    VALUES (
                        ${shareData.document_id},
                        ${shareData.shared_by},
                        ${shareData.shared_with},
                        ${shareData.permission},
                        ${shareData.access_token || null}
                    )
                `;
            }
            
            return true;
        } catch (error) {
            console.error('Error sharing document:', error);
            throw error;
        }
    },

    // Lấy danh sách tài liệu được chia sẻ
    async getSharedDocuments(userId) {
        try {
            const result = await sql.query`
                SELECT 
                    d.id, 
                    d.property_id, 
                    d.user_id, 
                    u.username AS owner_name,
                    d.title, 
                    d.description, 
                    d.file_path, 
                    d.file_name,
                    d.file_type, 
                    d.file_size, 
                    d.document_type, 
                    d.status, 
                    d.is_public,
                    d.version,
                    d.created_at, 
                    d.updated_at,
                    ds.permission,
                    sharer.username AS shared_by_name
                FROM Documents d
                JOIN DocumentSharing ds ON d.id = ds.document_id
                JOIN Users u ON d.user_id = u.id
                JOIN Users sharer ON ds.shared_by = sharer.id
                WHERE ds.shared_with = ${userId}
                ORDER BY d.created_at DESC
            `;
            
            return result.recordset;
        } catch (error) {
            console.error('Error getting shared documents:', error);
            throw error;
        }
    },

    // Kiểm tra quyền truy cập tài liệu
    async checkDocumentAccess(documentId, userId) {
        try {
            const result = await sql.query`
                SELECT permission
                FROM DocumentSharing
                WHERE document_id = ${documentId}
                AND shared_with = ${userId}
            `;
            
            return result.recordset[0]?.permission || null;
        } catch (error) {
            console.error('Error checking document access:', error);
            throw error;
        }
    }
};

module.exports = documentModel; 