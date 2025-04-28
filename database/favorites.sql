-- Tạo bảng Favorites - Bảng quản lý danh sách yêu thích
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Favorites]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Favorites] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [user_id] INT NOT NULL,
        [property_id] INT NOT NULL,
        [created_at] DATETIME DEFAULT GETDATE(),
        [updated_at] DATETIME DEFAULT GETDATE(),
        
        -- Ràng buộc khóa ngoại
        CONSTRAINT [FK_Favorites_Users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users] ([id]) ON DELETE CASCADE,
        CONSTRAINT [FK_Favorites_Properties] FOREIGN KEY ([property_id]) REFERENCES [dbo].[Properties] ([id]) ON DELETE CASCADE,
        
        -- Ràng buộc duy nhất để ngăn người dùng yêu thích trùng lặp
        CONSTRAINT [UQ_Favorites_UserProperty] UNIQUE ([user_id], [property_id])
    );
    
    -- Tạo chỉ mục để tăng tốc truy vấn
    CREATE INDEX [IX_Favorites_UserId] ON [dbo].[Favorites] ([user_id]);
    CREATE INDEX [IX_Favorites_PropertyId] ON [dbo].[Favorites] ([property_id]);
    CREATE INDEX [IX_Favorites_CreatedAt] ON [dbo].[Favorites] ([created_at] DESC);
    
    PRINT 'Created Favorites table';
END
ELSE
BEGIN
    PRINT 'Favorites table already exists';
END

-- Tạo trigger để cập nhật updated_at khi cập nhật Favorites
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[TR_Favorites_UpdatedAt]'))
BEGIN
    EXEC('
    CREATE TRIGGER [dbo].[TR_Favorites_UpdatedAt]
    ON [dbo].[Favorites]
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        
        UPDATE [dbo].[Favorites]
        SET [updated_at] = GETDATE()
        FROM [dbo].[Favorites] f
        INNER JOIN inserted i ON f.id = i.id;
    END
    ');
    
    PRINT 'Created Favorites update trigger';
END
ELSE
BEGIN
    PRINT 'Favorites update trigger already exists';
END 