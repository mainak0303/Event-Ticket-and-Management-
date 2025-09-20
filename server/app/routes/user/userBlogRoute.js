// routes/blogApiRoutes.js
const express = require('express');
const router = express.Router();
const BlogController = require('../../controller/user/UserBlogController');
const { AuthCheck } = require('../../middleware/auth');

// Get all blogs (public)
router.get('/blogs', BlogController.getAllBlogs);

// Get single blog with comments (public)
router.get('/blogs/:id', BlogController.getBlogById);

// Post comment (auth required)
router.post('/blogs/comments/:id', AuthCheck, BlogController.postComment);

// Like/unlike blog (auth required)
router.post('/blogs/like/:id', AuthCheck, BlogController.toggleLike);

module.exports = router;
