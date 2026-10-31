const { meetingService } = require("../services");

class MeetingController {
  static async getByClass(req, res, next) {
    try {
      const ClassId = Number(req.params.classId);

      if (Number.isNaN(ClassId)) {
        throw new Error("Invalid ClassId");
      }

      const meetings = await meetingService.findAllByClass(ClassId);

      res.status(200).json(meetings);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const meetings = await meetingService.getAll(req.user);

      res.status(200).json(meetings);
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const meeting = await meetingService.create(
        req.user,
        req.params.classId,
        req.body,
        req.meta,
      );

      res.status(201).json(meeting);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const meeting = await meetingService.findById(req.params.id);

      res.status(200).json(meeting);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const meeting = await meetingService.update(
        req.params.id,
        req.body,
        req.user,
        req.meta,
      );

      res.status(200).json(meeting);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await meetingService.delete(req.params.id, req.user, req.meta);

      res.status(200).json({
        message: "Meeting deleted",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MeetingController;
