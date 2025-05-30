-- Add the expires_at column if it doesn't exist
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Properties' AND COLUMN_NAME = 'expires_at'
)
BEGIN
    ALTER TABLE Properties ADD expires_at DATETIME NULL;
    PRINT 'Added expires_at column to Properties table';
END
ELSE
BEGIN
    PRINT 'expires_at column already exists';
END

-- Drop the existing constraint
IF EXISTS (
    SELECT * FROM sys.check_constraints 
    WHERE name = 'CHK_Properties_Status' AND parent_object_id = OBJECT_ID('Properties')
)
BEGIN
    ALTER TABLE Properties DROP CONSTRAINT CHK_Properties_Status;
    PRINT 'Dropped existing CHK_Properties_Status constraint';
END

-- Add new constraint with 'expired' status
ALTER TABLE Properties 
ADD CONSTRAINT CHK_Properties_Status CHECK (
    status IN ('available', 'rented', 'sold', 'maintenance', 'pending', 'expired')
);
PRINT 'Added new CHK_Properties_Status constraint with expired status';

-- Update properties that have passed their expiration date
UPDATE Properties
SET status = 'expired'
WHERE expires_at IS NOT NULL AND expires_at < GETDATE() AND status = 'available';
PRINT 'Updated expired properties'; 