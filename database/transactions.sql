-- Tạo bảng Transactions
CREATE TABLE Transactions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    property_id INT NOT NULL,
    seller_id INT NOT NULL,
    buyer_id INT NOT NULL,
    price DECIMAL(18,2) NOT NULL,
    deposit_amount DECIMAL(18,2),
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    contract_date DATE,
    payment_date DATETIME,
    completion_date DATETIME,
    notes NVARCHAR(MAX),
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME,
    FOREIGN KEY (property_id) REFERENCES Properties(id),
    FOREIGN KEY (seller_id) REFERENCES Users(id),
    FOREIGN KEY (buyer_id) REFERENCES Users(id)
);

-- Tạo index cho các cột thường xuyên tìm kiếm
CREATE INDEX IX_Transactions_Status ON Transactions(status);
CREATE INDEX IX_Transactions_PropertyId ON Transactions(property_id);
CREATE INDEX IX_Transactions_SellerId ON Transactions(seller_id);
CREATE INDEX IX_Transactions_BuyerId ON Transactions(buyer_id);

-- Tạo trigger để tự động cập nhật updated_at
CREATE TRIGGER TR_Transactions_UpdatedAt
ON Transactions
AFTER UPDATE
AS
BEGIN
    UPDATE Transactions
    SET updated_at = GETDATE()
    FROM Transactions t
    INNER JOIN inserted i ON t.id = i.id
END; 