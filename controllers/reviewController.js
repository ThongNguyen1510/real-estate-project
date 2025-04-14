const { sql } = require('../config/database');

// Thêm đánh giá cho bất động sản
async function addReview(req, res) {
  try {
    console.log('=== POST Add Review ===');
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('Params:', req.params);
    console.log('Body:', req.body);

    const { propertyId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.id || 1; // Fallback to 1 if no user in token

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Đánh giá phải từ 1 đến 5 sao'
      });
    }

    // Kiểm tra xem user đã đánh giá bất động sản này chưa
    const existingReview = await sql.query`
      SELECT id FROM Reviews
      WHERE user_id = ${userId} AND property_id = ${propertyId}
    `;

    if (existingReview.recordset.length > 0) {
      console.log('User already reviewed this property');
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đánh giá bất động sản này'
      });
    }

    // Thêm đánh giá
    const result = await sql.query`
      INSERT INTO Reviews (user_id, property_id, rating, comment, created_at)
      VALUES (${userId}, ${propertyId}, ${rating}, ${comment}, GETDATE());
      
      SELECT SCOPE_IDENTITY() as id
    `;

   
    const reviewId = result.recordset[0].id;
    console.log('Created review with ID:', reviewId);

    // Lấy thông tin đánh giá vừa thêm
    const review = await sql.query`
      SELECT 
        r.id,
        r.property_id,
        r.user_id,
        r.rating,
        r.comment,
        r.created_at,
        u.name as user_name,
        u.avatar_url
      FROM Reviews r
      JOIN Users u ON r.user_id = u.id
      WHERE r.id = ${reviewId}
    `;

    console.log('======================');

    res.status(201).json({
      success: true,
      message: 'Thêm đánh giá thành công',
      data: review.recordset[0]
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
}

// Thêm bình luận cho đánh giá
async function addComment(req, res) {
  try {
    const { review_id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bình luận không được trống'
      });
    }

    const request = new sql.Request();
    request.input('reviewId', sql.Int, review_id);
    request.input('userId', sql.Int, userId);
    request.input('content', sql.NVarChar, content);

    // Kiểm tra đánh giá tồn tại
    const reviewCheck = await request.query`
      SELECT id FROM Reviews WHERE id = @reviewId
    `;

    if (reviewCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    // Thêm bình luận
    const result = await request.query`
      INSERT INTO Comments (review_id, user_id, content)
      VALUES (@reviewId, @userId, @content);
      
      SELECT SCOPE_IDENTITY() as id
    `;

    const commentId = result.recordset[0].id;

    // Lấy thông tin bình luận vừa thêm
    const comment = await request.query`
      SELECT 
        c.*,
        u.name as user_name,
        u.avatar_url
      FROM Comments c
      JOIN Users u ON c.user_id = u.id
      WHERE c.id = ${commentId}
    `;

    res.status(201).json({
      success: true,
      message: 'Thêm bình luận thành công',
      data: comment.recordset[0]
    });
  } catch (error) {
    console.error('Lỗi khi thêm bình luận:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
}

// Lấy danh sách đánh giá của bất động sản
async function getPropertyReviews(req, res) {
  try {
    console.log('=== GET Property Reviews ===');
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('Params:', req.params);
    console.log('Query:', req.query);
    
    const { propertyId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const reviews = await sql.query`
      SELECT r.*, u.name as user_name, u.avatar_url
      FROM Reviews r
      INNER JOIN Users u ON r.user_id = u.id
      WHERE r.property_id = ${propertyId}
      ORDER BY r.created_at DESC
    `;

    console.log('Found reviews:', reviews.recordset.length);
    console.log('======================');

    res.json({
      success: true,
      message: 'Lấy danh sách đánh giá thành công',
      data: {
        reviews: reviews.recordset,
        pagination: {
          total: reviews.recordset.length,
          totalPages: Math.ceil(reviews.recordset.length / limit),
          currentPage: page,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error getting reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
}

// Xóa đánh giá
async function deleteReview(req, res) {
  try {
    console.log('=== DELETE Review ===');
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('Params:', req.params);

    const { reviewId } = req.params;
    const userId = req.user?.id || 1; // Fallback to 1 if no user in token

    // Kiểm tra quyền xóa
    const review = await sql.query`
      SELECT property_id FROM Reviews
      WHERE id = ${reviewId} AND user_id = ${userId}
    `;

    if (review.recordset.length === 0) {
      console.log('Review not found or not owned by user:', reviewId);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá hoặc bạn không có quyền xóa'
      });
    }

    // Xóa đánh giá
    await sql.query`DELETE FROM Reviews WHERE id = ${reviewId}`;

    // Cập nhật lại rating trung bình
    const propertyId = review.recordset[0].property_id;
    await sql.query`
      UPDATE Properties
      SET avg_rating = (
        SELECT AVG(CAST(rating AS FLOAT))
        FROM Reviews
        WHERE property_id = ${propertyId}
      )
      WHERE id = ${propertyId}
    `;

    console.log('Deleted review:', reviewId);
    console.log('======================');

    res.json({
      success: true,
      message: 'Xóa đánh giá thành công'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
}

// Xóa bình luận
async function deleteComment(req, res) {
  try {
    const { comment_id } = req.params;
    const userId = req.user.id;

    const request = new sql.Request();
    request.input('commentId', sql.Int, comment_id);
    request.input('userId', sql.Int, userId);

    // Kiểm tra bình luận tồn tại và thuộc về user
    const commentCheck = await request.query`
      SELECT id FROM Comments 
      WHERE id = @commentId AND user_id = @userId
    `;

    if (commentCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận hoặc bạn không có quyền xóa'
      });
    }

    // Xóa bình luận
    await request.query`
      DELETE FROM Comments WHERE id = @commentId
    `;

    res.json({
      success: true,
      message: 'Xóa bình luận thành công'
    });
  } catch (error) {
    console.error('Lỗi khi xóa bình luận:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
}

module.exports = {
  addReview,
  addComment,
  getPropertyReviews,
  deleteReview,
  deleteComment
}; 