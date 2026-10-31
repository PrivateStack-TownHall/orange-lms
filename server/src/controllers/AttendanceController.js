const { attendanceService } = require("../services");

class AttendanceController {
  static async getAll(req, res, next) {
    try {
      const attendances = await attendanceService.findAll(req.user);

      res.status(200).json(attendances);
    } catch (error) {
      next(error);
    }
  }

  static async mark(req, res, next) {
    try {
      const payload = {
        ...req.body,
        ...(req.file ? { evidenceUrl: req.file.path } : {}),
      };

      const attendance = await attendanceService.markAttendance(
        req.user,
        payload,
        req.meta,
      );

      res.status(201).json(attendance);
    } catch (error) {
      next(error);
    }
  }

  static async getByMeeting(req, res, next) {
    try {
      const attendances = await attendanceService.findAllByMeeting(
        req.params.meetingId,
        req.user,
      );

      res.status(200).json(attendances);
    } catch (error) {
      next(error);
    }
  }

  static async getByUser(req, res, next) {
    try {
      const attendances = await attendanceService.findByUser(
        req.params.userId,
        req.user,
      );

      res.status(200).json(attendances);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const payload = {
        ...req.body,
        ...(req.file ? { evidenceUrl: req.file.path } : {}),
      };

      const attendance = await attendanceService.updateStatus(
        req.params.id,
        payload,
        req.user,
        req.meta,
      );

      res.status(200).json(attendance);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await attendanceService.delete(req.params.id, req.user, req.meta);

      res.status(200).json({
        message: "Attendance deleted",
      });
    } catch (error) {
      next(error);
    }
  }

  // tambahan new feature
  static async getById(req, res, next) {
    try {
      const attendance = await attendanceService.findById(
        req.params.id,
        req.user,
      );

      res.status(200).json(attendance);
    } catch (error) {
      next(error);
    }
  }

  static async getSummary(req, res, next) {
    try {
      const summary = await attendanceService.getSummary(
        req.params.meetingId,
        req.user,
      );

      res.status(200).json(summary);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AttendanceController;
