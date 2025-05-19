-- Thêm cột expires_at cho bảng Properties nếu chưa tồn tại
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Properties' AND COLUMN_NAME = 'expires_at'
)
BEGIN
    ALTER TABLE Properties ADD expires_at DATETIME;
    PRINT 'Đã thêm cột expires_at vào bảng Properties';

    -- Cập nhật expires_at cho tất cả các tin đăng hiện có
    -- Mặc định đặt hạn 10 ngày kể từ ngày tạo
    UPDATE Properties
    SET expires_at = DATEADD(day, 10, created_at)
    WHERE expires_at IS NULL;
    PRINT 'Đã cập nhật expires_at cho tất cả bất động sản hiện có';
END
ELSE
BEGIN
    PRINT 'Cột expires_at đã tồn tại trong bảng Properties';
END

-- Kiểm tra và thêm giá trị 'expired' vào CHK_Properties_Status nếu chưa có
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