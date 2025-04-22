-- Tạo bảng PropertyReports để lưu thông tin báo cáo tin đăng
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PropertyReports' AND xtype='U')
CREATE TABLE PropertyReports (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    property_id INT NOT NULL,
    reason NVARCHAR(255) NOT NULL,
    details NVARCHAR(MAX) NULL,
    status NVARCHAR(20) NOT NULL, -- pending, investigating, resolved, rejected
    created_at DATETIME NOT NULL,
    admin_response NVARCHAR(MAX) NULL,
    resolved_at DATETIME NULL,
    CONSTRAINT FK_PropertyReports_Users FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    CONSTRAINT FK_PropertyReports_Properties FOREIGN KEY (property_id) REFERENCES Properties(id) ON DELETE CASCADE
);

-- Tạo index cho các trường tìm kiếm phổ biến
CREATE INDEX IX_PropertyReports_UserID ON PropertyReports(user_id);
CREATE INDEX IX_PropertyReports_PropertyID ON PropertyReports(property_id);
CREATE INDEX IX_PropertyReports_Status ON PropertyReports(status); 