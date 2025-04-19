const {
    getTransactions,
    getTransactionById,
    createTransaction,
    updateTransactionStatus,
    deleteTransaction
} = require('../models/transactionModel');

// Lấy danh sách giao dịch
const listTransactions = async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            userId: req.query.user_id || req.user.id
        };

        const transactions = await getTransactions(filters);
        res.json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error('Lỗi list transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Lấy chi tiết giao dịch
const getTransaction = async (req, res) => {
    try {
        const transaction = await getTransactionById(req.params.id);
        
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giao dịch'
            });
        }

        // Kiểm tra quyền truy cập
        if (transaction.seller_id !== req.user.id && 
            transaction.buyer_id !== req.user.id && 
            !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền truy cập giao dịch này'
            });
        }

        res.json({
            success: true,
            data: transaction
        });
    } catch (error) {
        console.error('Lỗi get transaction:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Tạo giao dịch mới
const createNewTransaction = async (req, res) => {
    try {
        const {
            property_id,
            buyer_id,
            price,
            deposit_amount,
            payment_method,
            contract_date,
            notes
        } = req.body;

        // Validate dữ liệu đầu vào
        if (!property_id || !buyer_id || !price || !payment_method) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc'
            });
        }

        const transactionData = {
            property_id,
            seller_id: req.user.id,
            buyer_id,
            price,
            deposit_amount,
            payment_method,
            contract_date,
            notes
        };

        const transactionId = await createTransaction(transactionData);
        
        res.status(201).json({
            success: true,
            message: 'Đã tạo giao dịch mới',
            data: { id: transactionId }
        });
    } catch (error) {
        console.error('Lỗi create transaction:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Cập nhật trạng thái giao dịch
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, payment_date, completion_date, notes } = req.body;

        // Validate trạng thái
        const validStatuses = ['pending', 'deposit_paid', 'contract_signed', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ'
            });
        }

        // Kiểm tra quyền cập nhật
        const transaction = await getTransactionById(id);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giao dịch'
            });
        }

        if (transaction.seller_id !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền cập nhật giao dịch này'
            });
        }

        const updateData = {
            payment_date,
            completion_date,
            notes
        };

        const updated = await updateTransactionStatus(id, status, updateData);
        
        if (updated) {
            res.json({
                success: true,
                message: 'Đã cập nhật trạng thái giao dịch'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Không thể cập nhật giao dịch'
            });
        }
    } catch (error) {
        console.error('Lỗi update transaction status:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Xóa giao dịch
const removeTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra quyền xóa
        const transaction = await getTransactionById(id);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giao dịch'
            });
        }

        if (transaction.seller_id !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền xóa giao dịch này'
            });
        }

        const deleted = await deleteTransaction(id);
        
        if (deleted) {
            res.json({
                success: true,
                message: 'Đã xóa giao dịch'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Không thể xóa giao dịch'
            });
        }
    } catch (error) {
        console.error('Lỗi delete transaction:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

module.exports = {
    listTransactions,
    getTransaction,
    createNewTransaction,
    updateStatus,
    removeTransaction
}; 