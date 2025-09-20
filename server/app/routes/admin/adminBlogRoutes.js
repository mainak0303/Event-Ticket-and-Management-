const express = require('express');
const router = express.Router();
const { authentication, isAdmin } = require('../../middleware/authejs');
const Imageupload = require('../../helper/ImageUpload');
const AdminBlogController = require('../../controller/admin/AdminBlogController');

// List blogs
router.get('/admin/blogs', authentication, isAdmin, AdminBlogController.list);

// Add blog form
router.get('/admin/blogs/add', authentication, isAdmin, AdminBlogController.addForm);

// Add blog POST (with image upload)
router.post('/admin/blogs/add', authentication, isAdmin, Imageupload.single('banner'), AdminBlogController.add);

// Edit blog form
router.get('/admin/blogs/edit/:id', authentication, isAdmin, AdminBlogController.editForm);

// Edit blog POST (with image upload)
router.post('/admin/blogs/edit/:id', authentication, isAdmin, Imageupload.single('banner'), AdminBlogController.edit);

// Delete blog
router.post('/admin/blogs/delete/:id', authentication, isAdmin, AdminBlogController.delete);

// View comments for a blog post
router.get('/blogs/:blogId/comments', authentication, isAdmin, AdminBlogController.commentsList);

// Post reply to a comment (admin only)
router.post('/blogs/comments/reply/:commentId', authentication, isAdmin, AdminBlogController.postReply);

// Delete a comment
router.post('/blogs/comments/delete/:commentId', authentication, isAdmin, AdminBlogController.deleteComment);


module.exports = router;
