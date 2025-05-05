-- Thêm cột created_at cho bảng PropertyImages nếu chưa tồn tại
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'PropertyImages' AND COLUMN_NAME = 'created_at'
)
BEGIN
    ALTER TABLE PropertyImages ADD created_at DATETIME DEFAULT GETDATE();
    PRINT 'Đã thêm cột created_at vào bảng PropertyImages';
END
ELSE
BEGIN
    PRINT 'Cột created_at đã tồn tại trong bảng PropertyImages';
END

-- Sửa dữ liệu ảnh test để đảm bảo các ảnh có URL hợp lệ
-- Thêm một ảnh mẫu cho bất động sản ID 29 (hoặc bất kỳ ID nào bạn đang xem)
DECLARE @property_id INT = 29; -- Thay thế bằng ID bất động sản bạn đang xem

-- Kiểm tra xem bất động sản có tồn tại không
IF EXISTS (SELECT 1 FROM Properties WHERE id = @property_id)
BEGIN
    -- Kiểm tra xem bất động sản đã có ảnh chưa
    IF NOT EXISTS (SELECT 1 FROM PropertyImages WHERE property_id = @property_id)
    BEGIN
        -- Thêm ảnh mẫu
        INSERT INTO PropertyImages (property_id, image_url, is_primary, created_at)
        VALUES (@property_id, 'https://via.placeholder.com/800x400?text=Sample+Property+Image', 1, GETDATE());
        PRINT 'Đã thêm ảnh mẫu cho bất động sản ' + CAST(@property_id AS VARCHAR);
    END
    ELSE
    BEGIN
        PRINT 'Bất động sản ' + CAST(@property_id AS VARCHAR) + ' đã có ảnh';
    END
END
ELSE
BEGIN
    PRINT 'Bất động sản với ID ' + CAST(@property_id AS VARCHAR) + ' không tồn tại';
END 