const { sql } = require('../config/database');

// Lấy danh sách giao dịch
const getTransactions = async (filters = {}) => {
    try {
        let query = `
            SELECT 
                t.*,
                p.title as property_title,
                p.price as property_price,
                s.name as seller_name,
                b.name as buyer_name
            FROM Transactions t
            JOIN Properties p ON t.property_id = p.id
            JOIN Users s ON t.seller_id = s.id
            JOIN Users b ON t.buyer_id = b.id
            WHERE 1=1
        `;

        const request = new sql.Request();

        if (filters.status) {
            query += ` AND t.status = @status`;
            request.input('status', sql.NVarChar, filters.status);
        }

        if (filters.userId) {
            query += ` AND (t.seller_id = @userId OR t.buyer_id = @userId)`;
            request.input('userId', sql.Int, filters.userId);
        }

        query += ` ORDER BY t.created_at DESC`;

        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        console.error('Lỗi getTransactions:', error);
        throw error;
    }
};

// Lấy chi tiết giao dịch
const getTransactionById = async (id) => {
    try {
        const result = await sql.query`
            SELECT 
                t.*,
                p.title as property_title,
                p.price as property_price,
                l.address as property_address,
                l.city as property_city,
                l.district as property_district,
                l.ward as property_ward,
                l.street as property_street,
                s.name as seller_name,
                s.email as seller_email,
                s.phone as seller_phone,
                b.name as buyer_name,
                b.email as buyer_email,
                b.phone as buyer_phone
            FROM Transactions t
            JOIN Properties p ON t.property_id = p.id
            JOIN Users s ON t.seller_id = s.id
            JOIN Users b ON t.buyer_id = b.id
            LEFT JOIN Locations l ON p.location_id = l.id
            WHERE t.id = ${id}
        `;
        return result.recordset[0];
    } catch (error) {
        console.error('Lỗi getTransactionById:', error);
        throw error;
    }
};

// Tạo giao dịch mới
const createTransaction = async (transactionData) => {
    try {
        const {
            property_id,
            seller_id,
            buyer_id,
            price,
            deposit_amount,
            payment_method,
            contract_date,
            notes
        } = transactionData;

        const result = await sql.query`
            INSERT INTO Transactions (
                property_id,
                seller_id,
                buyer_id,
                price,
                deposit_amount,
                payment_method,
                contract_date,
                status,
                notes,
                created_at
            )
            VALUES (
                ${property_id},
                ${seller_id},
                ${buyer_id},
                ${price},
                ${deposit_amount},
                ${payment_method},
                ${contract_date},
                'pending',
                ${notes},
                GETDATE()
            );
            
            SELECT SCOPE_IDENTITY() as id
        `;
        
        return result.recordset[0].id;
    } catch (error) {
        console.error('Lỗi createTransaction:', error);
        throw error;
    }
};

// Cập nhật trạng thái giao dịch
const updateTransactionStatus = async (id, status, updateData = {}) => {
    try {
        let query = `
            UPDATE Transactions
            SET status = @status,
                updated_at = GETDATE()
        `;

        const request = new sql.Request();
        request.input('status', sql.NVarChar, status);
        request.input('id', sql.Int, id);

        // Thêm các trường cập nhật tùy chọn
        if (updateData.payment_date) {
            query += `, payment_date = @payment_date`;
            request.input('payment_date', sql.DateTime, updateData.payment_date);
        }

        if (updateData.completion_date) {
            query += `, completion_date = @completion_date`;
            request.input('completion_date', sql.DateTime, updateData.completion_date);
        }

        if (updateData.notes) {
            query += `, notes = @notes`;
            request.input('notes', sql.NVarChar, updateData.notes);
        }

        query += ` WHERE id = @id`;

        const result = await request.query(query);
        return result.rowsAffected[0] > 0;
    } catch (error) {
        console.error('Lỗi updateTransactionStatus:', error);
        throw error;
    }
};

// Xóa giao dịch
const deleteTransaction = async (id) => {
    try {
        const result = await sql.query`
            DELETE FROM Transactions
            WHERE id = ${id}
        `;
        return result.rowsAffected[0] > 0;
    } catch (error) {
        console.error('Lỗi deleteTransaction:', error);
        throw error;
    }
};

module.exports = {
    getTransactions,
    getTransactionById,
    createTransaction,
    updateTransactionStatus,
    deleteTransaction
};