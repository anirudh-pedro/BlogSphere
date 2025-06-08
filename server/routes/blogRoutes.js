import express from 'express';
import Blog from '../models/Blog.js';
import { authenticateUser } from '../middleware/auth.js';
import User from '../models/User.js';

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
      author: req.user.userId
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
      .sort({ createdAt: -1 })
      .populate('author', 'username');
    console.log("Fetched Blogs:", blogs);
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch blogs", error: error.message });
  }
});

// SEARCH API - this must come BEFORE the /:id route
router.get('/search', authenticateUser, async (req, res) => {
  try {
    const { term } = req.query;
    
    if (!term || term.length < 2) {
      return res.status(400).json({ message: 'Search term must be at least 2 characters' });
    }
    
    console.log(`Searching for term: "${term}"`);
    
    // Create a case-insensitive regex for the search term
    const searchRegex = new RegExp(term, 'i');
    
    // Search for blogs matching the term in title, topic, or content
    const blogs = await Blog.find({
      $or: [
        { title: searchRegex },
        { topic: searchRegex },
        { content: searchRegex }
      ]
    }).populate('author', 'username').limit(10);
    
    // Also search for blogs by author username
    const authorBlogs = await User.aggregate([
      { $match: { username: searchRegex } },
      { $lookup: {
          from: 'blogs',
          localField: '_id',
          foreignField: 'author',
          as: 'authorBlogs'
        }
      },
      { $unwind: '$authorBlogs' },
      { $replaceRoot: { newRoot: '$authorBlogs' } }
    ]);
    
    // Get the populated author data for authorBlogs
    const populatedAuthorBlogs = await Blog.populate(authorBlogs, {
      path: 'author',
      select: 'username'
    });
    
    // Combine results and remove duplicates
    const allBlogs = [...blogs];
    populatedAuthorBlogs.forEach(blog => {
      if (!allBlogs.some(b => b._id.toString() === blog._id.toString())) {
        allBlogs.push(blog);
      }
    });
    
    console.log(`Search results: ${allBlogs.length} blogs found`);
    return res.json(allBlogs.slice(0, 10)); // Limit to top 10 results
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ message: 'Server error during search' });
  }
});

// User blogs route
router.get('/user/:userId', authenticateUser, async (req, res) => {
  try {
    if (req.params.userId !== req.user.userId) {
      return res.status(403).json({ 
        message: "You are not authorized to view these posts" 
      });
    }
    
    const blogs = await Blog.find({ author: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('author', 'username');
      
    return res.status(200).json(blogs);
  } catch (error) {
    console.error('Error fetching user blogs:', error);
    return res.status(500).json({ 
      message: "Failed to fetch user's blogs", 
      error: error.message 
    });
  }
});

// GET blog by ID - must come after other specific routes
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

// Update blog
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

// Delete blog
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