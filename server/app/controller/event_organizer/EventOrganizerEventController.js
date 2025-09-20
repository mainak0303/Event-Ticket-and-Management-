const Category = require('../../model/category');
const { Event, EventJoiSchema } = require('../../model/event');
const { Ticket, TicketJoiSchema } = require('../../model/ticket');
const { TicketTier, TicketTierJoiSchema } = require('../../model/ticketTier');
const mongoose = require('mongoose');

class EventOrganizerController {

  static async createEvent(req, res) {
    try {
      console.log("createEvent called with body:", req.body);
      console.log("User ID:", req.user._id);

      // Prepare event data
      const data = {
        title: req.body.title,
        date: req.body.date,
        time: req.body.time,
        location: req.body.location,
        category: req.body.category,
        subcategory: req.body.subcategory,
        organizer: req.body.organizer,
        description: req.body.description,
        banner: req.file ? req.file.filename : null,   // Use uploaded file's filename
        status: 'inactive',            // Default inactive until approved & activated
        createdBy: req.user._id       // Owner link
      };

      // Validate event data (only event fields)
      const { error } = EventJoiSchema.validate(data);
      if (error) {
        console.log("Validation error:", error.message);
        req.flash('error', error.message);
        return res.redirect('/organizer/events/new');
      }

      // Save event document
      const event = new Event(data);
      await event.save();
      console.log("Event saved:", event);

      // Remove any existing ticket tiers for this event (clean slate)
      await TicketTier.deleteMany({ eventId: event._id });

      const tierCount = Array.isArray(req.body.tierName) ? req.body.tierName.length : 0;
      console.log("Number of ticket tiers:", tierCount);

      // Process ticket tiers
      for (let i = 0; i < tierCount; i++) {
        // Prepare ticket tier data, convert eventId to string for Joi validation
        const tierData = {
          eventId: event._id.toString(),
          name: Array.isArray(req.body.tierName) ? req.body.tierName[i] : req.body.tierName,
          price: parseFloat(Array.isArray(req.body.tierPrice) ? req.body.tierPrice[i] : req.body.tierPrice),
          quantityAvailable: parseInt(Array.isArray(req.body.tierQty) ? req.body.tierQty[i] : req.body.tierQty),
          benefits: Array.isArray(req.body.tierBenefits)
            ? req.body.tierBenefits[i].split(',').map(b => b.trim())
            : []
        };

        // Validate tier data
        const { error: tierError } = TicketTierJoiSchema.validate(tierData);
        if (tierError) {
          console.log("Tier validation failed:", tierError.message);
          // Rollback event if any tier validation fails
          await Event.findByIdAndDelete(event._id);
          req.flash('error', `Ticket tier validation failed: ${tierError.message}`);
          return res.redirect('/organizer/events/new');
        }

        // Save ticket tier with original eventId as ObjectId
        const tierDoc = {
          ...tierData,
          eventId: event._id
        };
        const tier = new TicketTier(tierDoc);
        await tier.save();
        console.log("Saved ticket tier:", tier);
      }

      console.log("Event creation completed successfully.");
      req.flash('success', 'Event created successfully and pending approval.');
      return res.redirect('/organizer/dashboard');

    } catch (err) {
      console.error("Error during event creation:", err);
      req.flash('error', 'Failed to create event.');
      return res.redirect('/organizer/events/new');
    }
  }


  static async getEvents(req, res) {
    try {
      const { date, time, location, category, subcategory } = req.query;
      const filter = { createdBy: req.user._id };

      // Date filter as range (start to end of the selected day)
      if (date && date.trim() !== '') {
        const start = new Date(date);
        const end = new Date(date);
        end.setDate(end.getDate() + 1);
        filter.date = { $gte: start, $lt: end };
      }

      if (time && time.trim() !== '') {
        filter.time = time;
      }

      if (location && location.trim() !== '') {
        filter.location = { $regex: location, $options: 'i' }; // Partial, case-insensitive match
      }

      if (category && category.trim() !== '') {
        filter.category = category;
      }

      if (subcategory && subcategory.trim() !== '') {
        filter.subcategory = { $regex: subcategory, $options: 'i' };
      }

      console.log("Applying filters:", filter);

      // Fetch events with category populated
      const events = await Event.find(filter).populate('category').lean();

      // For each event, fetch the ticket tiers
      for (let event of events) {
        event.tiers = await TicketTier.find({ eventId: event._id }).lean();
      }

      // Fetch categories for filter dropdown
      const categories = await Category.find({}).lean();

      // Render the list view with events, categories and current filters
      return res.render('event_organizer/list', {
        events,
        categories,
        organizer: req.user,
        filters: { date, time, location, category, subcategory },
        success: req.flash('success'),
        error: req.flash('error')
      });

    } catch (error) {
      console.error("Error fetching events:", error);
      req.flash('error', 'Failed to fetch events');
      return res.redirect('/organizer/dashboard');
    }
  }


