const mongoose = require('mongoose');
const Joi = require('joi');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, minlength: 2, maxlength: 200 },
  content: { type: String, required: true },
  banner: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  likesCount: { type: Number, default: 0 },
  likedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const BlogJoiSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  content: Joi.string().required(),
  author: Joi.string().hex().length(24).required(),
  banner: Joi.string().allow('').optional()
});

module.exports = {
  Blog: mongoose.model('Blog', blogSchema),
  BlogJoiSchema
};
