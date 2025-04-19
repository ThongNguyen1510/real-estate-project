-- Tạo bảng Documents
CREATE TABLE Documents (
    document_id INT IDENTITY(1,1) PRIMARY KEY,
    property_id INT,
    user_id INT,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    file_url NVARCHAR(MAX) NOT NULL,
    file_type NVARCHAR(50) NOT NULL,
    file_size INT NOT NULL,
    document_type NVARCHAR(50) NOT NULL, -- contract, legal, image, video
    status NVARCHAR(20) DEFAULT 'active',
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (property_id) REFERENCES Properties(property_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Tạo bảng DocumentShares
CREATE TABLE DocumentShares (
    share_id INT IDENTITY(1,1) PRIMARY KEY,
    document_id INT NOT NULL,
    shared_by INT NOT NULL,
    shared_with INT NOT NULL,
    permission_level NVARCHAR(20) DEFAULT 'view', -- view, download, edit
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (document_id) REFERENCES Documents(document_id),
    FOREIGN KEY (shared_by) REFERENCES Users(user_id),
    FOREIGN KEY (shared_with) REFERENCES Users(user_id)
);

-- Tạo indexes
CREATE INDEX IDX_Documents_Property ON Documents(property_id);
CREATE INDEX IDX_Documents_User ON Documents(user_id);
CREATE INDEX IDX_Documents_Type ON Documents(document_type);
CREATE INDEX IDX_DocumentShares_Document ON DocumentShares(document_id);
CREATE INDEX IDX_DocumentShares_SharedWith ON DocumentShares(shared_with);

-- Trigger cập nhật updated_at
CREATE TRIGGER TR_Documents_UpdateTimestamp
ON Documents
AFTER UPDATE
AS
BEGIN
    UPDATE Documents
    SET updated_at = GETDATE()
    FROM Documents d
    INNER JOIN inserted i ON d.document_id = i.document_id
END; 