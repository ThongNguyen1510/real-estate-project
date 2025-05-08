-- Tạo bảng Favorites nếu chưa tồn tại
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_NAME = 'Favorites'
)
BEGIN
    CREATE TABLE Favorites (
        id INT PRIMARY KEY IDENTITY(1,1),
        user_id INT NOT NULL,
        property_id INT NOT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_Favorites_Users FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        CONSTRAINT FK_Favorites_Properties FOREIGN KEY (property_id) REFERENCES Properties(id) ON DELETE CASCADE,
        CONSTRAINT UQ_Favorites_User_Property UNIQUE (user_id, property_id)
    );
    
    PRINT 'Đã tạo bảng Favorites thành công';
END
ELSE
BEGIN
    PRINT 'Bảng Favorites đã tồn tại';
END

-- Kiểm tra và thêm ràng buộc độc nhất nếu chưa có
IF NOT EXISTS (
    SELECT * FROM sys.indexes
    WHERE name = 'UQ_Favorites_User_Property' AND object_id = OBJECT_ID('Favorites')
)
BEGIN
    ALTER TABLE Favorites
    ADD CONSTRAINT UQ_Favorites_User_Property UNIQUE (user_id, property_id);
    
    PRINT 'Đã thêm ràng buộc độc nhất cho cặp (user_id, property_id)';
END
ELSE
BEGIN
    PRINT 'Ràng buộc độc nhất đã tồn tại';
END 