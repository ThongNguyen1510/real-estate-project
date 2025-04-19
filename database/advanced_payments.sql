-- Tạo bảng AdvancedPayments
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AdvancedPayments' AND xtype='U')
CREATE TABLE AdvancedPayments (
    id INT PRIMARY KEY IDENTITY(1,1),
    transaction_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    payment_method NVARCHAR(50) NOT NULL, -- vnpay, momo, bank_transfer, cash, etc.
    payment_source NVARCHAR(20) NOT NULL, -- online, manual
    gateway NVARCHAR(50) NOT NULL, -- vnpay, momo, stripe, paypal, etc.
    currency NVARCHAR(10) NOT NULL DEFAULT 'VND',
    gateway_transaction_id NVARCHAR(100) NULL, -- Transaction ID from gateway
    gateway_payload NVARCHAR(MAX) NULL, -- JSON - Request/response from gateway
    reference_number NVARCHAR(100) NULL, -- For manual payments
    payment_date DATETIME NOT NULL DEFAULT GETDATE(),
    description NVARCHAR(500) NULL,
    receipt_url NVARCHAR(255) NULL, -- For manual payment receipts
    status NVARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, completed, failed, rejected
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_AdvancedPayments_Transaction FOREIGN KEY (transaction_id) REFERENCES Transactions(id),
    CONSTRAINT FK_AdvancedPayments_User FOREIGN KEY (user_id) REFERENCES Users(id)
);
GO

-- Tạo chỉ mục để tối ưu truy vấn
CREATE INDEX IX_AdvancedPayments_TransactionId ON AdvancedPayments(transaction_id);
CREATE INDEX IX_AdvancedPayments_UserId ON AdvancedPayments(user_id);
CREATE INDEX IX_AdvancedPayments_Status ON AdvancedPayments(status);
CREATE INDEX IX_AdvancedPayments_PaymentMethod ON AdvancedPayments(payment_method);
CREATE INDEX IX_AdvancedPayments_Gateway ON AdvancedPayments(gateway);
GO

-- Tạo bảng cài đặt thanh toán
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PaymentSettings' AND xtype='U')
CREATE TABLE PaymentSettings (
    id INT PRIMARY KEY IDENTITY(1,1),
    gateway NVARCHAR(50) NOT NULL, -- vnpay, momo, paypal, etc.
    is_active BIT NOT NULL DEFAULT 1,
    config_name NVARCHAR(100) NOT NULL,
    config_value NVARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_PaymentSettings_Gateway_ConfigName UNIQUE (gateway, config_name)
);
GO

-- Chèn cài đặt mặc định
INSERT INTO PaymentSettings (gateway, config_name, config_value)
VALUES 
    ('vnpay', 'min_amount', '10000'),
    ('vnpay', 'max_amount', '100000000'),
    ('vnpay', 'display_name', N'Thanh toán qua VNPay'),
    ('vnpay', 'description', N'Thanh toán an toàn với VNPay'),
    ('vnpay', 'icon', '/assets/images/payment/vnpay.png'),
    ('momo', 'min_amount', '10000'),
    ('momo', 'max_amount', '50000000'),
    ('momo', 'display_name', N'Ví điện tử Momo'),
    ('momo', 'description', N'Thanh toán nhanh chóng với ví Momo'),
    ('momo', 'icon', '/assets/images/payment/momo.png'),
    ('bank_transfer', 'min_amount', '100000'),
    ('bank_transfer', 'display_name', N'Chuyển khoản ngân hàng'),
    ('bank_transfer', 'description', N'Chuyển khoản trực tiếp đến tài khoản ngân hàng'),
    ('bank_transfer', 'icon', '/assets/images/payment/bank.png'),
    ('bank_transfer', 'account_info', N'Ngân hàng: BIDV\nChủ tài khoản: Công ty ABC\nSố tài khoản: 12345678900');
GO 