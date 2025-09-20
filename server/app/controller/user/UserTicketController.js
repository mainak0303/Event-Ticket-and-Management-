const mongoose = require('mongoose');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Razorpay = require('razorpay');

const { Ticket, TicketJoiSchema } = require('../../model/ticket');
const { TicketTier } = require('../../model/ticketTier');
const { Event } = require('../../model/event');
const { Payment, PaymentJoiSchema } = require('../../model/payment');

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

console.log("=== RAZORPAY CONFIGURATION ===");
console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? "SET" : "MISSING");
console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "SET" : "MISSING");
console.log("Environment variables loaded:", {
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? "***" + process.env.RAZORPAY_KEY_SECRET.slice(-4) : "MISSING"
});

class UserTicketController {
  // ===== Legacy: purchaseTicket (keeps your original behavior; optional) =====
  static async purchaseTicket(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const quantity = Number(req.body.quantity) || 1;
      if (quantity < 1 || quantity > 5) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: 'Quantity must be between 1 and 5' });
      }

      const tier = await TicketTier.findById(req.body.tierId).session(session);
      if (!tier || tier.quantityAvailable < quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: 'Not enough tickets available for selected tier' });
      }

      const event = await Event.findById(req.body.eventId).session(session);
      if (!event) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: 'Event not found' });
      }

      let tickets = [];
      let payments = [];

      // create tickets and payments (one payment per ticket) - your existing behavior
      for (let i = 0; i < quantity; i++) {
        const randomSuffix = Math.random().toString(36).slice(2, 8).toUpperCase();
        const ticketCode = `EVT${event.date.getFullYear()}${String(event.date.getMonth() + 1).padStart(2, '0')}${String(event.date.getDate()).padStart(2, '0')}${randomSuffix}`;

        const ticketData = {
          userId: req.body.userId,
          eventId: req.body.eventId,
          tierId: req.body.tierId,
          ticketCode,
          paymentStatus: 'paid',
          purchasedAt: new Date(),
        };

        const { error: ticketErr } = TicketJoiSchema.validate(ticketData);
        if (ticketErr) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ error: ticketErr.message });
        }

        const ticket = new Ticket(ticketData);
        await ticket.save({ session });

        const paymentData = {
          ticketIds: [ticket._id],
          amount: tier.price,
          method: req.body.method || 'UPI',
          transactionId: 'TXN' + Math.random().toString(36).slice(2, 12).toUpperCase(),
          status: 'success'
        };
        const { error: paymentErr } = PaymentJoiSchema.validate(paymentData);
        if (paymentErr) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ error: paymentErr.message });
        }
        const payment = new Payment(paymentData);
        await payment.save({ session });

        tickets.push(ticket);
        payments.push(payment);
      }

      tier.quantityAvailable -= quantity;
      await tier.save({ session });

      await session.commitTransaction();
      session.endSession();

      // Generate PDF and send email after commit (keeps your current PDF + email logic)
      const pdfDoc = new PDFDocument({ autoFirstPage: false });
      const pdfFilename = `tickets_${req.body.userId}_${Date.now()}.pdf`;
      const pdfPath = path.join(__dirname, '..', '..', '..', 'uploads', pdfFilename);
      const writeStream = fs.createWriteStream(pdfPath);
      pdfDoc.pipe(writeStream);

      for (const ticket of tickets) {
        const tierDoc = tier; // using same tier values in legacy mode
        pdfDoc.addPage()
          .rect(30, 30, pdfDoc.page.width - 60, pdfDoc.page.height - 60).stroke('#007BFF') // border around page
          .font('Helvetica-Bold').fontSize(26).fillColor('#007BFF').text('Event Ticket', { align: 'center' })
          .moveDown(1)
          .font('Helvetica').fontSize(16).fillColor('#000')
          .text(`Ticket Code: ${ticket.ticketCode}`, { continued: false })
          .moveDown(0.5)
          .text(`Event: ${event.title}`, { continued: false, color: '#333' })
          .text(`Date: ${event.date.toDateString()}`, { continued: false })
          .text(`Time: ${event.time}`, { continued: false })
          .text(`Location: ${event.location}`)
          .moveDown(0.5)
          .fillColor('#007BFF').font('Helvetica-Bold')
          .text(`Tier: ${tierDoc.name} - ₹${tierDoc.price}`)
          .font('Helvetica').fillColor('#000')
          .text(`Quantity: 1`)
          .moveDown(1);

        const qrDataUrl = await QRCode.toDataURL(ticket.ticketCode);
        const qrImageBuffer = Buffer.from(qrDataUrl.split(",")[1], 'base64');
        pdfDoc.image(qrImageBuffer, pdfDoc.x + (pdfDoc.page.width / 2) - 75, pdfDoc.y, { fit: [150, 150], align: 'center' });

        pdfDoc.moveDown(2);
        pdfDoc.fontSize(10).fillColor('#666')
          .text('Please bring this ticket to the event entrance. Enjoy!', { align: 'center' });

      }

      pdfDoc.end();
      await new Promise(resolve => writeStream.on('finish', resolve));

      // send email
      let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: req.user.email,
        subject: `Your Tickets for ${event.title}`,
        html: `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #007BFF;">Thank you for your purchase!</h2>
      <p>You have successfully purchased <strong>${quantity}</strong> ticket(s) for <strong>${event.title}</strong>.</p>
      <p>Attached are your tickets. Please bring them to the event.</p>
      <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
      <p style="font-size: 14px; color: #666;">
        If you have any questions, feel free to reply to this email or contact our support team.
      </p>
      <p style="font-size: 12px; color: #999;">
        &copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.
      </p>
    </div>
  `,
        attachments: [{ filename: pdfFilename, path: pdfPath }],
      };


      await transporter.sendMail(mailOptions);

      return res.status(201).json({
        message: `Successfully purchased ${quantity} ticket(s)!`,
        tickets,
        payments,
      });

    } catch (err) {
      try { await session.abortTransaction(); session.endSession(); } catch (e) {/*noop*/ }
      return res.status(500).json({ error: err.message });
    }
  }

  // ===== NEW: createOrder - creates a Razorpay order & a Payment record with status 'created' =====
  // Frontend calls this to get razorpay order_id
  static async createOrder(req, res) {
    try {
      console.log("=== CREATE ORDER STARTED ===");
      console.log("Request body:", req.body);
      console.log("User:", req.user);

      const { tierId, eventId, quantity = 1 } = req.body;
      console.log("Extracted params:", { tierId, eventId, quantity });

      if (!tierId || !eventId) {
        console.log("Missing tierId or eventId");
        return res.status(400).json({ error: 'tierId and eventId required' });
      }

      const qty = Number(quantity) || 1;
      console.log("Parsed quantity:", qty);

      if (qty < 1 || qty > 5) {
        console.log("Invalid quantity:", qty);
        return res.status(400).json({ error: 'Quantity must be between 1 and 5' });
      }

      console.log("Looking for tier:", tierId);
      const tier = await TicketTier.findById(tierId);
      console.log("Tier found:", tier);

      if (!tier || tier.quantityAvailable < qty) {
        console.log("Tier not found or insufficient quantity. Available:", tier?.quantityAvailable, "Requested:", qty);
        return res.status(400).json({ error: 'Not enough tickets available for selected tier' });
      }

      console.log("Looking for event:", eventId);
      const event = await Event.findById(eventId);
      console.log("Event found:", event ? event.title : 'Not found');

      if (!event) {
        console.log("Event not found");
        return res.status(400).json({ error: 'Event not found' });
      }

      // amount in rupees, Razorpay expects paise (multiply by 100)
      const amountInRupees = tier.price * qty;
      console.log("Calculated amount:", amountInRupees, "Tier price:", tier.price, "Quantity:", qty);

      console.log("Razorpay credentials check:");
      console.log("RAZORPAY_KEY_ID exists:", !!RAZORPAY_KEY_ID);
      console.log("RAZORPAY_KEY_SECRET exists:", !!RAZORPAY_KEY_SECRET);

      if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        console.log("Missing Razorpay credentials");
        return res.status(500).json({ error: 'Payment gateway configuration error' });
      }

      console.log("Initializing Razorpay...");
      const razorpay = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET
      });

      const orderOptions = {
        amount: Math.round(amountInRupees * 100), // paise
        currency: 'INR',
        receipt: `rcpt_${Math.random().toString(36).slice(2, 10)}`, // ~12 characters
        payment_capture: 1 // auto capture
      };

      console.log("Creating Razorpay order with options:", orderOptions);

      const order = await razorpay.orders.create(orderOptions);
      console.log("Razorpay order created successfully:", order.id);

      // Create our payment record in DB with status 'created'
      const paymentData = {
        ticketIds: [], // will be set after verification
        amount: amountInRupees,
        method: 'Razorpay',
        razorpayOrderId: order.id,
        status: 'created',
        eventId: eventId,        // Store these
        tierId: tierId,          // for verification
        quantity: qty,
        transactionId: 'TEMP_' + Math.random().toString(36).substr(2, 9) // Always unique!
      };

      console.log("Payment data to validate:", paymentData);

      const { error: paymentErr } = PaymentJoiSchema.validate(paymentData);
      if (paymentErr) {
        console.log("Payment validation error:", paymentErr.message);
        return res.status(400).json({ error: paymentErr.message });
      }

      console.log("Payment data validated successfully");
      console.log("Creating payment record...");

      const payment = new Payment(paymentData);
      await payment.save();
      console.log("Payment record created:", payment._id);

      // Return order details to frontend (frontend passes order.id to Razorpay checkout)
      console.log("=== CREATE ORDER COMPLETED SUCCESSFULLY ===");
      return res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        paymentRecordId: payment._id
      });

    } catch (err) {
      console.error("=== CREATE ORDER ERROR ===");
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
      console.error("Error full:", err);

      // Check if it's a Razorpay specific error
      if (err.error) {
        console.error("Razorpay error details:", err.error);
      }

      return res.status(500).json({ error: err.message });
    }
  }

  // ===== NEW: verifyPayment - verify razorpay signature, then create tickets & finalize payment =====
  static async verifyPayment(req, res) {
    const session = await mongoose.startSession();
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: 'Missing required fields for verification' });
      }

      // verify signature using HMAC SHA256 (order_id + "|" + payment_id)
      const generated_signature = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generated_signature !== razorpay_signature) {
        return res.status(400).json({ error: 'Invalid signature — verification failed' });
      }

      // find our payment record by order id
      const paymentRecord = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
      if (!paymentRecord) {
        return res.status(400).json({ error: 'Payment record not found for this order id' });
      }

      // NOTE: we need the original purchase details (tierId, eventId, quantity).
      // There are two options:
      // 1) store these details in the payment record when createOrder is called; OR
      // 2) require frontend to send them back in the verify request.
      // For now, require frontend to send them (safer if you didn't store on createOrder).
      const { tierId, eventId, quantity } = req.body;
      if (!tierId || !eventId || !quantity) {
        return res.status(400).json({ error: 'tierId, eventId and quantity required in verify request' });
      }

      const qty = Number(quantity) || 1;
      if (qty < 1 || qty > 5) return res.status(400).json({ error: 'Quantity must be between 1 and 5' });

      // Start DB transaction to create tickets and update tier/payment atomically
      session.startTransaction();

      const tier = await TicketTier.findById(tierId).session(session);
      if (!tier || tier.quantityAvailable < qty) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: 'Not enough tickets available for selected tier' });
      }

      const event = await Event.findById(eventId).session(session);
      if (!event) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: 'Event not found' });
      }

      // create tickets
      let createdTickets = [];
      for (let i = 0; i < qty; i++) {
        const randomSuffix = Math.random().toString(36).slice(2, 8).toUpperCase();
        const ticketCode = `EVT${event.date.getFullYear()}${String(event.date.getMonth() + 1).padStart(2, '0')}${String(event.date.getDate()).padStart(2, '0')}${randomSuffix}`;

        const ticketData = {
          userId: req.user.id,
          eventId,
          tierId,
          ticketCode,
          paymentStatus: 'paid',
          purchasedAt: new Date()
        };

        const { error: ticketErr } = TicketJoiSchema.validate(ticketData);
        if (ticketErr) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ error: ticketErr.message });
        }

        const ticket = new Ticket(ticketData);
        await ticket.save({ session });
        createdTickets.push(ticket);
      }

      // deduct tier quantity
      tier.quantityAvailable -= qty;
      await tier.save({ session });

      // update payment record
      paymentRecord.ticketIds = createdTickets.map(t => t._id);
      paymentRecord.razorpayPaymentId = razorpay_payment_id;
      paymentRecord.razorpaySignature = razorpay_signature;
      paymentRecord.status = 'success';
      paymentRecord.paidAt = new Date();
      await paymentRecord.save({ session });

      await session.commitTransaction();
      session.endSession();

      // Generate PDF after commit
      const pdfDoc = new PDFDocument({ autoFirstPage: false });
      const pdfFilename = `tickets_${req.user.id}_${Date.now()}.pdf`;
      const pdfPath = path.join(__dirname, '..', '..', '..', 'uploads', pdfFilename);
      const writeStream = fs.createWriteStream(pdfPath);
      pdfDoc.pipe(writeStream);

      for (const ticket of createdTickets) {
        pdfDoc.addPage();

        // Header
        pdfDoc
          .rect(30, 30, pdfDoc.page.width - 60, 60)
          .fill('#0056b3');
        pdfDoc
          .fillColor('white')
          .font('Helvetica-Bold')
          .fontSize(28)
          .text('Event Ticket', 30, 45, { align: 'center', width: pdfDoc.page.width - 60 });

        // Ticket Code (Blue Box, readable text)
        pdfDoc
          .fillColor('#0056b3')
          .rect(40, 110, pdfDoc.page.width - 80, 30)
          .fill('#e6f0ff');
        pdfDoc
          .fillColor('#0056b3').font('Helvetica-Bold').fontSize(16)
          .text(`Ticket Code: ${ticket.ticketCode}`, 50, 115);

        // Main details (Strong color, no opacity)
        let currentY = 160;
        pdfDoc.fillColor('#222').font('Helvetica-Bold').fontSize(18)
          .text(event.title, 50, currentY);
        currentY += 26;
        pdfDoc.font('Helvetica').fontSize(14).fillColor('#222')
          .text(`Date: ${event.date.toDateString()}`, 50, currentY);
        currentY += 18;
        pdfDoc.text(`Time: ${event.time}`, 50, currentY);
        currentY += 18;
        pdfDoc.text(`Location: ${event.location}`, 50, currentY);
        currentY += 18;
        pdfDoc.text(`Tier: ${tier.name} - ₹${tier.price}`, 50, currentY);
        currentY += 18;
        pdfDoc.text(`Quantity: 1`, 50, currentY);

        // QR code (centered)
        const qrDataUrl = await QRCode.toDataURL(ticket.ticketCode);
        const qrImageBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
        const qrSize = 150;
        const qrX = pdfDoc.page.width / 2 - qrSize / 2;
        const qrY = pdfDoc.page.height - qrSize - 100;
        pdfDoc.image(qrImageBuffer, qrX, qrY, { fit: [qrSize, qrSize] });

        // Footer
        pdfDoc.font('Helvetica').fontSize(12).fillColor('#555').text(
          'Please bring this ticket to the event entrance. Enjoy!',
          40, pdfDoc.page.height - 50,
          { width: pdfDoc.page.width - 80, align: 'center' }
        );
      }


      pdfDoc.end();
      await new Promise(resolve => writeStream.on('finish', resolve));

      // send email
      let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: req.user.email,
        subject: `Your Tickets for ${event.title}`,
        html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px; background: #f9faff; color: #333;">
      <h1 style="text-align: center; color: #0056b3; font-weight: 700; margin-bottom: 10px;">Thank You for Your Purchase!</h1>
      <p style="font-size: 16px;">Hi,</p>
      <p style="font-size: 16px;">You have successfully purchased <strong>${qty}</strong> ticket(s) for the event <strong>${event.title}</strong>.</p>
      <div style="background: #e6f0ff; border-left: 6px solid #0056b3; padding: 10px 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; font-weight: 600;">Event Details:</p>
        <p style="margin: 4px 0 0 0;">Date: ${event.date.toDateString()}</p>
        <p style="margin: 4px 0 0 0;">Time: ${event.time}</p>
        <p style="margin: 4px 0 0 0;">Location: ${event.location}</p>
        <p style="margin: 4px 0 0 0;">Tier: ${tier.name} - ₹${tier.price}</p>
      </div>
      <p style="font-size: 16px;">Please find your tickets attached as a PDF. Bring the tickets to the event entrance.</p>
      <hr style="border:none; border-top: 1px solid #ccc; margin: 30px 0;">
      <p style="font-size: 14px; color: #666; text-align: center;">If you have any questions or need assistance, reply to this email or contact our support team.</p>
      <p style="font-size: 12px; color: #999; text-align: center; margin-top: 40px;">&copy; ${new Date().getFullYear()} Eventy. All rights reserved.</p>
    </div>
  `,
        attachments: [{ filename: pdfFilename, path: pdfPath }],
      };


      await transporter.sendMail(mailOptions);

      return res.json({
        message: `Payment verified and ${qty} ticket(s) issued.`,
        tickets: createdTickets,
        payment: paymentRecord
      });

    } catch (err) {
      try { await session.abortTransaction(); session.endSession(); } catch (e) { /*noop*/ }
      return res.status(500).json({ error: err.message });
    }
  }

  // Get user tickets
  static async getUserTickets(req, res) {
    try {
      // Debug incoming user
      console.log("getUserTickets called");
      console.log("Decoded req.user:", req.user);

      // ObjectId extraction
      let userId = req.user._id || req.user.id;
      console.log("Resolved userId for $match:", userId);

      // Check ObjectId validity
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        console.log("Invalid or missing user ID:", userId);
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      // Main aggregate query
      const matchStage = { userId: new mongoose.Types.ObjectId(userId) };
      console.log("Mongo $match clause:", matchStage);

      const aggregatePipeline = [
        { $match: matchStage },
        { $lookup: { from: 'events', localField: 'eventId', foreignField: '_id', as: 'event' } },
        { $lookup: { from: 'tickettiers', localField: 'tierId', foreignField: '_id', as: 'tier' } }
      ];
      console.log("Aggregate pipeline:", JSON.stringify(aggregatePipeline, null, 2));

      console.log("Searching tickets for userId =", userId);
      const count = await Ticket.countDocuments({ userId: new mongoose.Types.ObjectId(userId) });
      console.log("Count from simple find:", count);

      const ticketsRaw = await Ticket.find({ userId: new mongoose.Types.ObjectId(userId) });
      console.log("Raw ticket query result:", ticketsRaw);


      const tickets = await Ticket.aggregate(aggregatePipeline);
      console.log("Aggregate result (tickets):", tickets);

      res.json(tickets);
    } catch (err) {
      console.error("Error in getUserTickets:", err.message, err.stack);
      res.status(500).json({ error: err.message });
    }
  }

}

module.exports = UserTicketController;
