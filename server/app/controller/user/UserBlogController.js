const { Blog } = require('../../model/blog');
const { Comment } = require('../../model/comment');
const mongoose = require('mongoose');

class BlogController {
  
  // Get all blogs for public view
  static async getAllBlogs(req, res) {
    try {
      const blogs = await Blog.find()
        .select('title banner author createdAt likesCount') // select public fields
        .populate('author', 'name')
        .sort({ createdAt: -1 })
        .lean();
      res.json({ status: true, blogs });
    } catch (err) {
      res.status(500).json({ status: false, error: 'Failed to fetch blogs' });
    }
  }

  // Get single blog by ID including comments
  static async getBlogById(req, res) {
    try {
      const blogId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(blogId)) {
        return res.status(400).json({ status: false, error: 'Invalid blog ID' });
      }
      const blog = await Blog.findById(blogId)
        .populate('author', 'name')
        .lean();
      if (!blog) {
        return res.status(404).json({ status: false, error: 'Blog not found' });
      }
      // Fetch comments for this blog with user info
      const comments = await Comment.find({ blogId })
        .populate('userId', 'name')
        .sort({ createdAt: 1 }) // oldest first
        .lean();

      res.json({ status: true, blog, comments });
    } catch (err) {
      res.status(500).json({ status: false, error: 'Failed to load blog' });
    }
  }

  // Post a comment on a blog (authenticated)
  static async postComment(req, res) {
    try {
      const blogId = req.params.id;
      const userId = req.user.id;
      const { comment } = req.body;

      if (!userId) {
      return res.status(401).json({ status: false, error: 'User ID missing in token' });
    }

      if (!mongoose.Types.ObjectId.isValid(blogId)) {
        return res.status(400).json({ status: false, error: 'Invalid blog ID' });
      }
      if (!comment || comment.trim() === '') {
        return res.status(400).json({ status: false, error: 'Comment cannot be empty' });
      }
      // Check blog exists
      const blog = await Blog.findById(blogId);
      if (!blog) {
        return res.status(404).json({ status: false, error: 'Blog not found' });
      }

      const newComment = new Comment({ blogId, userId, comment: comment.trim() });
      await newComment.save();

      res.status(201).json({ status: true, message: 'Comment posted successfully', comment: newComment });
    } catch (err) {
      console.error('Comment post error:', err);
      res.status(500).json({ status: false, error: 'Failed to post comment' });
    }
  }

  // Toggle like on a blog (authenticated)
  // For simplicity, store liked users inside blog document (add likesUsers array)
  static async toggleLike(req, res) {
    try {
      const blogId = req.params.id;
      const userId = req.user._id;
      if (!mongoose.Types.ObjectId.isValid(blogId)) {
        return res.status(400).json({ status: false, error: 'Invalid blog ID' });
      }
      const blog = await Blog.findById(blogId);
      if (!blog) {
        return res.status(404).json({ status: false, error: 'Blog not found' });
      }

      // Initialize likesUsers set if not exists
      if (!blog.likedUsers) blog.likedUsers = [];

      const userIndex = blog.likedUsers.findIndex(id => id.toString() === userId.toString());
      if (userIndex === -1) {
        // User has not liked, add like
        blog.likedUsers.push(userId);
        blog.likesCount = blog.likedUsers.length;
        await blog.save();
        return res.json({ status: true, liked: true, likesCount: blog.likesCount });
      } else {
        // User already liked, remove like
        blog.likedUsers.splice(userIndex, 1);
        blog.likesCount = blog.likedUsers.length;
        await blog.save();
        return res.json({ status: true, liked: false, likesCount: blog.likesCount });
      }
    } catch (err) {
      res.status(500).json({ status: false, error: 'Failed to toggle like' });
    }
  }
}

module.exports = BlogController;
