USE RealEstateDB;
GO

-- 1. Thêm cột expires_at cho bảng Properties nếu chưa tồn tại
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Properties' AND COLUMN_NAME = 'expires_at'
)
BEGIN
    ALTER TABLE Properties ADD expires_at DATETIME;
    PRINT 'Đã thêm cột expires_at vào bảng Properties';
END
ELSE
BEGIN
    PRINT 'Cột expires_at đã tồn tại trong bảng Properties';
END
GO

-- 2. Cập nhật giá trị expires_at cho các bản ghi hiện có (thêm 10 ngày từ created_at)
UPDATE Properties
SET expires_at = DATEADD(day, 10, created_at)
WHERE expires_at IS NULL;
PRINT 'Đã cập nhật expires_at cho các bất động sản hiện có';
GO

-- 3. Kiểm tra và thêm giá trị 'expired' vào ràng buộc CHK_Properties_Status
IF EXISTS (
    SELECT * FROM sys.check_constraints 
    WHERE name = 'CHK_Properties_Status' AND parent_object_id = OBJECT_ID('Properties')
)
BEGIN
    -- Xóa ràng buộc cũ
    ALTER TABLE Properties DROP CONSTRAINT CHK_Properties_Status;
    PRINT 'Đã xóa ràng buộc CHK_Properties_Status cũ';

    -- Thêm ràng buộc mới với 'expired'
    ALTER TABLE Properties
    ADD CONSTRAINT CHK_Properties_Status 
    CHECK (status IN ('available', 'rented', 'sold', 'maintenance', 'pending', 'expired'));
    PRINT 'Đã thêm ràng buộc CHK_Properties_Status mới với giá trị "expired"';
END
ELSE
BEGIN
    PRINT 'Không tìm thấy ràng buộc CHK_Properties_Status để cập nhật';
END
GO

-- 4. Kiểm tra kết quả
SELECT 
    COLUMN_NAME, DATA_TYPE
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_NAME = 'Properties' 
    AND COLUMN_NAME = 'expires_at';
GO

-- 5. Hiển thị ràng buộc của trường status để xác nhận có 'expired'
SELECT 
    definition 
FROM 
    sys.check_constraints cc 
    JOIN sys.sql_modules sm ON cc.object_id = sm.object_id
WHERE 
    cc.name = 'CHK_Properties_Status';
GO 