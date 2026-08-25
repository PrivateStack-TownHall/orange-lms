const { submissionCriteriaScoreService } = require("../services");

class SubmissionCriteriaScoreController {
  static async create(req, res, next) {
    try {
      const score = await submissionCriteriaScoreService.create(
        req.user,
        req.body,
      );

      res.status(201).json(score);
    } catch (error) {
      next(error);
    }
  }

  static async getByAssessment(req, res, next) {
    try {
      const scores = await submissionCriteriaScoreService.findAllByAssessment(
        req.params.assessmentResultId,
      );

      res.status(200).json(scores);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const score = await submissionCriteriaScoreService.findById(
        req.params.id,
      );

      res.status(200).json(score);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const score = await submissionCriteriaScoreService.update(
        req.params.id,
        req.body,
        req.user,
      );

      res.status(200).json(score);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await submissionCriteriaScoreService.delete(req.params.id, req.user);

      res.status(200).json({
        message: "Score deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SubmissionCriteriaScoreController;
