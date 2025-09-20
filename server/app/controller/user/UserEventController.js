const { Event } = require('../../model/event');

class UserEventController {
  static async browseEvents(req, res) {
    try {
      const events = await Event.find({ status: 'active' }).populate('ticketTiers').sort({ date: 1 });
      return res.status(200).json({
        status: true,
        message: "All events fetched successfully",
        total: events.length,
        data: events});
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getEventDetails(req, res) {
  try {
    const eventId = req.params.id;

    const event = await Event.findById(eventId).populate('ticketTiers').lean();
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.status(200).json({
        status: true,
        message: "Events fetched successfully",
        total: event.length,
        data: event});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

}

module.exports = UserEventController;
