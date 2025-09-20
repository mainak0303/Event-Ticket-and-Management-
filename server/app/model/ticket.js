const mongoose = require('mongoose');
const Joi = require('joi');

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  tierId: { type: mongoose.Schema.Types.ObjectId, ref: 'TicketTier', required: true },
  ticketCode: { type: String, required: true, unique: true },
  qrCodeUrl: String,
  paymentStatus: { type: String, enum: ['paid', 'pending', 'failed'], default: 'pending' },
  checkedIn: { type: Boolean, default: false },
  purchasedAt: { type: Date, default: Date.now }
});

const TicketJoiSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  eventId: Joi.string().hex().length(24).required(),
  tierId: Joi.string().hex().length(24).required(),
  ticketCode: Joi.string().alphanum().min(8).max(32).required(),
  qrCodeUrl: Joi.string().allow(''),
  paymentStatus: Joi.string().valid('paid', 'pending', 'failed'),
  checkedIn: Joi.boolean(),
  purchasedAt: Joi.date()
});

module.exports = {
  Ticket: mongoose.model('Ticket', ticketSchema),
  TicketJoiSchema
};
