-- Tạo bảng Appointments
CREATE TABLE Appointments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,                 -- ID người dùng đặt lịch
    property_id INT NOT NULL,             -- ID bất động sản muốn xem
    agent_id INT NOT NULL,                -- ID người môi giới/chủ nhà phụ trách
    appointment_time DATETIME NOT NULL,   -- Thời gian hẹn
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- Trạng thái: pending, confirmed, cancelled, completed
    notes NVARCHAR(MAX),                  -- Ghi chú thêm
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME,

    CONSTRAINT FK_Appointments_User FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    CONSTRAINT FK_Appointments_Property FOREIGN KEY (property_id) REFERENCES Properties(id) ON DELETE CASCADE,
    CONSTRAINT FK_Appointments_Agent FOREIGN KEY (agent_id) REFERENCES Users(id) ON DELETE NO ACTION, -- Không xóa agent khi có lịch hẹn
    CONSTRAINT CHK_Appointments_Status CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'))
);
GO

-- Tạo index
CREATE INDEX IX_Appointments_UserId ON Appointments(user_id);
CREATE INDEX IX_Appointments_PropertyId ON Appointments(property_id);
CREATE INDEX IX_Appointments_AgentId ON Appointments(agent_id);
CREATE INDEX IX_Appointments_AppointmentTime ON Appointments(appointment_time);
CREATE INDEX IX_Appointments_Status ON Appointments(status);
GO

-- Tạo trigger cập nhật updated_at
CREATE TRIGGER TR_Appointments_UpdatedAt
ON Appointments
AFTER UPDATE
AS
BEGIN
    IF NOT UPDATE(updated_at)
    BEGIN
        UPDATE Appointments
        SET updated_at = GETDATE()
        FROM Appointments a
        INNER JOIN inserted i ON a.id = i.id;
    END
END;
GO

PRINT 'Bảng Appointments đã được tạo thành công!'; 