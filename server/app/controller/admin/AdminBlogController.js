const { Blog, BlogJoiSchema } = require('../../model/blog');
const multer = require('../../helper/ImageUpload'); // your multer config
const path = require('path');
const { Comment } = require('../../model/comment');

class AdminBlogController {
  // Show blog list page in admin panel
  static async list(req, res) {
    try {
      const blogs = await Blog.find().populate('author', 'name email').lean();
      res.render('admin/blogs/list', { blogs,admin: req.user, success: req.flash('success'), error: req.flash('error'),activePage: 'blogs' });
    } catch (err) {
      req.flash('error', 'Failed to load blogs');
      res.redirect('/admin/dashboard');
    }
  }

  // Show add blog form
  static addForm(req, res) {
  res.render('admin/blogs/add', {
    admin: req.user,           
    success: req.flash('success'),
    error: req.flash('error'),
    activePage: 'blogAdd'      
  });
}

  
  static async add(req, res) {
    
    try {
      const { error } = BlogJoiSchema.validate({ ...req.body, author: req.user._id });
      if (error) {
        req.flash('error', error.message);
        return res.redirect('/admin/blogs/add');
      }
      const bannerPath = req.file ? `/uploads/${path.basename(req.file.path)}` : null;
      const blog = new Blog({
        ...req.body,
        author: req.user._id,
        banner: bannerPath
      });
      await blog.save();
      req.flash('success', 'Blog post created successfully');
      res.redirect('/admin/blogs');
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/admin/blogs/add');
    }
  }

  static async editForm(req, res) {
  try {
    const blog = await Blog.findById(req.params.id).lean();
    if (!blog) {
      req.flash('error', 'Blog not found');
      return res.redirect('/admin/blogs');
    }
    res.render('admin/blogs/edit', {
      blog,
      admin: req.user,           // pass logged-in admin info to view
      success: req.flash('success'),
      error: req.flash('error'),
      activePage: 'blogEdit',
      editBlogId: blog._id       // for sidebar active link
    });
  } catch (err) {
    req.flash('error', 'Error loading blog');
    res.redirect('/admin/blogs');
  }
}


  // Handle edit POST
  static async edit(req, res) {
    try {
      const { error } = BlogJoiSchema.validate({ ...req.body, author: req.user._id });
      if (error) {
        req.flash('error', error.message);
        return res.redirect(`/admin/blogs/edit/${req.params.id}`);
      }
      const blog = await Blog.findById(req.params.id);
      if (!blog) {
        req.flash('error', 'Blog not found');
        return res.redirect('/admin/blogs');
      }
      blog.title = req.body.title;
      blog.content = req.body.content;
      if (req.file) {
        blog.banner = `/uploads/${path.basename(req.file.path)}`;
      }
      await blog.save();
      req.flash('success', 'Blog updated successfully');
      res.redirect('/admin/blogs');
    } catch (err) {
      req.flash('error', err.message);
      res.redirect(`/admin/blogs/edit/${req.params.id}`);
    }
  }

  // Delete blog
  static async delete(req, res) {
    try {
      await Blog.findByIdAndDelete(req.params.id);
      req.flash('success', 'Blog deleted successfully');
      res.redirect('/admin/blogs');
    } catch (err) {
      req.flash('error', 'Failed to delete blog');
      res.redirect('/admin/blogs');
    }
  }

  // Get comments for a specific blog (admin view)
  static async commentsList(req, res) {
    try {
      const blogId = req.params.blogId;
      const title = req.params.title;
      const comments = await Comment.find({ blogId })
        .populate('userId', 'name email')  // populate user info
        .sort({ createdAt: -1 })            // show latest first
        .lean();

      res.render('admin/blogs/comments-list', {
        blogId,
        title,
        comments,
        admin: req.user,
        success: req.flash('success'),
        error: req.flash('error'),
        activePage: 'blogComments',
      });
    } catch (err) {
      req.flash('error', 'Failed to load comments');
      res.redirect('/admin/blogs');
    }
  }

  // Delete a specific comment by comment ID
  static async deleteComment(req, res) {
    try {
      const commentId = req.params.commentId;
      await Comment.findByIdAndDelete(commentId);
      req.flash('success', 'Comment deleted successfully');
      res.redirect('/admin/blogs');  // return to referring page
    } catch (err) {
      req.flash('error', 'Failed to delete comment');
      res.redirect('/admin/blogs');
    }
  }

  static async postReply(req, res) {
  try {
    const commentId = req.params.commentId;
    const adminId = req.user._id;
    const { replyText } = req.body;

    if (!replyText || replyText.trim() === '') {
      req.flash('error', 'Reply cannot be empty');
      return res.redirect('/admin/blogs');
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      req.flash('error', 'Comment not found');
      return res.redirect('/admin/blogs');
    }

    comment.replies.push({
      adminId,
      replyText: replyText.trim()
    });

    await comment.save();

    req.flash('success', 'Reply posted successfully');
    res.redirect('/admin/blogs');
  } catch (err) {
    req.flash('error', 'Failed to post reply');
    res.redirect('/admin/blogs');
  }
}



}

module.exports = AdminBlogController;
