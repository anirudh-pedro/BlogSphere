import express from 'express';
import Blog from '../models/Blog.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// POST /:id/like
router.post('/:id/like', authenticateUser, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user has already liked the blog
    const likedIndex = blog.likes.findIndex(like => like.user && like.user.toString() === req.user.userId);
    
    if (likedIndex > -1) {
      // User has already liked, so unlike
      blog.likes.splice(likedIndex, 1);
    } else {
      // Add new like with proper structure matching the schema
      blog.likes.push({
        user: req.user.userId,
        createdAt: new Date()
      });
    }

    await blog.save();

    res.json({
      liked: likedIndex === -1,
      likes: blog.likes.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating like status', error: error.message });
  }
});

// Input validation middleware for comments
const validateComment = (req, res, next) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ message: 'Comment text is required' });
  }
  if (text.length > 1000) {
    return res.status(400).json({ message: 'Comment text cannot exceed 1000 characters' });
  }
  next();
};

// POST /:id/comments
router.post('/:id/comments', authenticateUser, validateComment, async (req, res) => {
  try {
    const { text } = req.body;

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const newComment = {
      user: req.user.userId,
      text: text.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    blog.comments.unshift(newComment);
    await blog.save();

    // Populate user information for the new comment and handle potential null user
    const populatedBlog = await Blog.findById(req.params.id)
      .populate({
        path: 'comments.user',
        select: 'username',
        options: { lean: true }
      });

    if (!populatedBlog || !populatedBlog.comments.length) {
      return res.status(500).json({ message: 'Error saving comment' });
    }

    const addedComment = populatedBlog.comments[0];
    // Ensure the comment has the required fields even if user is null
    const formattedComment = {
      _id: addedComment._id,
      text: addedComment.text,
      createdAt: addedComment.createdAt,
      user: addedComment.user || { username: 'Anonymous' }
    };

    res.status(201).json(formattedComment);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
});

// GET /:id/comments
router.get('/:id/comments', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blog = await Blog.findById(req.params.id)
      .populate('comments.user', 'username')
      .select('comments');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const totalComments = blog.comments.length;
    const paginatedComments = blog.comments.slice(skip, skip + limit);

    res.json({
      comments: paginatedComments,
      currentPage: page,
      totalPages: Math.ceil(totalComments / limit),
      totalComments
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
});

// DELETE /:id/comments/:commentId
router.delete('/:id/comments/:commentId', authenticateUser, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const comment = blog.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    comment.remove();
    await blog.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
});

// PUT /:id/comments/:commentId
router.put('/:id/comments/:commentId', authenticateUser, validateComment, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const comment = blog.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }

    comment.text = req.body.text.trim();
    comment.updatedAt = new Date();
    await blog.save();

    // Return the updated comment with populated user info
    const populatedBlog = await Blog.findById(req.params.id)
      .populate({
        path: 'comments.user',
        select: 'username',
        options: { lean: true }
      });

    const updatedComment = populatedBlog.comments.id(req.params.commentId);
    const formattedComment = {
      _id: updatedComment._id,
      text: updatedComment.text,
      createdAt: updatedComment.createdAt,
      updatedAt: updatedComment.updatedAt,
      user: updatedComment.user || { username: 'Anonymous' }
    };

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating comment', error: error.message });
  }
});

export default router;