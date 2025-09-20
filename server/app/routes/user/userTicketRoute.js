const express = require('express');
const router = express.Router();
const UserTicketController = require('../../controller/user/UserTicketController');
const { AuthCheck } = require('../../middleware/auth');

// Legacy direct purchase (simulation)
router.post('/user/purchase', AuthCheck, UserTicketController.purchaseTicket);

// NEW: create razorpay order (returns razorpay order id & our payment record)
router.post('/user/create-order', AuthCheck, UserTicketController.createOrder);

// NEW: verify razorpay payment (called by frontend after checkout)
router.post('/user/verify-payment', AuthCheck, UserTicketController.verifyPayment);

// Get user tickets
router.get('/user/tickets', AuthCheck, UserTicketController.getUserTickets);

module.exports = router;
