const mongoose = require('mongoose');
const Joi = require('joi');

const paymentSchema = new mongoose.Schema({
  ticketIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }], // new: multiple tickets per payment
  amount: { type: Number, required: true, min: 0 },
  method: { type: String, enum: ['UPI', 'Razorpay', 'Stripe'], required: true },
  // optional fields — use sparse indexes so nulls don't conflict
  transactionId: { type: String, unique: true, sparse: true }, // legacy / UPI txns
  razorpayOrderId: { type: String, unique: true, sparse: true },
  razorpayPaymentId: { type: String, unique: true, sparse: true },
  razorpaySignature: { type: String, sparse: true },
  status: { type: String, enum: ['created', 'success', 'failed'], required: true, default: 'created' },
  paidAt: { type: Date }
}, { timestamps: true });

const PaymentJoiSchema = Joi.object({
  ticketIds: Joi.array().items(Joi.string().hex().length(24)),
  amount: Joi.number().min(0).required(),
  method: Joi.string().valid('UPI', 'Razorpay', 'Stripe').required(),
  transactionId: Joi.string().alphanum().min(6).max(64).allow('', null),
  razorpayOrderId: Joi.string().allow(''),
  razorpayPaymentId: Joi.string().allow(''),
  razorpaySignature: Joi.string().allow(''),
  status: Joi.string().valid('created', 'success', 'failed'),
  paidAt: Joi.date(),
  eventId: Joi.string().length(24), // <-- add this line
  tierId: Joi.string().length(24),  // <-- add this line
  quantity: Joi.number().min(1).max(5),
  transactionId: Joi.string().allow('', null).optional(),

});

module.exports = {
  Payment: mongoose.model('Payment', paymentSchema),
  PaymentJoiSchema
};
