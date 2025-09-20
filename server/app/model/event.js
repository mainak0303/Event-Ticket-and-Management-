const mongoose = require('mongoose');
const Joi = require('joi');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  location: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: { type: String, required: false },
  date: { type: Date, required: true },
  approvalStatus: {  type: String,  enum: ['pending', 'approved', 'disapproved'],  default: 'pending'},
  time: String,
  organizer: String,
  banner: String,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const EventJoiSchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  description: Joi.string().allow(''),
  location: Joi.string().min(2).required(),
  category: Joi.string().required(),
  subcategory: Joi.string().allow(''),
  date: Joi.date().required(),
  time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), 
  organizer: Joi.string().allow(''),
  banner: Joi.string().allow(''),
  status: Joi.string().valid('active', 'inactive'),
  createdBy: Joi.string().hex().length(24).required()
});


eventSchema.virtual('ticketTiers', {
  ref: 'TicketTier',           
  localField: '_id',           
  foreignField: 'eventId',
});

eventSchema.set('toObject', { virtuals: true });
eventSchema.set('toJSON', { virtuals: true });


module.exports = {
  Event: mongoose.model('Event', eventSchema),
  EventJoiSchema
};
