const {
  classService,
  classUserService,
  mentorSubstitutionService,
} = require("../services");

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
      const cls = await classService.findById(req.params.id, req.user);
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

  static async createFromBlueprint(req, res, next) {
    try {
      const cls = await classService.createFromBlueprint(req.body, req.user, req.meta);
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

  static async assignReviewer(req, res, next) {
    try {
      const assignment = await classUserService.assignReviewer(
        { ClassId: req.params.id, UserId: req.body.UserId },
        req.user,
        req.meta,
      );
      res.status(201).json(assignment);
    } catch (err) {
      next(err);
    }
  }

  static async removeReviewer(req, res, next) {
    try {
      await classUserService.removeReviewer(
        req.params.classId,
        req.params.userId,
        req.user,
        req.meta,
      );
      res.json({ message: "Reviewer removed successfully" });
    } catch (err) {
      next(err);
    }
  }

  static async getUsers(req, res, next) {
    try {
      await classService.assertCanAccess(req.params.id, req.user);
      const users = await classUserService.getUsers(req.params.id);
      res.json(users);
    } catch (err) {
      next(err);
    }
  }

  static async getMentees(req, res, next) {
    try {
      await classService.assertCanAccess(req.params.id, req.user);
      const mentees = await classUserService.getMentees(req.params.id);
      res.json(mentees);
    } catch (err) {
      next(err);
    }
  }

  static async getMentor(req, res, next) {
    try {
      await classService.assertCanAccess(req.params.id, req.user);
      const mentor = await classUserService.getMentor(req.params.id);
      res.json(mentor);
    } catch (err) {
      next(err);
    }
  }

  static async getReviewers(req, res, next) {
    try {
      await classService.assertCanAccess(req.params.id, req.user);
      const reviewers = await classUserService.getReviewers(req.params.id);
      res.json(reviewers);
    } catch (err) {
      next(err);
    }
  }

  static async getMentorSubstitutions(req, res, next) {
    try {
      const substitutions = await mentorSubstitutionService.findAll(
        req.params.id,
        req.user,
      );
      res.json(substitutions);
    } catch (err) {
      next(err);
    }
  }

  static async createMentorSubstitution(req, res, next) {
    try {
      const substitution = await mentorSubstitutionService.create(
        req.params.id,
        req.body,
        req.user,
        req.meta,
      );
      res.status(201).json(substitution);
    } catch (err) {
      next(err);
    }
  }

  static async updateMentorSubstitution(req, res, next) {
    try {
      const substitution = await mentorSubstitutionService.update(
        req.params.id,
        req.params.assignmentId,
        req.body,
        req.user,
        req.meta,
      );
      res.json(substitution);
    } catch (err) {
      next(err);
    }
  }

  static async cancelMentorSubstitution(req, res, next) {
    try {
      const substitution = await mentorSubstitutionService.cancel(
        req.params.id,
        req.params.assignmentId,
        req.user,
        req.meta,
      );
      res.json(substitution);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ClassController;
