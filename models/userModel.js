const { sql } = require('../config/database');

async function updateResetToken(id, token) {
    try {
        const request = new sql.Request();
        request.input('id', sql.Int, id);
        request.input('token', sql.NVarChar, token);
        request.input('resetTokenExpires', sql.DateTime, new Date(Date.now() + 3600000)); // 1 giờ

        const result = await request.query(`
            UPDATE Users 
            SET reset_token = @token,
                reset_token_expires = @resetTokenExpires
            WHERE id = @id
        `);

        return result.rowsAffected[0] > 0;
    } catch (error) {
        console.error('Lỗi updateResetToken:', error);
        throw error;
    }
}

async function updateEmailVerified(id, verified) {
    try {
        const request = new sql.Request();
        request.input('id', sql.Int, id);
        request.input('verified', sql.Bit, verified ? 1 : 0);

        const result = await request.query(`
            UPDATE Users 
            SET email_verified = @verified,
                updated_at = GETDATE()
            WHERE id = @id
        `);

        return result.rowsAffected[0] > 0;
    } catch (error) {
        console.error('Lỗi updateEmailVerified:', error);
        throw error;
    }
}

async function getUserById(id) {
    try {
        const request = new sql.Request();
        request.input('id', sql.Int, id);
        
        const result = await request.query(`
            SELECT * FROM Users WHERE id = @id
        `);
        
        return result.recordset[0];
    } catch (error) {
        console.error('Lỗi getUserById:', error);
        throw error;
    }
}

module.exports = {
    updateResetToken,
    updateEmailVerified,
    getUserById
}; 