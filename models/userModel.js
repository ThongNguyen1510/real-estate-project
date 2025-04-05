static async updateResetToken(id, token) {
    const query = `
        UPDATE users 
        SET reset_token = $1,
            reset_token_expires = CURRENT_TIMESTAMP + INTERVAL '1 hour',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
    `;
    await pool.query(query, [token, id]);
}

static async updateEmailVerified(id, verified) {
    const query = `
        UPDATE users 
        SET email_verified = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
    `;
 