const { classService, classUserService } = require("../services");

class ClassController {
  static async getAll(req, res, next) {
    try {
      const classes = await classService.getAll(req.user);
      res.json(classes);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const cls = await classService.findById(req.params.id);
      res.json(cls);
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const cls = await classService.create(req.body, req.user, req.meta);
      res.status(201).json(cls);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const cls = await classService.update(
        req.params.id,
        req.body,
        req.user,
        req.meta,
      );
      res.json(cls);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      await classService.delete(req.params.id, req.user, req.meta);
      res.json({ message: "Class deleted" });
    } catch (err) {
      next(err);
    }
  }

  static async enrollMentee(req, res, next) {
    try {
      const enrollment = await classUserService.enrollMentee(
        {
          ClassId: req.params.id,
          UserId: req.body.UserId,
        },
        req.user,
        req.meta,
      );
      res.json(enrollment);
    } catch (err) {
      next(err);
    }
  }

  // Bulk Insert Mentees
  static async enrollMentees(req, res, next) {
    try {
      const enrollments = await classUserService.enrollMentees(
        req.params.id,
        req.body.UserIds,
        req.user,
        req.meta,
      );

      res.json(enrollments);
    } catch (err) {
      next(err);
    }
  }

  static async removeMentee(req, res, next) {
    try {
      await classUserService.removeMentee(
        req.params.classId,
        req.params.userId,
        req.user,
        req.meta,
      );

      res.json({
        message: "Mentee removed successfully",
      });
    } catch (err) {
      next(err);
    }
  }
  static async assignMentor(req, res, next) {
    try {
      const result = await classUserService.assignMentor(
        {
          ClassId: req.params.id,
          UserId: req.body.UserId,
        },
        req.user,
        req.meta,
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getUsers(req, res, next) {
    try {
      const users = await classUserService.getUsers(req.params.id);
      res.json(users);
    } catch (err) {
      next(err);
    }
  }

  static async getMentees(req, res, next) {
    try {
      const mentees = await classUserService.getMentees(req.params.id);
      res.json(mentees);
    } catch (err) {
      next(err);
    }
  }

  static async getMentor(req, res, next) {
    try {
      const mentor = await classUserService.getMentor(req.params.id);
      res.json(mentor);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ClassController;
