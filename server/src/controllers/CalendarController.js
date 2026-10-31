const { calendarService } = require("../services");

class CalendarController {
  static async getEvents(req, res, next) {
    try {
      const events = await calendarService.getEvents(req.user, req.query);
      res.status(200).json(events);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CalendarController;
