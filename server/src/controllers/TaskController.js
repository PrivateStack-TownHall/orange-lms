const { taskService, taskSubmissionService } = require("../services");

class TaskController {
  static async getByMeeting(req, res, next) {
    try {
      const tasks = await taskService.findAllByMeeting(+req.params.meetingId);

      res.json(tasks);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req, res, next) {
    try {
      const tasks = await taskService.getAll(req.user);

      res.json(tasks);
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const payload = {
        ...req.body,
        fileUrl: req.file?.path || req.body.fileUrl,
      };

      const task = await taskService.create(
        req.user,
        req.params.meetingId,
        payload,
      );

      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const task = await taskService.findById(req.params.id);

      res.json(task);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const payload = {
        ...req.body,
        fileUrl: req.file?.path || req.body.fileUrl,
      };

      const task = await taskService.update(req.params.id, payload, req.user);

      res.json(task);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      await taskService.delete(req.params.id, req.user);

      res.json({
        message: "Task deleted",
      });
    } catch (err) {
      next(err);
    }
  }

  static async submitTask(req, res, next) {
    try {
      const submission = await taskSubmissionService.create(req.user, {
        TaskId: req.params.id,
        UserId: req.user.id,
        submissionUrl: req.body.submissionUrl,
        submissionFileUrl: req.body.submissionFileUrl,
        submittedNote: req.body.submittedNote,
        submittedAt: new Date(),
      });

      res.status(201).json(submission);
    } catch (err) {
      next(err);
    }
  }

  static async getSubmissions(req, res, next) {
    try {
      const submissions = await taskSubmissionService.findAllByTask(
        req.params.id,
        req.user,
      );

      res.json(submissions);
    } catch (err) {
      next(err);
    }
  }

  // tambahan untuk new features tasksubmission
  static async getSubmissionDetail(req, res, next) {
    try {
      const submission = await taskSubmissionService.findById(
        req.params.submissionId,
        req.user,
      );

      res.json(submission);
    } catch (err) {
      next(err);
    }
  }

  static async updateSubmission(req, res, next) {
    try {
      const submission = await taskSubmissionService.update(
        req.params.submissionId,
        {
          submissionUrl: req.body.submissionUrl,
          submissionFileUrl: req.body.submissionFileUrl,
          submittedNote: req.body.submittedNote,
        },
        req.user,
      );

      res.json(submission);
    } catch (err) {
      next(err);
    }
  }

  static async reviewSubmission(req, res, next) {
    try {
      const submission = await taskSubmissionService.update(
        req.params.submissionId,
        {
          score: req.body.score,
          feedback: req.body.feedback,
          status: "Reviewed",
          reviewedAt: new Date(),
        },
        req.user,
      );

      res.json(submission);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = TaskController;
