const mongoose = require('mongoose');
const Joi = require('joi');

const replySchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  replyText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const commentSchema = new mongoose.Schema({
  blogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, required: true, minlength: 1, maxlength: 1000 },
  replies: [replySchema],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const CommentJoiSchema = Joi.object({
  blogId: Joi.string().hex().length(24).required(),
  userId: Joi.string().hex().length(24).required(),
  comment: Joi.string().min(1).max(1000).required(),
});

module.exports = {
  Comment: mongoose.model('Comment', commentSchema),
  CommentJoiSchema
};
