import express from 'express';
import Blog from '../models/Blog.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// POST /api/blogs/create
router.post('/create', authenticateUser, async (req, res) => {
  try {
    const { title, topic, content, image, imageDescription } = req.body;

    const newBlog = new Blog({
      title,
      topic,
      content,
      image,
      imageDescription,
      author: req.user.userId  // Taken from JWT
    });

    const savedBlog = await newBlog.save();
    res.status(201).json({
      message: "Blog created successfully!",
      blog: savedBlog
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create blog", error: error.message });
  }
});

// GET /api/blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })  // Sort by 'createdAt' in descending order (most recent first)
      .populate('author', 'username'); // 'username' from User model
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch blogs", error: error.message });
  }
});


// GET /api/blogs/:id
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'username');
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch the blog", error: error.message });
  }
});

// PUT /api/blogs/:id
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { title, topic, content, image, imageDescription } = req.body;

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You are not authorized to edit this blog" });
    }

    blog.title = title;
    blog.topic = topic;
    blog.content = content;
    blog.image = image;
    blog.imageDescription = imageDescription;

    await blog.save();
    res.status(200).json({ message: "Blog updated successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update blog", error: error.message });
  }
});

// DELETE /api/blogs/:id
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You are not authorized to delete this blog" });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Blog deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete blog", error: error.message });
  }
});

export default router;
