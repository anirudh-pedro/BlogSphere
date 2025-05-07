// import mongoose from 'mongoose';

// const blogSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true
//   },
//   topic: {
//     type: String,
//     required: true
//   },
//   content: {
//     type: String,
//     required: true
//   },
//   image: {
//     type: String,
//     required: true
//   },
//   imageDescription: {
//     type: String,
//     required: true
//   },
//   author: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   }
// }, { timestamps: true });

// export default mongoose.model('Blog', blogSchema);



// models/Blog.js
import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  topic: {
    type: String,
    trim: true,
    default: 'General'
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  image: {
    type: String,
    default: null
  },
  imageDescription: {
    type: String,
    default: ''
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String]
}, { timestamps: true });

// Create indexes for faster querying
blogSchema.index({ author: 1, createdAt: -1 });
blogSchema.index({ topic: 1 });
blogSchema.index({ tags: 1 });

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;