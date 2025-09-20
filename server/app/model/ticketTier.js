const mongoose = require('mongoose');
const Joi = require('joi');

const ticketTierSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantityAvailable: { type: Number, required: true, min: 0 },
  benefits: [String]
});

const TicketTierJoiSchema = Joi.object({
  eventId: Joi.string().hex().length(24).required(),
  name: Joi.string().min(2).max(100).required(),
  price: Joi.number().min(0).required(),
  quantityAvailable: Joi.number().min(0).required(),
  benefits: Joi.array().items(Joi.string())
});

module.exports = {
  TicketTier: mongoose.model('TicketTier', ticketTierSchema),
  TicketTierJoiSchema
};