  static async editEvent(req, res) {
    try {
      const event = await Event.findOne({ _id: req.params.id, createdBy: req.user._id });
      if (!event) {
        req.flash('error', 'Event not found or unauthorized');
        return res.redirect('/organizer/events');
      }

      // Load ticket tiers for this event
      const tiers = await TicketTier.find({ eventId: event._id }).lean();

      const categories = await Category.find({}).lean();


      res.render('event_organizer/edit', { event, tiers, categories, event_organizer: req.user, success: req.flash('success'), error: req.flash('error') });
    } catch (err) {
      req.flash('error', 'Failed to load event');
      res.redirect('/organizer/events');
    }
  }


  static async updateEvent(req, res) {
    try {
      console.log("UpdateEvent called with ID:", req.params.id);
      console.log("Request body:", req.body);
      console.log("User ID:", req.user._id);

      // Find event owned by user
      const event = await Event.findOne({ _id: req.params.id, createdBy: req.user._id });
      if (!event) {
        console.log("Event not found or unauthorized");
        req.flash("error", "Event not found or unauthorized");
        return res.redirect("/organizer/events");
      }

      // Prepare event data (exclude ticket tiers)
      const data = {
        title: req.body.title,
        date: req.body.date,
        time: req.body.time,
        location: req.body.location,
        category: req.body.category,
        subcategory: req.body.subcategory,
        organizer: req.body.organizer,
        description: req.body.description,
        banner: req.file ? req.file.filename : event.banner, // Use new upload or keep old
        status: event.status, // Retain existing status unless changed elsewhere
        createdBy: req.user._id,
      };

      // Validate event data
      const { error } = EventJoiSchema.validate(data);
      if (error) {
        console.log("Validation error:", error.message);
        req.flash("error", error.message);
        return res.redirect(`/organizer/events/edit/${req.params.id}`);
      }

      // Update event document
      await Event.findByIdAndUpdate(req.params.id, data);
      console.log("Event updated:", data);

      // Remove existing tiers for fresh insert
      await TicketTier.deleteMany({ eventId: req.params.id });
      console.log("Deleted existing ticket tiers");

      // Process ticket tiers
      const tierCount = Array.isArray(req.body.tierName) ? req.body.tierName.length : 0;
      console.log("Number of tiers to add:", tierCount);

      for (let i = 0; i < tierCount; i++) {
        const tierData = {
          eventId: req.params.id,
          name: Array.isArray(req.body.tierName) ? req.body.tierName[i] : req.body.tierName,
          price: parseFloat(Array.isArray(req.body.tierPrice) ? req.body.tierPrice[i] : req.body.tierPrice),
          quantityAvailable: parseInt(Array.isArray(req.body.tierQty) ? req.body.tierQty[i] : req.body.tierQty),
          benefits: Array.isArray(req.body.tierBenefits)
            ? req.body.tierBenefits[i].split(',').map(b => b.trim())
            : []
        };

        // Validate tier data
        const { error: tierError } = TicketTierJoiSchema.validate(tierData);
        if (tierError) {
          console.log("Tier validation failed:", tierError.message);
          req.flash("error", `Ticket tier validation failed: ${tierError.message}`);
          return res.redirect(`/organizer/events/edit/${req.params.id}`);
        }

        // Save new ticket tier
        const tier = new TicketTier(tierData);
        await tier.save();
        console.log("Saved ticket tier:", tier);
      }

      req.flash("success", "Event updated successfully");
      return res.redirect("/organizer/events");

    } catch (err) {
      console.error("Error updating event:", err);
      req.flash("error", "Failed to update event");
      return res.redirect(`/organizer/events/edit/${req.params.id}`);
    }
  }



  static async activateEvent(req, res) {
    try {
      const event = await Event.findOne({ _id: req.params.id, createdBy: req.user._id });
      if (!event) {
        req.flash('error', 'Event not found or unauthorized');
        return res.redirect('/organizer/events');
      }
      if (event.approvalStatus !== 'approved') {
        req.flash('error', 'Event not approved by admin');
        return res.redirect('/organizer/events');
      }
      event.status = 'active';
      await event.save();
      req.flash('success', 'Event activated');
      res.redirect('/organizer/events');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to activate event');
      res.redirect('/organizer/events');
    }
  }

  static async deactivateEvent(req, res) {
    try {
      const event = await Event.findOne({ _id: req.params.id, createdBy: req.user._id });
      if (!event) {
        req.flash('error', 'Event not found or unauthorized');
        return res.redirect('/organizer/events');
      }
      event.status = 'inactive';
      await event.save();
      req.flash('success', 'Event deactivated');
      res.redirect('/organizer/events');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to deactivate event');
      res.redirect('/organizer/events');
    }
  }

  static async deleteEvent(req, res) {
    try {
      const event = await Event.findOne({ _id: req.params.id, createdBy: req.user._id });
      if (!event) {
        req.flash('error', 'Event not found or unauthorized');
        return res.redirect('/organizer/events');
      }
      await TicketTier.deleteMany({ eventId: event._id });
      await event.deleteOne();
      req.flash('success', 'Event deleted');
      res.redirect('/organizer/events');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to delete event');
      res.redirect('/organizer/events');
    }
  }

  static async renderAddEventForm(req, res) {
    try {
      const categories = await Category.find({}).lean();
      return res.render('event_organizer/add', {
        organizer: req.user,
        categories,
        success: req.flash('success'),
        error: req.flash('error'),
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load categories');
      return res.redirect('/organizer/events');
    }
  }

}

module.exports = EventOrganizerController;
